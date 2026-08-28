"""
Phase 1 — check_file_validity and check_polling_place_validity tests.

Tests (4):
  1. PP outside election bbox AND name not in bbox_validation ignore list → error
  2. PP outside election bbox AND name IS in ignore list → warning (not error)
  3. PP outside election bbox with no bbox_validation config → warning only
  4. Serializer validation failure (invalid choice value) → error + bail
"""

import pytest
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_dry

# Coordinates for a point well outside the test_election's Australia-wide bbox.
# London is at lon≈−0.13°, lat≈51.51° — far from the 110–170°E / 45–9°S box.
LONDON_ROW = {
    **MINIMAL_ROW,
    "name": "London Hall",
    "lat": "51.5074",
    "lon": "-0.1278",
}


# ---------------------------------------------------------------------------
# 1. bbox error path — name not in ignore list
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_bbox_error_when_outside_boundary_and_not_ignored(test_election):
    """A polling place whose geom falls outside the election bbox is logged as
    an [ERROR] when its name is not listed in bbox_validation.ignore."""
    config = {"bbox_validation": {"ignore": ["Other Hall"]}}  # name not matched
    logs = run_loader_dry(test_election, make_csv([LONDON_ROW]), config)
    assert any(
        "falls outside the election's boundary" in m for m in logs.get("errors", [])
    ), f"Expected bbox error; errors={logs.get('errors')}"
    # Must NOT appear as a warning-only
    assert not any(
        "falls outside the election's boundary" in m for m in logs.get("warnings", [])
    ), "Bbox issue should be an error here, not a warning"


# ---------------------------------------------------------------------------
# 2. bbox warning path — name IS in ignore list
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_bbox_warning_when_outside_boundary_but_ignored(test_election):
    """A polling place outside the election bbox with its name in the ignore
    list is logged as a [WARNING], not an [ERROR]; the loader continues."""
    config = {"bbox_validation": {"ignore": ["London Hall"]}}
    logs = run_loader_dry(test_election, make_csv([LONDON_ROW]), config)
    assert not any(
        "falls outside the election's boundary" in m for m in logs.get("errors", [])
    ), f"Should not be an error when name is ignored; errors={logs.get('errors')}"
    assert any(
        "falls outside the election's boundary" in m for m in logs.get("warnings", [])
    ), f"Expected bbox warning; warnings={logs.get('warnings')}"


# ---------------------------------------------------------------------------
# 3. bbox warning when no bbox_validation config supplied
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_bbox_warning_when_no_bbox_validation_config(test_election):
    """Without any bbox_validation config the loader emits a [WARNING] for
    out-of-bounds polling places and continues (no error)."""
    logs = run_loader_dry(test_election, make_csv([LONDON_ROW]), config=None)
    assert not any(
        "falls outside the election's boundary" in m for m in logs.get("errors", [])
    ), "No bbox_validation → should be warning, not error"
    assert any(
        "falls outside the election's boundary" in m for m in logs.get("warnings", [])
    ), f"Expected bbox warning; warnings={logs.get('warnings')}"


# ---------------------------------------------------------------------------
# 4. Serialiser validation failure
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_serializer_validation_failure_logs_error(test_election):
    """A polling place with an invalid field value fails DRF serialiser
    validation and is logged as an [ERROR] that halts the load."""
    # wheelchair_access must be one of: None, Assisted, Full, Unknown
    bad_row = {**MINIMAL_ROW, "wheelchair_access": "INVALID_VALUE"}
    logs = run_loader_dry(test_election, make_csv([bad_row]), config=None)
    assert logs.get("errors"), (
        "Expected at least one serialiser-validation error, got none. "
        f"warnings={logs.get('warnings')}, info={logs.get('info')}"
    )
    # Verify the error references the polling place so it's identifiable
    assert any(
        "Test Hall" in m or "invalid" in m.lower() for m in logs.get("errors", [])
    ), f"Error message should identify the offending polling place; errors={logs.get('errors')}"
