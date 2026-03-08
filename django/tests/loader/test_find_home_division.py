"""
Phase 1 — _find_home_division tests within dedupe_polling_places.

_find_home_division is called when two or more polling places share the same
coordinates and the CSV has a divisions column.  Its behaviour depends on the
multiple_division_handling configuration:

Tests (4):
  1. USE_ELECTORAL_BOUNDARIES happy path: point within one boundary → home
     division matches the boundary's division_name; merged row has it first.
  2. USE_ELECTORAL_BOUNDARIES no-match: point outside all boundaries → error.
  3. USE_ELECTORAL_BOUNDARIES multi-match: point inside two overlapping
     boundaries → error.
  4. No multiple_division_handling config (fallback): first division in the
     first polling place's list is used as home division; no error.

All tests supply two rows at the same coordinates with different divisions so
that the dedup path that calls _find_home_division is exercised.
"""

import pytest
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import ElectoralBoundaries, PollingPlaces
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_dry, run_loader_full

from django.contrib.gis.geos import MultiPolygon, Polygon

# Melbourne CBD — within the electoral_boundaries fixture polygon
MELB_LAT = "-37.8136"
MELB_LON = "144.9631"

# Perth CBD — within Australia's election bbox but outside the Hotham boundary
PERTH_ROW = {
    **MINIMAL_ROW,
    "state": "WA",
    "lat": "-31.9505",
    "lon": "115.8605",
}

USE_EB_CONFIG = {
    "multiple_division_handling": {
        "determine_home_division": "USE_ELECTORAL_BOUNDARIES"
    }
}


def _two_rows_at_same_location(base_row=None, div1="Hotham", div2="Richmond"):
    """Return two CSV rows at the same coordinates with different divisions."""
    base = base_row or MINIMAL_ROW
    return [
        {**base, "divisions": div1},
        {**base, "divisions": div2},
    ]


# ---------------------------------------------------------------------------
# 1. USE_ELECTORAL_BOUNDARIES — happy path
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_use_electoral_boundaries_happy_path(test_election, electoral_boundaries):
    """When the PP's coordinates fall inside exactly one ElectoralBoundaries
    polygon, that polygon's division_name becomes the home division.

    The electoral_boundaries fixture creates a 'Hotham' boundary covering
    Melbourne CBD (-37.8136, 144.9631).  After the dedup merge the resulting
    ACTIVE polling place should list 'Hotham' first in its divisions array.
    """
    rows = _two_rows_at_same_location(div1="Hotham", div2="Richmond")
    run_loader_full(test_election, make_csv(rows), config=USE_EB_CONFIG)

    count = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    ).count()
    assert count == 1, f"Expected 1 ACTIVE PP after dedup merge, got {count}"

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.divisions, "Expected a non-empty divisions list"
    assert (
        pp.divisions[0] == "Hotham"
    ), f"Expected 'Hotham' as home division (first element) but got: {pp.divisions}"


# ---------------------------------------------------------------------------
# 2. USE_ELECTORAL_BOUNDARIES — no matching boundary
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_use_electoral_boundaries_no_match_logs_error(
    test_election, electoral_boundaries
):
    """When the PP's coordinates fall outside all ElectoralBoundaries polygons,
    _find_home_division logs an error and the loader bails."""
    # Perth is registered to the test_election in the fixture's election_ids,
    # but geographically outside the Hotham boundary (which covers Melbourne).
    rows = _two_rows_at_same_location(
        base_row=PERTH_ROW, div1="Hotham", div2="Richmond"
    )
    logs = run_loader_dry(test_election, make_csv(rows), config=USE_EB_CONFIG)

    assert any(
        "no matching division" in m.lower() or "found no matching" in m.lower()
        for m in logs.get("errors", [])
    ), f"Expected no-matching-division error; errors={logs.get('errors')}"


# ---------------------------------------------------------------------------
# 3. USE_ELECTORAL_BOUNDARIES — multiple matching boundaries
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_use_electoral_boundaries_multi_match_logs_error(
    test_election, electoral_boundaries
):
    """When the PP's coordinates fall inside TWO ElectoralBoundaries polygons,
    _find_home_division logs an error (ambiguous home division)."""
    # Add a second boundary that also covers Melbourne CBD
    ElectoralBoundaries.objects.create(
        loader_id="test_2026_second",
        geom=MultiPolygon(Polygon.from_bbox((144.0, -39.0, 146.0, -37.0))),
        election_ids=[test_election.id],
        division_name="Goldstein",
        state="VIC",
    )

    rows = _two_rows_at_same_location(div1="Hotham", div2="Goldstein")
    logs = run_loader_dry(test_election, make_csv(rows), config=USE_EB_CONFIG)

    assert any(
        "more than one" in m.lower() or "found more than one" in m.lower()
        for m in logs.get("errors", [])
    ), f"Expected multi-match division error; errors={logs.get('errors')}"


# ---------------------------------------------------------------------------
# 4. First-division fallback (no multiple_division_handling config)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_first_division_fallback_no_error(test_election):
    """Without multiple_division_handling config, _find_home_division falls
    back to the first element of the first polling place's divisions list.
    No error is logged and the dedup merge completes successfully."""
    rows = _two_rows_at_same_location(
        div1="Southern Division", div2="Northern Division"
    )
    # No multiple_division_handling in config → fallback path
    run_loader_full(test_election, make_csv(rows), config=None)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.divisions, "Expected a non-empty divisions list"
    # Home division is the FIRST division of the FIRST row ("Southern Division")
    assert pp.divisions[0] == "Southern Division", (
        f"Expected 'Southern Division' first (fallback=first row first div); "
        f"got {pp.divisions}"
    )
