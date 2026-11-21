from datetime import datetime, timedelta
from datetime import timezone as datetime_timezone
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from django.contrib.gis.geos import Point, Polygon
from django.core.cache.backends.locmem import LocMemCache
from django.utils import timezone

from demsausage.app.enums import PollingPlaceJurisdiction, PollingPlaceStatus
from demsausage.app.models import Elections, PollingPlaceNoms, PollingPlaces
from demsausage.app.sausage import election_benchmark
from demsausage.app.serializers import ElectionsStatsSerializer


@pytest.fixture(autouse=True)
def no_side_effect_signals():
    # Saving elections and polling places enqueues RQ jobs and clears shared caches
    with (
        patch("demsausage.app.signals.task_regenerate_cached_election_data"),
        patch("demsausage.app.signals.clear_elections_cache"),
    ):
        yield


@pytest.fixture(autouse=True)
def local_cache(monkeypatch):
    # The real cache is memcached shared between xdist workers, and election ids collide across their databases
    cache = LocMemCache(f"benchmark-{id(object())}", {})
    monkeypatch.setattr("demsausage.app.serializers.cache", cache)
    now = datetime(2026, 11, 15, 4, tzinfo=datetime_timezone.utc)
    monkeypatch.setattr("django.utils.timezone.now", lambda: now)
    yield cache
    cache.clear()


def make_election(name, election_day, **kwargs):
    geom = Polygon.from_bbox((110.0, -45.0, 170.0, -9.0))
    geom.srid = 4326

    return Elections.objects.create(
        name=name,
        short_name=name,
        is_test=kwargs.pop("is_test", False),
        is_hidden=kwargs.pop("is_hidden", False),
        is_federal=kwargs.pop("is_federal", True),
        is_state=kwargs.pop("is_state", False),
        polling_places_loaded=True,
        election_day=election_day,
        jurisdiction=kwargs.pop("jurisdiction", PollingPlaceJurisdiction.AUS),
        geom=geom,
        **kwargs,
    )


def add_polling_places(election, total, first_data_days_out):
    """
    Create `total` active polling places. One gets noms for each entry in
    first_data_days_out, with the noms' first_report dated that many days
    before election day.
    """
    for i in range(total):
        noms = None

        if i < len(first_data_days_out):
            noms = PollingPlaceNoms.objects.create(noms={"bbq": True})
            PollingPlaceNoms.objects.filter(id=noms.id).update(
                first_report=election.election_day
                - timedelta(days=first_data_days_out[i])
            )
            PollingPlaceNoms.history.filter(id=noms.id).delete()

        PollingPlaces.objects.create(
            election=election,
            name=f"{election.name} {i}",
            address="1 Test St, Testville VIC 1234",
            state="VIC",
            wheelchair_access="Full",
            geom=Point(144.9631, -37.8136, srid=4326),
            status=PollingPlaceStatus.ACTIVE,
            noms=noms,
        )


def days_from_now(days):
    return timezone.now() + timedelta(days=days)


GOOD_HISTORY = [30, 25, 20, 15, 12, 9, 8, 5, 3, 1]


def point_at(result, days_out):
    return next(point for point in result["points"] if point["days_out"] == days_out)


@pytest.mark.django_db
def test_benchmark_uses_the_best_past_election_at_the_same_days_out():
    make_election("Federal 2016", days_from_now(-3000))
    weaker = make_election("Federal 2019", days_from_now(-2000))
    best = make_election("Federal 2022", days_from_now(-1000))
    current = make_election("Federal 2025", days_from_now(10))

    add_polling_places(weaker, 20, [30, 20, 10, 5])
    add_polling_places(best, 20, GOOD_HISTORY)
    add_polling_places(current, 2, [20])

    result = election_benchmark.get_election_benchmark(current)

    assert result["election_id"] == best.id
    assert result["today_days_out"] == 10
    assert point_at(result, 10) == {
        "days_out": 10,
        "current": 50.0,
        "reference": 25.0,
        "current_count": 1,
        "reference_count": 5,
    }
    assert point_at(result, 9)["current"] is None


@pytest.mark.django_db
def test_benchmark_excludes_by_elections_regardless_of_size():
    general = make_election("Federal 2022", days_from_now(-1000))
    by_election = make_election("Aston By-election 2023", days_from_now(-500))
    current = make_election("Federal 2025", days_from_now(10))

    add_polling_places(general, 20, GOOD_HISTORY)
    add_polling_places(by_election, 30, [30] * 30)
    add_polling_places(current, 1, [])

    result = election_benchmark.get_election_benchmark(current)

    assert result["election_id"] == general.id


