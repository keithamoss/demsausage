import json
import logging
from types import SimpleNamespace

import pytest
import requests

from demsausage import util
from demsausage.app.enums import StallSubmitterType
from demsausage.app.exceptions import BadRequest
from demsausage.app.sausage import discord, polling_places
from demsausage.app.views import election_views, stall_views


@pytest.mark.parametrize(
    ("value", "expected"),
    [(None, True), ({"items": [1, "two"]}, True), (object(), False)],
)
def test_is_jsonable_reports_serialization_errors(value, expected):
    assert util.is_jsonable(value) is expected


def test_is_jsonable_rejects_circular_data():
    value = []
    value.append(value)
    assert util.is_jsonable(value) is False


def test_is_jsonable_does_not_swallow_interrupts(mocker):
    mocker.patch.object(util.json, "dumps", side_effect=KeyboardInterrupt)
    with pytest.raises(KeyboardInterrupt):
        util.is_jsonable({})


@pytest.mark.parametrize(
    ("value", "expected"),
    [(True, True), (False, False), (1, False), ("true", False), (None, False)],
)
def test_is_noms_item_true_requires_a_boolean_true(value, expected):
    polling_place = SimpleNamespace(noms=SimpleNamespace(noms={"bbq": value}))
    assert polling_places.is_noms_item_true(polling_place, "bbq") is expected
    assert polling_places.is_noms_item_true(polling_place, "missing") is False


def test_discord_webhook_preserves_environment_prefix(mocker):
    mocker.patch.object(
        discord,
        "get_env",
        side_effect=lambda name: {
            "DISCORD_WEBHOOK_URL_PENDING_STALLS_BOT": "https://example.invalid/hook",
            "ENVIRONMENT": "staging",
        }[name],
    )
    mocker.patch.object(discord, "is_production", return_value=False)
    post = mocker.patch.object(discord.requests, "post")

    discord.send_discord_webhook_message("New stall")

    assert json.loads(post.call_args.kwargs["data"]) == {
        "content": "[staging] New stall"
    }


def test_discord_webhook_logs_network_failures_without_exposing_urls(mocker, caplog):
    mocker.patch.object(discord, "get_env", return_value="https://example.invalid/hook")
    mocker.patch.object(discord, "is_production", return_value=True)
    mocker.patch.object(
        discord.requests, "post", side_effect=requests.Timeout("sensitive-url-marker")
    )

    with caplog.at_level(logging.WARNING, logger=discord.__name__):
        discord.send_discord_webhook_message("New stall")

    assert "Failed to send Discord webhook (Timeout)" in caplog.text
    assert "sensitive-url-marker" not in caplog.text


def test_discord_webhook_does_not_hide_unexpected_errors(mocker):
    mocker.patch.object(discord, "get_env", return_value="https://example.invalid/hook")
    mocker.patch.object(discord, "is_production", return_value=True)
    mocker.patch.object(discord.requests, "post", side_effect=TypeError("unexpected"))

    with pytest.raises(TypeError, match="unexpected"):
        discord.send_discord_webhook_message("New stall")


def test_default_map_image_response_returns_image_bytes(mocker):
    opened = mocker.mock_open(read_data=b"png data")
    mocker.patch("builtins.open", opened)

    response = election_views._default_map_image_response()

    assert response.status_code == 200
    assert response.data == b"png data"
    opened.assert_called_once_with(
        "/app/demsausage/static_maps/federal_2019_australia.png", "rb"
    )


def test_default_map_image_response_logs_file_errors(mocker, caplog):
    mocker.patch("builtins.open", side_effect=FileNotFoundError("missing map"))

    with caplog.at_level(logging.ERROR, logger=election_views.__name__):
        response = election_views._default_map_image_response()

    assert response.status_code == 400
    assert "Could not read the default election map image" in caplog.text


def test_default_map_image_response_does_not_hide_unexpected_errors(mocker):
    mocker.patch("builtins.open", side_effect=TypeError("unexpected"))

    with pytest.raises(TypeError, match="unexpected"):
        election_views._default_map_image_response()


@pytest.mark.parametrize(
    ("view_class", "method", "kwargs"),
    [
        (election_views.ElectionMapStaticImageCurrentDefaultElectionViewSet, "get", {}),
        (election_views.ElectionMapStaticImageViewSet, "retrieve", {"pk": 42}),
        (election_views.ElectionMapStaticImageViewSet, "list", {}),
    ],
)
def test_map_views_queue_generation_and_return_the_default_image(
    mocker, view_class, method, kwargs
):
    mocker.patch.object(
        election_views, "get_default_election", return_value=SimpleNamespace(id=42)
    )
    job = mocker.patch.object(election_views, "task_generate_election_map_screenshot")
    response = mocker.sentinel.response
    image = mocker.patch.object(
        election_views, "_default_map_image_response", return_value=response
    )

    result = getattr(view_class(), method)(None, **kwargs)

    assert result is response
    job.delay.assert_called_once_with(election_id=42)
    image.assert_called_once_with()


@pytest.mark.django_db
def test_missing_stall_serializer_reports_submitter_type(mocker):
    elections = mocker.patch.object(stall_views, "get_active_elections").return_value
    elections.filter.return_value.count.return_value = 1
    mocker.patch.object(
        stall_views, "StallsTipOffManagementSerializer", return_value=None
    )
    request = SimpleNamespace(
        data={"election": 1, "submitter_type": StallSubmitterType.TIPOFF}
    )

    with pytest.raises(BadRequest, match="submitter_type 'tipoff'"):
        stall_views.StallsViewSet().create(request)
