"""
Phase 1 — Config validation tests.

check_config_is_valid() runs inside LoadPollingPlaces.__init__() and logs
errors for any invalid or inconsistent field.  raise_exception_if_errors() is
then called immediately, so a bad config raises BadRequest before run() is
ever invoked.  run_loader_dry() catches this and returns the logs dict.

Tests (6):
  1. Unknown field name → config error
  2. address_fields supplied without address_format → config error
  3. address_format supplied without address_fields → config error
  4. config=None (no config) → no errors
  5. Single valid field (add_columns) → no errors
  6. All 14 recognised field names present → no errors
"""

import pytest
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_dry

# ---------------------------------------------------------------------------
# Error cases
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_bad_config_unknown_field(test_election):
    """An unrecognised config key produces an [ERROR] entry."""
    csv_bytes = make_csv([MINIMAL_ROW])
    logs = run_loader_dry(test_election, csv_bytes, config={"_not_a_real_field": True})
    assert any(
        "Invalid field '_not_a_real_field'" in m for m in logs.get("errors", [])
    ), f"Expected unknown-field error, got: {logs.get('errors')}"


@pytest.mark.django_db
def test_bad_config_address_fields_without_format(test_election):
    """Supplying address_fields without a matching address_format is an error."""
    csv_bytes = make_csv([MINIMAL_ROW])
    logs = run_loader_dry(
        test_election,
        csv_bytes,
        config={"address_fields": ["street", "suburb"]},
    )
    assert any(
        "address_format required" in m for m in logs.get("errors", [])
    ), f"Expected address_format-required error, got: {logs.get('errors')}"


@pytest.mark.django_db
def test_bad_config_address_format_without_fields(test_election):
    """Supplying address_format without a matching address_fields is an error."""
    csv_bytes = make_csv([MINIMAL_ROW])
    logs = run_loader_dry(
        test_election,
        csv_bytes,
        config={"address_format": "{street}, {suburb}"},
    )
    assert any(
        "address_fields required" in m for m in logs.get("errors", [])
    ), f"Expected address_fields-required error, got: {logs.get('errors')}"


# ---------------------------------------------------------------------------
# Valid configs
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_valid_config_none(test_election):
    """config=None is accepted; the loader produces no config-level errors."""
    csv_bytes = make_csv([MINIMAL_ROW])
    logs = run_loader_dry(test_election, csv_bytes, config=None)
    assert logs.get("errors", []) == [], f"Unexpected errors: {logs.get('errors')}"


@pytest.mark.django_db
def test_valid_config_add_columns(test_election):
    """A config with only add_columns is recognised and produces no config errors."""
    csv_bytes = make_csv([MINIMAL_ROW])
    logs = run_loader_dry(
        test_election,
        csv_bytes,
        config={"add_columns": {"internal_notes": "phase1-test"}},
    )
    assert logs.get("errors", []) == [], f"Unexpected errors: {logs.get('errors')}"


@pytest.mark.django_db
def test_valid_config_all_known_fields_accepted(test_election):
    """Every one of the 14 allowed config field names is accepted without error.

    address_fields and address_format must be supplied together.  We reuse
    the existing 'address' column as the sole address field so the CSV does not
    need to change.
    """
    csv_bytes = make_csv([MINIMAL_ROW])
    config = {
        "filters": [{"type": "is_exactly", "column": "state", "matches": ["VIC"]}],
        "exclude_columns": [],
        "rename_columns": {},
        "add_columns": {},
        "extras": {"fields": []},
        "cleaning_regexes": [],
        "address_fields": ["address"],
        "address_format": "{address}",
        "division_fields": [],
        "fix_data_issues": [],
        "overwrite_distance_thresholds": [],
        "geocoding": {"enabled": False},
        "bbox_validation": {"ignore": []},
        # multiple_division_handling intentionally omitted (would require
        # ElectoralBoundaries rows; covered by test_find_home_division.py)
    }
    logs = run_loader_dry(test_election, csv_bytes, config=config)
    assert logs.get("errors", []) == [], f"Unexpected errors: {logs.get('errors')}"