@pytest.mark.django_db
def test_benchmark_only_compares_the_same_jurisdiction_and_level(caplog):
    other_state = make_election(
        "WA 2021",
        days_from_now(-1000),
        is_federal=False,
        is_state=True,
        jurisdiction=PollingPlaceJurisdiction.WA,
    )
    hidden = make_election("Federal 2019", days_from_now(-2000), is_hidden=True)
    current = make_election("Federal 2025", days_from_now(10))

    add_polling_places(other_state, 20, GOOD_HISTORY)
    add_polling_places(hidden, 20, GOOD_HISTORY)

    assert election_benchmark.get_election_benchmark(current) == {"error": True}
    assert "There is no completed comparable election available." in caplog.text


@pytest.mark.django_db
def test_missing_first_report_is_unavailable_without_an_unapproved_fallback(caplog):
    good = make_election("Federal 2019", days_from_now(-2000))
    bad = make_election("Federal 2022", days_from_now(-1000))
    current = make_election("Federal 2025", days_from_now(10))

    add_polling_places(good, 20, [30, 20, 10, 5])
    add_polling_places(bad, 20, [-5, -6, -7, -8, -9, -10, -11, -12, -13, -14])
    add_polling_places(current, 1, [])
    PollingPlaceNoms.objects.filter(polling_place__election=bad).update(
        first_report=None
    )

    result = election_benchmark.get_election_benchmark(current)

    assert result == {"error": True}
    assert (
        "Federal 2022 has polling places with data but no first-report timestamp."
        in caplog.text
    )
    assert "election_id" not in result


@pytest.mark.django_db
def test_bulk_reports_and_late_reports_are_not_reliability_errors():
    bad = make_election("Federal 2022", days_from_now(-1000))
    current = make_election("Federal 2025", days_from_now(10))

    add_polling_places(bad, 20, [30] * 8 + [-1] * 2)
    add_polling_places(current, 1, [])

    result = election_benchmark.get_election_benchmark(current)

    assert result["error"] is False
    assert point_at(result, 10)["reference"] == 40.0


@pytest.mark.django_db
def test_benchmark_returns_error_with_no_past_elections():
    current = make_election("Federal 2025", days_from_now(10))

    assert election_benchmark.get_election_benchmark(current) == {"error": True}


@pytest.mark.django_db
def test_benchmark_is_zero_when_the_election_is_today():
    best = make_election("Federal 2022", days_from_now(-1000))
    current = make_election("Federal 2025", timezone.now() + timedelta(hours=1))

    add_polling_places(best, 20, GOOD_HISTORY)
    add_polling_places(current, 1, [])

    result = election_benchmark.get_election_benchmark(current)

    assert result["today_days_out"] == 0
    assert point_at(result, 0)["reference"] == 50.0


@pytest.mark.django_db
@patch("demsausage.app.serializers.getGamifiedElectionStats", return_value=[])
def test_stats_hide_past_benchmark_when_a_newer_election_is_active(_gamified):
    best = make_election("Federal 2022", days_from_now(-1000))
    upcoming = make_election("Federal 2025", days_from_now(10))
    add_polling_places(best, 20, GOOD_HISTORY)
    add_polling_places(upcoming, 1, [])

    active_stats = ElectionsStatsSerializer(upcoming).data["stats"]
    past_stats = ElectionsStatsSerializer(best).data["stats"]

    assert active_stats["benchmark"]["election_id"] == best.id
    assert past_stats["benchmark"] is None


@pytest.mark.django_db
@patch("demsausage.app.serializers.getGamifiedElectionStats", return_value=[])
def test_election_day_activity_uses_perth_date_for_benchmark_and_cache(
    _gamified, local_cache
):
    now = datetime(2026, 11, 15, 0, tzinfo=datetime_timezone.utc)
    past = make_election(
        "Federal 2022", datetime(2022, 5, 20, 16, tzinfo=datetime_timezone.utc)
    )
    current = make_election(
        "Federal 2025", datetime(2026, 11, 14, 16, tzinfo=datetime_timezone.utc)
    )
    make_election(
        "Federal 2028", datetime(2028, 11, 14, 16, tzinfo=datetime_timezone.utc)
    )
    add_polling_places(past, 2, GOOD_HISTORY)
    add_polling_places(current, 1, [])

    with patch("django.utils.timezone.now", return_value=now):
        stats = ElectionsStatsSerializer(current).data["stats"]

    assert stats["benchmark"]["election_id"] == past.id
    assert stats["benchmark"]["is_active"] is True
    assert local_cache.get(f"election_{current.id}_stats") is None


