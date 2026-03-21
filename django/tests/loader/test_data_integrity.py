"""
Phase 0 — Data integrity tests.

These tests exercise the loader in *non-dry-run* mode and verify that the
database state after a full load is correct.  They complement the golden-file
characterisation tests by asserting against real DB outcomes rather than log
output.

All tests use vic_2022 (minimal config, fast) as the fixture election.
"""

import csv
import io
import json
import os

import pytest
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import PollingPlaces
from demsausage.app.sausage.loader import LoadPollingPlaces

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "..", "fixtures", "elections")

# Mapping from old-style VIC wheelchair access strings to current enum values.
_WHEELCHAIR_NORMALISE = {
    "Assisted wheelchair access": "Assisted",
    "Independent wheelchair access": "Full",
    "Limited to no wheelchair access": "None",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _normalise_csv(csv_path: str) -> io.BytesIO:
    """Return an in-memory BytesIO with wheelchair_access values normalised to
    match the current ``PollingPlaceWheelchairAccess`` enum."""
    with open(csv_path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        fieldnames = reader.fieldnames or []
        rows = list(reader)

    if "wheelchair_access" in fieldnames:
        for row in rows:
            raw = row.get("wheelchair_access", "")
            row["wheelchair_access"] = _WHEELCHAIR_NORMALISE.get(raw, raw)

    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
    return io.BytesIO(buf.getvalue().encode("utf-8"))


def _run_full(election, election_name):
    """Run the loader in *real* (non-dry-run) mode against the named fixture.

    Wheelchair access values are normalised on the fly so that old-style VIC
    strings ("Assisted wheelchair access" etc.) don't cause validation errors.
    """
    csv_path = os.path.join(FIXTURES_DIR, election_name, "polling_places.csv")
    config_path = os.path.join(FIXTURES_DIR, election_name, "config.json")

    with open(config_path) as f:
        config = json.load(f)

    if "geocoding" in config:
        config["geocoding"]["enabled"] = False
    config.pop("multiple_division_handling", None)

    csv_bytes = _normalise_csv(csv_path)
    loader = LoadPollingPlaces(election, csv_bytes, dry_run=False, config=config)
    loader.run()


# ---------------------------------------------------------------------------
# Dry-run rollback
# ---------------------------------------------------------------------------


@pytest.mark.slow
@pytest.mark.django_db
def test_dry_run_leaves_no_polling_places(test_election):
    """After a dry run the transaction must be rolled back: no polling places
    should remain in the database for the test election."""
    from tests.conftest import _run_dry

    _run_dry(test_election, "vic_2022")

    count = PollingPlaces.objects.filter(election=test_election).count()
    assert count == 0, (
        f"Expected 0 polling places after dry run, found {count}. "
        "The transaction.atomic() rollback did not work correctly."
    )


# ---------------------------------------------------------------------------
# Full-load count
# ---------------------------------------------------------------------------


@pytest.mark.slow
@pytest.mark.django_db
def test_full_load_creates_active_polling_places(test_election):
    """After a full (non-dry) load the election must have ACTIVE polling
    places and zero DRAFT polling places."""
    _run_full(test_election, "vic_2022")

    active = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    ).count()
    draft = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.DRAFT
    ).count()

    # vic_2022 CSV has ~1766 rows; deduplication reduces this slightly
    assert active > 1000, f"Expected >1000 ACTIVE polling places, got {active}"
    assert draft == 0, f"Expected 0 DRAFT polling places after migrate(), got {draft}"


# ---------------------------------------------------------------------------
# Spot-check
# ---------------------------------------------------------------------------


@pytest.mark.slow
@pytest.mark.django_db
def test_full_load_spot_check(test_election):
    """A known polling place from the fixture CSV must be present and ACTIVE
    after a full load."""
    _run_full(test_election, "vic_2022")

    # First data row of vic_2022/polling_places.csv
    pp = PollingPlaces.objects.filter(
        election=test_election,
        status=PollingPlaceStatus.ACTIVE,
        name="Bridport",
        premises="Albert Park Primary School",
    ).first()

    assert pp is not None, (
        "Expected 'Bridport' at 'Albert Park Primary School' to be ACTIVE "
        "after full load, but it was not found."
    )
    assert pp.state == "VIC"
    assert pp.address == "Bridport Street, Albert Park 3206"
