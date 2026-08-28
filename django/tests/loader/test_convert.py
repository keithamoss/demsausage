"""
Phase 1 — transform-stage tests for convert_to_demsausage_schema,
fix_polling_places, and prepare_polling_places.

Tests are ordered to match the 12 items from the plan:
  1.  rename_columns  renames CSV header fields
  2.  address_format — 2-field merge
  3.  address_format — 3-field merge with blank middle component (", ," cleanup)
  4.  address_format — 4-field merge (wide federal-style)
  5.  extras fields folded into extras dict
  6.  fix_data_issues — overwrite a text field by matching value
  7.  fix_data_issues — overwrite lat/lon by matching name
  8.  cleaning_regexes — regex match → field trimmed
  9.  cleaning_regexes — regex miss → error logged
  10. filters (type="is_exactly") — non-matching rows removed
  11. division_fields merged into divisions list
  12. add_columns adds a value to every row
"""

import pytest
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import PollingPlaces
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_dry, run_loader_full

# ---------------------------------------------------------------------------
# 1. rename_columns
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_rename_columns(test_election):
    """rename_columns maps non-standard CSV header names to model field names.

    Without renaming, the loader would log "Unknown field" errors for every
    non-standard column.  With rename, all fields resolve and a polling place
    is written to the DB.
    """
    row = {
        "Name": "Test Hall",
        "Premises": "Test Primary School",
        "Address": "1 Test St, Testville VIC 1234",
        "State": "VIC",
        "WheelchairAccess": "Full",
        "Lat": "-37.8136",
        "Lon": "144.9631",
    }
    csv_bytes = make_csv([row])
    config = {
        "rename_columns": {
            "Name": "name",
            "Premises": "premises",
            "Address": "address",
            "State": "state",
            "WheelchairAccess": "wheelchair_access",
            "Lat": "lat",
            "Lon": "lon",
        },
        # ec_id must be injected via add_columns because the raw CSV row above
        # does not contain an ec_id column (prepare_polling_places() requires it).
        "add_columns": {"ec_id": ""},
    }

    run_loader_full(test_election, csv_bytes, config)

    count = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE, name="Test Hall"
    ).count()
    assert count == 1, "Expected 1 ACTIVE polling place after rename_columns load"


# ---------------------------------------------------------------------------
# 2–4. address_format variants
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_address_format_two_fields(test_election):
    """Two address component fields are merged into a single address string."""
    row = {
        "name": "Test Hall",
        "premises": "Test Primary School",
        "street": "1 Test St",
        "suburb_state_postcode": "Testville VIC 1234",
        "state": "VIC",
        "wheelchair_access": "Full",
        "lat": "-37.8136",
        "lon": "144.9631",
    }
    config = {
        "address_fields": ["street", "suburb_state_postcode"],
        "address_format": "{street}, {suburb_state_postcode}",
        "add_columns": {"ec_id": ""},
    }
    run_loader_full(test_election, make_csv([row]), config)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.address == "1 Test St, Testville VIC 1234"


@pytest.mark.django_db
def test_address_format_blank_middle_component_removed(test_election):
    """When a middle address component is blank the result ", ," is cleaned up.

    Format: "{street}, {apt}, {suburb}" with apt="" should produce
    "1 Test St, Testville VIC 1234" (not "1 Test St, , Testville VIC 1234").
    """
    row = {
        "name": "Test Hall",
        "premises": "Test Primary School",
        "street": "1 Test St",
        "apt": "",  # blank middle component
        "suburb": "Testville VIC 1234",
        "state": "VIC",
        "wheelchair_access": "Full",
        "lat": "-37.8136",
        "lon": "144.9631",
    }
    config = {
        "address_fields": ["street", "apt", "suburb"],
        "address_format": "{street}, {apt}, {suburb}",
        "add_columns": {"ec_id": ""},
    }
    run_loader_full(test_election, make_csv([row]), config)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert ", ," not in pp.address, f"Unexpected raw blank component in: {pp.address!r}"
    assert "1 Test St" in pp.address
    assert "Testville VIC 1234" in pp.address


@pytest.mark.django_db
def test_address_format_four_fields(test_election):
    """Four address component fields are merged (federal-style wide merge)."""
    row = {
        "name": "Test Hall",
        "premises": "Test Primary School",
        "street": "1 Test St",
        "suburb": "Testville",
        "state_col": "VIC",
        "postcode": "1234",
        "state": "VIC",
        "wheelchair_access": "Full",
        "lat": "-37.8136",
        "lon": "144.9631",
    }
    config = {
        "address_fields": ["street", "suburb", "state_col", "postcode"],
        "address_format": "{street}, {suburb} {state_col} {postcode}",
        "add_columns": {"ec_id": ""},
    }
    run_loader_full(test_election, make_csv([row]), config)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.address == "1 Test St, Testville VIC 1234"


# ---------------------------------------------------------------------------
# 5. extras
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_extras_created_from_columns(test_election):
    """extras config folds nominated columns into the extras JSON field."""
    row = {
        **MINIMAL_ROW,
        "catering": "BBQ",
        "drinks": "Coffee",
    }
    config = {"extras": {"fields": ["catering", "drinks"]}}
    run_loader_full(test_election, make_csv([row]), config)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.extras.get("catering") == "BBQ"
    assert pp.extras.get("drinks") == "Coffee"