@pytest.mark.django_db
@pytest.mark.parametrize(
    "area,legacy_name,recent_name",
    [
        (
            PollingPlaceJurisdiction.VIC,
            "Victorian Election 2018",
            "Victorian Election 2022",
        ),
        (
            PollingPlaceJurisdiction.NT,
            "Northern Territory Election 2016",
            "Northern Territory Election 2024",
        ),
        (
            PollingPlaceJurisdiction.NSW,
            "New South Wales Election 2019",
            "New South Wales Election 2023",
        ),
    ],
)
def test_only_vic_and_nt_legacy_winners_use_the_latest_reference(
    area, legacy_name, recent_name
):
    state_kwargs = {"is_federal": False, "is_state": True, "jurisdiction": area}
    legacy = make_election(legacy_name, days_from_now(-2000), **state_kwargs)
    recent = make_election(recent_name, days_from_now(-1000), **state_kwargs)
    # A future event must not become the fallback.
    make_election("Another upcoming election", days_from_now(5), **state_kwargs)
    current = make_election("Current election", days_from_now(10), **state_kwargs)
    add_polling_places(legacy, 10, [20] * 9)
    add_polling_places(recent, 34, [20])
    add_polling_places(current, 1, [])

    result = election_benchmark.get_election_benchmark(current)

    expected = legacy if area == PollingPlaceJurisdiction.NSW else recent
    assert result["election_id"] == expected.id
    assert result["total"] == (10 if expected == legacy else 34)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "special_name,area",
    [
        ("WA Senate Election 2014", PollingPlaceJurisdiction.WA),
        ("Referendum 2023", PollingPlaceJurisdiction.AUS),
    ],
)
@pytest.mark.parametrize("special_is_current", [True, False])
def test_special_events_compare_in_both_directions(
    special_name, area, special_is_current
):
    federal = area == PollingPlaceJurisdiction.AUS
    normal = make_election(
        "General election",
        days_from_now(10 if not special_is_current else -1000),
        is_federal=federal,
        is_state=not federal,
        jurisdiction=area,
    )
    special = make_election(
        special_name,
        days_from_now(10 if special_is_current else -1000),
        is_federal=federal,
        is_state=False,
        jurisdiction=area,
    )
    current, past = (special, normal) if special_is_current else (normal, special)
    add_polling_places(past, 10, [20])
    add_polling_places(current, 1, [])
    assert election_benchmark.get_election_benchmark(current)["election_id"] == past.id


@pytest.mark.django_db
@pytest.mark.parametrize(
    "name",
    [
        "Kiama By-election 2026",
        "Secret Harbour By-election 2026",
        "QLD Local Govt Elections 2024",
    ],
)
def test_excluded_events_cannot_receive_a_benchmark_even_with_state_flags(name):
    current = make_election(name, days_from_now(10), is_federal=False, is_state=True)
    past = make_election(
        "General election", days_from_now(-1000), is_federal=False, is_state=True
    )
    add_polling_places(past, 10, [20])
    assert not election_benchmark.get_benchmark_candidates(current).exists()
    assert election_benchmark.get_election_benchmark(current) is None


@pytest.mark.django_db
@patch("demsausage.app.serializers.getGamifiedElectionStats", return_value=[])
def test_deleted_and_archived_noms_do_not_affect_selection_or_current_coverage(
    _gamified,
):
    best = make_election("Best", days_from_now(-2000))
    other = make_election("Other", days_from_now(-1000))
    current = make_election("Current", days_from_now(10))
    add_polling_places(best, 2, [20])
    add_polling_places(other, 3, [20, 20, 20])
    PollingPlaceNoms.objects.filter(polling_place__election=other).update(
        deleted=True, first_report=None
    )
    add_polling_places(current, 3, [20, 20, 20])
    PollingPlaceNoms.objects.filter(polling_place__election=current).update(
        source="test-source"
    )
    deleted = PollingPlaces.objects.filter(election=current).first()
    PollingPlaceNoms.objects.filter(pk=deleted.noms_id).update(deleted=True)
    archived = (
        PollingPlaces.objects.filter(election=current).exclude(pk=deleted.pk).first()
    )
    PollingPlaces.objects.filter(pk=archived.pk).update(
        status=PollingPlaceStatus.ARCHIVED
    )

    result = ElectionsStatsSerializer(current).data["stats"]
    assert result["with_data"] == 1
    assert result["total"] == 2
    assert result["by_source"] == [{"source": "test-source", "count": 1}]
    assert result["benchmark"]["election_id"] == best.id


