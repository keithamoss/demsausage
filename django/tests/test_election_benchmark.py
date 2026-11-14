from datetime import timedelta
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
    monkeypatch.setattr(election_benchmark, "cache", cache)
    monkeypatch.setattr("demsausage.app.serializers.cache", cache)
    monkeypatch.setattr(election_benchmark, "MIN_BENCHMARK_POLLING_PLACES", 5)
    yield
    cache.clear()


def make_election(name, election_day, **kwargs):
    geom = Polygon.from_bbox((110.0, -45.0, 170.0, -9.0))
    geom.srid = 4326

    return Elections.objects.create(
        name=name,
        short_name=name,
        is_test=False,
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
    first_data_days_out, with the noms' first history row dated that many days
    before election day.
    """
    for i in range(total):
        noms = None

        if i < len(first_data_days_out):
            noms = PollingPlaceNoms.objects.create(noms={"bbq": True})
            PollingPlaceNoms.history.filter(id=noms.id).update(
                history_date=election.election_day
                - timedelta(days=first_data_days_out[i])
            )

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
    # An extra hour so (election_day - now).days is exactly `days` however long the test takes
    return timezone.now() + timedelta(days=days, hours=1)


GOOD_HISTORY = [30, 25, 20, 15, 12, 9, 8, 5, 3, 1]


@pytest.mark.django_db
def test_benchmark_uses_the_best_past_election_at_the_same_days_out():
    make_election("Federal 2016", days_from_now(-3000))
    weaker = make_election("Federal 2019", days_from_now(-2000))
    best = make_election("Federal 2022", days_from_now(-1000))
    current = make_election("Federal 2025", days_from_now(10))

    add_polling_places(weaker, 20, [30, 20, 10, 5])
    add_polling_places(best, 20, GOOD_HISTORY)

    result = election_benchmark.get_election_benchmark(current)

    assert result == {
        "error": None,
        "election_id": best.id,
        "election_name": "Federal 2022",
        "days_out": 10,
        # 30, 25, 20, 15 and 12 days out are all at or before 10 days out
        "pct": 25.0,
        "with_data": 5,
        "total": 20,
    }


@pytest.mark.django_db
def test_benchmark_ignores_small_elections_such_as_by_elections(monkeypatch):
    monkeypatch.setattr(election_benchmark, "MIN_BENCHMARK_POLLING_PLACES", 15)

    general = make_election("Federal 2022", days_from_now(-1000))
    by_election = make_election("Federal Aston By-election", days_from_now(-500))
    current = make_election("Federal 2025", days_from_now(10))

    add_polling_places(general, 20, GOOD_HISTORY)
    add_polling_places(by_election, 6, [30, 25, 20, 15, 12, 9])

    result = election_benchmark.get_election_benchmark(current)

    assert result["election_id"] == general.id


@pytest.mark.django_db
def test_benchmark_only_compares_the_same_jurisdiction_and_level(monkeypatch):
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

    assert election_benchmark.get_election_benchmark(current) is None


@pytest.mark.django_db
def test_benchmark_reports_an_error_rather_than_falling_back_when_the_best_election_has_bad_history():
    good = make_election("Federal 2019", days_from_now(-2000))
    bad = make_election("Federal 2022", days_from_now(-1000))
    current = make_election("Federal 2025", days_from_now(10))

    add_polling_places(good, 20, [30, 20, 10, 5])
    # Everything entered after election day looks like a backfill
    add_polling_places(bad, 20, [-5, -6, -7, -8, -9, -10, -11, -12, -13, -14])

    result = election_benchmark.get_election_benchmark(current)

    assert result["error"] is not None
    assert "Federal 2022" in result["error"]
    assert "election_id" not in result


@pytest.mark.django_db
def test_benchmark_flags_a_single_day_bulk_import():
    bad = make_election("Federal 2022", days_from_now(-1000))
    current = make_election("Federal 2025", days_from_now(10))

    add_polling_places(bad, 20, [30] * 10)

    result = election_benchmark.get_election_benchmark(current)

    assert "single day" in result["error"]


@pytest.mark.django_db
def test_benchmark_is_none_with_no_past_elections():
    current = make_election("Federal 2025", days_from_now(10))

    assert election_benchmark.get_election_benchmark(current) is None


@pytest.mark.django_db
def test_benchmark_is_zero_when_the_election_is_today():
    best = make_election("Federal 2022", days_from_now(-1000))
    current = make_election("Federal 2025", timezone.now() + timedelta(hours=1))

    add_polling_places(best, 20, GOOD_HISTORY)

    result = election_benchmark.get_election_benchmark(current)

    assert result["days_out"] == 0
    assert result["pct"] == 50.0


@pytest.mark.django_db
@patch("demsausage.app.serializers.getGamifiedElectionStats", return_value=[])
def test_stats_include_the_benchmark_only_for_active_elections(_gamified):
    best = make_election("Federal 2022", days_from_now(-1000))
    upcoming = make_election("Federal 2025", days_from_now(10))
    add_polling_places(best, 20, GOOD_HISTORY)

    active_stats = ElectionsStatsSerializer(upcoming).data["stats"]
    past_stats = ElectionsStatsSerializer(best).data["stats"]

    assert active_stats["benchmark"]["election_id"] == best.id
    assert "benchmark" not in past_stats
