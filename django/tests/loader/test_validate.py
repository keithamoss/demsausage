"""
Phase 1 — check_file_validity and dedupe_polling_places tests.

Tests (7 + 1 xfail):
  1. Required header field missing → error
  2. Duplicate ec_id in CSV → error
  3. Some blank ec_ids while others are filled → warning
  4. Two rows at same lat/lon WITH divisions column → merged (no error)
  5. Two rows at same lat/lon WITHOUT divisions column → one discarded (no error)
  6. Two rows at same lat/lon but different names → error
  7. Two rows at different lat/lon but same name+premises+address → error
  xfail: dedup merge without extras config stores '' instead of {} in extras
         (Bug: _merge_and_sum_extras returns empty string not empty dict)
"""

import pytest
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import PollingPlaces
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_dry, run_loader_full

# A second location close to but NOT at the same coordinates as MINIMAL_ROW.
# Used for "same name, different location" tests.
NEARBY_ADDR = "2 Test St, Testville VIC 1234"
DISTANT_LON = "144.9731"  # ~800 m east of MINIMAL_ROW


# ---------------------------------------------------------------------------
# 1. Missing required header field
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_required_field_missing_in_header(test_election):
    """Removing a required model field from the CSV header is caught by
    check_file_header_validity and logged as an [ERROR]."""
    # Build a row that is missing wheelchair_access (blank=False in the model)
    row = {k: v for k, v in MINIMAL_ROW.items() if k != "wheelchair_access"}
    logs = run_loader_dry(test_election, make_csv([row]))
    assert any(
        "wheelchair_access" in m for m in logs.get("errors", [])
    ), f"Expected missing-field error for wheelchair_access; errors={logs.get('errors')}"


# ---------------------------------------------------------------------------
# 2. Duplicate ec_id
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_duplicate_ec_id_logs_error(test_election):
    """Two polling places sharing the same non-blank ec_id are detected by
    check_ec_id_is_unique and logged as an [ERROR]."""
    rows = [
        {**MINIMAL_ROW, "ec_id": "123"},
        {**MINIMAL_ROW, "name": "Test Hall 2", "address": NEARBY_ADDR, "ec_id": "123"},
    ]
    logs = run_loader_dry(test_election, make_csv(rows))
    assert any(
        "ec_id_duplicate" in m for m in logs.get("errors", [])
    ), f"Expected non-unique-ec_id error; errors={logs.get('errors')}"


# ---------------------------------------------------------------------------
# 3. Blank ec_ids with some filled → warning
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_blank_ec_id_with_some_filled_logs_warning(test_election):
    """When some polling places have a non-blank ec_id and others have a blank
    ec_id, check_ec_id_is_unique logs a [WARNING]."""
    rows = [
        {**MINIMAL_ROW, "ec_id": "999"},  # filled
        {
            **MINIMAL_ROW,
            "name": "No EC Hall",
            "address": NEARBY_ADDR,
            "ec_id": "",
        },  # blank
    ]
    logs = run_loader_dry(test_election, make_csv(rows))
    assert any(
        "blank ec_id" in m.lower() for m in logs.get("warnings", [])
    ), f"Expected blank-ec_id warning; warnings={logs.get('warnings')}"


# ---------------------------------------------------------------------------
# 4. Dedup merge — same lat/lon WITH divisions column
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_dedup_merge_combines_divisions(test_election):
    """Two polling places at the same coordinates with a divisions column are
    deduplicated: divisions are merged and only one row is written to the DB.
    No error is logged."""
    rows = [
        {**MINIMAL_ROW, "divisions": "Hotham"},
        {**MINIMAL_ROW, "divisions": "Richmond"},  # same lat/lon as row 1
    ]
    run_loader_full(test_election, make_csv(rows))

    count = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    ).count()
    assert count == 1, f"Expected 1 ACTIVE PP after dedup merge, got {count}"

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert (
        "Hotham" in pp.divisions and "Richmond" in pp.divisions
    ), f"Merged PP should contain both original divisions; divisions={pp.divisions}"


# ---------------------------------------------------------------------------
# 5. Dedup discard — same lat/lon WITHOUT divisions column
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_dedup_discard_drops_duplicate_row(test_election):
    """Two polling places at the same coordinates but WITHOUT a divisions column
    are deduplicated by discarding all but the first row.  One ACTIVE PP results."""
    # No 'divisions' column in these rows — triggers the discard branch
    rows = [
        MINIMAL_ROW,
        {**MINIMAL_ROW},  # exact duplicate
    ]
    run_loader_full(test_election, make_csv(rows))

    count = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    ).count()
    assert count == 1, f"Expected 1 ACTIVE PP after dedup discard, got {count}"


# ---------------------------------------------------------------------------
# 6. Same location, different names → error
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_same_location_different_names_logs_error(test_election):
    """Two polling places with different names at the same coordinates trigger
    the 'Found multiple unique polling places sharing the same location' error."""
    rows = [
        {**MINIMAL_ROW, "name": "Alice Hall"},
        {**MINIMAL_ROW, "name": "Bob Hall"},  # same lat/lon, different name
    ]
    logs = run_loader_dry(test_election, make_csv(rows))
    assert any(
        "multiple unique polling places" in m.lower() for m in logs.get("errors", [])
    ), f"Expected same-location-different-names error; errors={logs.get('errors')}"


# ---------------------------------------------------------------------------
# 7. Post-dedup name duplicate (same name, different locations)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_post_dedup_name_duplicate_logs_error(test_election):
    """Two polling places with the same name+premises+address but at different
    coordinates survive the lat/lon dedup and are caught by the post-dedup
    name-duplicate check."""
    rows = [
        MINIMAL_ROW,  # lat=-37.8136, lon=144.9631
        {**MINIMAL_ROW, "lon": DISTANT_LON},  # same name, different lon
    ]
    logs = run_loader_dry(test_election, make_csv(rows))
    assert any(
        "same name" in m.lower() or "sharing the same name" in m.lower()
        for m in logs.get("errors", [])
    ), f"Expected post-dedup name-duplicate error; errors={logs.get('errors')}"


# ---------------------------------------------------------------------------
# xfail — Bug #1: _merge_and_sum_extras returns '' instead of {} on dedup merge
# ---------------------------------------------------------------------------


@pytest.mark.xfail(
    strict=True,
    reason=(
        "Bug: _merge_and_sum_extras returns '' (empty string) when no extras "
        "config is set, overwriting the polling place's extras with a string "
        "instead of leaving it as an empty dict {}.  The 'if \"extras\" in pp' "
        "check uses the leaked loop variable 'pp' (last element of polling_places) "
        "and falls through to return '' when no extras key exists."
    ),
)
@pytest.mark.django_db
def test_dedup_merge_extras_is_dict_not_empty_string(test_election):
    """After a dedup merge with NO extras config the merged polling place's
    extras field should be a dict (the JSONField default of {}).

    Currently _merge_and_sum_extras returns '' (empty string) when the dedup
    path is taken without an extras config, so extras ends up as a string in
    the DB.  This test documents and guards against that behaviour.
    """
    rows = [
        {**MINIMAL_ROW, "divisions": "Hotham"},
        {**MINIMAL_ROW, "divisions": "Richmond"},  # same lat/lon — triggers merge
    ]
    run_loader_full(test_election, make_csv(rows))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert isinstance(pp.extras, dict), (
        f"extras should be a dict (empty {{}}), but got "
        f"{type(pp.extras).__name__}: {pp.extras!r}\n"
        "This indicates _merge_and_sum_extras returned '' instead of {{}}."
    )