@pytest.mark.django_db
def test_perth_calendar_cutoff_includes_last_instant_but_not_next_midnight(monkeypatch):
    # Perth is already November 16 while UTC is still November 15.
    monkeypatch.setattr(
        "django.utils.timezone.now",
        lambda: datetime(2026, 11, 15, 17, tzinfo=datetime_timezone.utc),
    )
    current = make_election(
        "Current", datetime(2026, 11, 25, 16, tzinfo=datetime_timezone.utc)
    )
    past = make_election(
        "Past", datetime(2025, 11, 25, 16, tzinfo=datetime_timezone.utc)
    )
    same_day = make_election(
        "Today", datetime(2026, 11, 15, 16, tzinfo=datetime_timezone.utc)
    )
    add_polling_places(past, 2, [20, 20])
    ids = list(
        PollingPlaces.objects.filter(election=past).values_list("noms_id", flat=True)
    )
    # Target is November 26 Perth, ten days out; reference cutoff is November 16 Perth.
    PollingPlaceNoms.objects.filter(pk=ids[0]).update(
        first_report=datetime(
            2025, 11, 16, 15, 59, 59, 999999, tzinfo=datetime_timezone.utc
        )
    )
    PollingPlaceNoms.objects.filter(pk=ids[1]).update(
        first_report=datetime(2025, 11, 16, 16, tzinfo=datetime_timezone.utc)
    )
    add_polling_places(same_day, 1, [20])
    add_polling_places(current, 1, [])
    result = election_benchmark.get_election_benchmark(current)
    assert result["election_id"] == past.id
    assert result["today_days_out"] == 10
    assert point_at(result, 10)["reference_count"] == 1
    assert point_at(result, 10)["reference"] == 50.0


@pytest.mark.django_db
def test_ties_choose_latest_and_zero_before_first_report_is_valid():
    old = make_election("Old", days_from_now(-2000))
    recent = make_election("Recent", days_from_now(-1000))
    current = make_election("Current", days_from_now(40))
    add_polling_places(old, 4, [5])
    add_polling_places(recent, 4, [5])
    add_polling_places(current, 1, [])
    result = election_benchmark.get_election_benchmark(current)
    assert result["election_id"] == recent.id
    assert point_at(result, 40)["reference"] == 0.0


def test_reference_selection_does_not_use_id_to_break_ties():
    day = days_from_now(-1000)
    first = SimpleNamespace(
        id=1, election_day=day, benchmark_total=1, benchmark_with_data=1
    )
    second = SimpleNamespace(
        id=2, election_day=day, benchmark_total=1, benchmark_with_data=1
    )

    assert election_benchmark.pick_best_election([first, second]) is first


def test_legacy_fallback_does_not_use_id_to_break_date_ties():
    legacy = SimpleNamespace(
        name="Victorian Election 2018",
        election_day=days_from_now(-2000),
        benchmark_total=1,
        benchmark_with_data=1,
    )
    first = SimpleNamespace(
        id=1,
        election_day=days_from_now(-1000),
        benchmark_total=1,
        benchmark_with_data=0,
    )
    second = SimpleNamespace(
        id=2,
        election_day=days_from_now(-1000),
        benchmark_total=1,
        benchmark_with_data=0,
    )
    current = SimpleNamespace(jurisdiction=PollingPlaceJurisdiction.VIC)

    assert (
        election_benchmark._select_reference_election(current, [legacy, first, second])
        is first
    )


@pytest.mark.django_db
def test_reference_with_no_active_polling_places_is_unavailable(caplog):
    make_election("Empty reference", days_from_now(-1000))
    current = make_election("Current", days_from_now(10))
    assert election_benchmark.get_election_benchmark(current) == {"error": True}
    assert "Empty reference has no active polling places." in caplog.text


@pytest.mark.django_db
def test_benchmark_reflects_first_report_changes_between_calls():
    past = make_election("Past", days_from_now(-1000))
    add_polling_places(past, 1, [5])
    current = make_election("Current", days_from_now(10))
    add_polling_places(current, 1, [])

    first_result = election_benchmark.get_election_benchmark(current)
    assert point_at(first_result, 10)["reference_count"] == 0

    PollingPlaceNoms.objects.filter(
        polling_place__election=past,
    ).update(
        first_report=past.election_day - timedelta(days=15),
    )

    second_result = election_benchmark.get_election_benchmark(current)
    assert point_at(second_result, 10)["reference_count"] == 1
    assert point_at(second_result, 10)["reference"] == 100.0