# ---------------------------------------------------------------------------
# 6–7. fix_data_issues
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_fix_data_issues_field_value_overwrite(test_election):
    """fix_data_issues overwrites a field when the matching condition is met."""
    row = {**MINIMAL_ROW, "premises": "Old Premises Name"}
    config = {
        "fix_data_issues": [
            {
                "field": "name",
                "value": "Test Hall",
                "overwrite": [{"field": "premises", "value": "Corrected Premises"}],
            }
        ]
    }
    run_loader_full(test_election, make_csv([row]), config)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.premises == "Corrected Premises"


@pytest.mark.django_db
def test_fix_data_issues_lat_lon_overwrite(test_election):
    """fix_data_issues can overwrite lat/lon by matching on name.

    This replicates the nsw_lg_2024 pattern where coordinates in the source
    CSV are wrong for certain polling places and are corrected via config.
    """
    # Row with clearly wrong coordinates (would fail geom assignment at 0,0
    # but 0,0 is treated as "blank" by _has_blank_coordinates — use "bad" coords
    # outside Australia instead, then have fix_data_issues correct them)
    row = {
        **MINIMAL_ROW,
        "lat": "-33.8688",  # Sydney coords — wrong for "Test Hall" in VIC
        "lon": "151.2093",
    }
    config = {
        "fix_data_issues": [
            {
                "field": "name",
                "value": "Test Hall",
                "overwrite": [
                    {"field": "lat", "value": "-37.8136"},
                    {"field": "lon", "value": "144.9631"},
                ],
            }
        ]
    }
    run_loader_full(test_election, make_csv([row]), config)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    # Melbourne CBD coords, accurate to 4 decimal places
    assert abs(pp.geom.y - (-37.8136)) < 0.001, f"lat unexpected: {pp.geom.y}"
    assert abs(pp.geom.x - 144.9631) < 0.001, f"lon unexpected: {pp.geom.x}"


# ---------------------------------------------------------------------------
# 8–9. cleaning_regexes
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_cleaning_regexes_match_trims_field(test_election):
    """When the cleaning regex matches the field value is rewritten to the
    captured ``main`` group."""
    row = {**MINIMAL_ROW, "name": "HALL: Test Hall"}
    config = {"cleaning_regexes": [{"field": "name", "regex": r"HALL: (?P<main>.+)"}]}
    run_loader_full(test_election, make_csv([row]), config)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.name == "Test Hall"


@pytest.mark.django_db
def test_cleaning_regexes_no_match_logs_error(test_election):
    """When the cleaning regex does not match, an [ERROR] entry is logged and
    the loader bails before writing any polling places."""
    row = {**MINIMAL_ROW, "name": "Test Hall"}  # no "HALL: " prefix
    config = {"cleaning_regexes": [{"field": "name", "regex": r"HALL: (?P<main>.+)"}]}
    logs = run_loader_dry(test_election, make_csv([row]), config)
    # The current message format is "No regex match for {} for {}"
    assert logs.get("errors"), "Expected at least one error for regex no-match"


# ---------------------------------------------------------------------------
# 10. filters
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_filter_is_exactly_removes_non_matching_rows(test_election):
    """filter type=is_exactly keeps only rows where the column value is in the
    matches list; other rows are discarded before any DB writes."""
    rows = [
        {**MINIMAL_ROW, "name": "Open Hall", "status_col": "Open"},
        {
            **MINIMAL_ROW,
            "name": "Open Hall 2",
            "address": "2 Test St, Testville VIC 1234",
            "lat": "-37.8200",
            "status_col": "Open",
        },
        {
            **MINIMAL_ROW,
            "name": "Closed Hall",
            "address": "3 Test St, Testville VIC 1234",
            "lat": "-37.8250",
            "status_col": "Closed",
        },
    ]
    config = {
        "filters": [
            {"type": "is_exactly", "column": "status_col", "matches": ["Open"]}
        ],
        "exclude_columns": ["status_col"],
    }
    run_loader_full(test_election, make_csv(rows), config)

    count = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    ).count()
    assert count == 2, f"Expected 2 ACTIVE polling places (Open only), got {count}"
    names = set(
        PollingPlaces.objects.filter(
            election=test_election, status=PollingPlaceStatus.ACTIVE
        ).values_list("name", flat=True)
    )
    assert "Closed Hall" not in names, "Closed Hall should have been filtered out"


# ---------------------------------------------------------------------------
# 11. division_fields
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_division_fields_merged_into_divisions(test_election):
    """division_fields config merges multiple CSV columns into the divisions
    JSON list, removing the original columns."""
    row = {
        **MINIMAL_ROW,
        "div1": "Southern Division",
        "div2": "Northern Division",
    }
    config = {"division_fields": ["div1", "div2"]}
    run_loader_full(test_election, make_csv([row]), config)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert "Southern Division" in pp.divisions
    assert "Northern Division" in pp.divisions
    assert len(pp.divisions) == 2


# ---------------------------------------------------------------------------
# 12. add_columns
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_add_columns_adds_values_to_all_rows(test_election):
    """add_columns injects a constant value into every polling place row, which
    the serializer then persists to the DB."""
    # Use a two-row CSV so we can confirm the column is added to BOTH rows.
    rows = [
        MINIMAL_ROW,
        {
            **MINIMAL_ROW,
            "name": "Test Hall 2",
            "address": "2 Test St, Testville VIC 1234",
            "lat": "-37.8200",
        },
    ]
    config = {"add_columns": {"booth_info": "added-by-test"}}
    run_loader_full(test_election, make_csv(rows), config)

    pps = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pps.count() == 2
    for pp in pps:
        assert (
            pp.booth_info == "added-by-test"
        ), f"Expected booth_info='added-by-test' on {pp.name}, got {pp.booth_info!r}"