@pytest.mark.django_db
def test_benchmark_uses_one_perth_today_for_reference_selection():
    past = make_election(
        "Past", datetime(2025, 11, 15, 4, tzinfo=datetime_timezone.utc)
    )
    current = make_election(
        "Current", datetime(2026, 11, 25, 4, tzinfo=datetime_timezone.utc)
    )
    add_polling_places(past, 1, [20])
    add_polling_places(current, 1, [])
    now = datetime(2026, 11, 15, 4, tzinfo=datetime_timezone.utc)

    with patch("django.utils.timezone.now", return_value=now) as mocked_now:
        result = election_benchmark.get_election_benchmark(current)

    mocked_now.assert_called_once_with()
    assert result is not None
    assert result["election_id"] == past.id


@pytest.mark.django_db
def test_series_extends_to_first_report_and_shows_election_day_rise():
    past = make_election("Past", days_from_now(-1000))
    current = make_election("Current", days_from_now(10))
    add_polling_places(past, 2, [45, 0])
    add_polling_places(current, 2, [20])

    result = election_benchmark.get_election_benchmark(current)

    assert result["points"][0]["days_out"] == 45
    assert point_at(result, 10)["current"] == 50.0
    assert point_at(result, 0)["current"] is None
    assert point_at(result, 0)["reference"] == 100.0


@pytest.mark.django_db
def test_missing_current_report_date_makes_comparison_unavailable(caplog):
    past = make_election("Past", days_from_now(-1000))
    current = make_election("Current", days_from_now(10))
    add_polling_places(past, 1, [20])
    add_polling_places(current, 1, [20])
    PollingPlaceNoms.objects.filter(polling_place__election=current).update(
        first_report=None
    )

    assert election_benchmark.get_election_benchmark(current) == {"error": True}
    assert (
        "Current has polling places with data but no first-report timestamp."
        in caplog.text
    )


@pytest.mark.django_db
@patch("demsausage.app.serializers.getGamifiedElectionStats", return_value=[])
def test_past_chart_updates_after_cached_stats_expire(_gamified):
    earlier = make_election("Earlier", days_from_now(-2000))
    latest = make_election("Latest", days_from_now(-1000))
    add_polling_places(earlier, 1, [20])
    add_polling_places(latest, 1, [20])

    with patch(
        "django.core.cache.backends.locmem.time.time", return_value=2_000_000_000
    ) as clock:
        result = ElectionsStatsSerializer(latest).data["stats"]["benchmark"]
        assert result["election_id"] == earlier.id
        assert result["is_active"] is False
        assert point_at(result, 0)["current"] == 100.0

        make_election("New election", days_from_now(10))
        clock.return_value += 3599
        assert ElectionsStatsSerializer(latest).data["stats"]["benchmark"] == result
        clock.return_value += 1
        assert ElectionsStatsSerializer(latest).data["stats"]["benchmark"] is None


@pytest.mark.django_db
def test_older_election_does_not_show_chart_but_unrelated_elections_do_not_hide_latest():
    earlier = make_election("Earlier", days_from_now(-2000))
    latest = make_election("Latest", days_from_now(-1000))
    make_election(
        "Other jurisdiction",
        days_from_now(10),
        is_federal=False,
        is_state=True,
        jurisdiction=PollingPlaceJurisdiction.WA,
    )
    add_polling_places(earlier, 1, [20])
    add_polling_places(latest, 1, [20])

    assert election_benchmark.get_election_benchmark(earlier) is None
    assert (
        election_benchmark.get_election_benchmark(latest)["election_id"] == earlier.id
    )


@pytest.mark.django_db
@patch("demsausage.app.serializers.getGamifiedElectionStats", return_value=[])
@patch(
    "demsausage.app.serializers.get_election_benchmark",
    return_value={"error": True},
)
@pytest.mark.parametrize("election_is_active", [True, False])
def test_stats_always_include_benchmark(
    _benchmark,
    _gamified,
    monkeypatch,
    election_is_active,
):
    monkeypatch.setattr(Elections, "is_active", lambda self: election_is_active)
    current = make_election("Election today", days_from_now(0))

    stats = ElectionsStatsSerializer(current).data["stats"]
    assert "benchmark" in stats
    assert stats["benchmark"] == {"error": True}
    if not election_is_active:
        assert ElectionsStatsSerializer(current).data["stats"] == stats
        _benchmark.assert_called_once()
        _gamified.assert_called_once()
