import csv
import io
import json
import os
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
import pytz
from demsausage.app.enums import PollingPlaceJurisdiction
from demsausage.app.exceptions import BadRequest
from demsausage.app.models import Elections
from demsausage.app.sausage.loader import LoadPollingPlaces

from django.contrib.gis.geos import Polygon

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures", "elections")

# NOTE: --no-migrations is set in pyproject.toml (addopts).
# This bypasses all Django migration scripts (many of which use live models
# and hardcoded schema names that break in a fresh test database) and instead
# creates tables directly from current model definitions via Django's syncdb.
# The PostGIS extension is enabled automatically by PostGISCreation.


# ---------------------------------------------------------------------------
# RQ / job mock
# ---------------------------------------------------------------------------


@pytest.fixture
def mock_job():
    job = MagicMock()
    job.meta = {"_polling_place_loading_stages_log": []}
    job.save_meta = MagicMock()
    job.id = "test-job-id"
    return job


@pytest.fixture(autouse=True)
def patch_rq(mock_job):
    with patch("demsausage.app.sausage.loader.get_current_job", return_value=mock_job):
        yield


@pytest.fixture(autouse=True)
def patch_task_regenerate():
    with patch("demsausage.app.sausage.loader.task_regenerate_cached_election_data"):
        yield


@pytest.fixture(autouse=True)
def patch_save_logs():
    with patch("demsausage.app.sausage.loader.PollingPlacesIngestBase.save_logs"):
        yield


# ---------------------------------------------------------------------------
# Election fixture
# ---------------------------------------------------------------------------


@pytest.fixture
def test_election(db):
    """
    A test Elections row whose geometry covers all of Australia (including
    external territories) so that real polling place coordinates are always
    considered within-boundary.
    """
    # lon 110°E–170°E, lat 9°S–45°S covers mainland + LHI + Norfolk Is.
    geom = Polygon.from_bbox((110.0, -45.0, 170.0, -9.0))
    geom.srid = 4326

    return Elections.objects.create(
        name="Test Election",
        short_name="test_election",
        is_test=True,
        is_hidden=True,
        is_primary=False,
        is_federal=False,
        is_state=False,
        polling_places_loaded=False,
        election_day=datetime(2026, 3, 7, tzinfo=pytz.utc),
        jurisdiction=PollingPlaceJurisdiction.AUS,
        geom=geom,
    )


# ---------------------------------------------------------------------------
# _run_dry() — shared helper (plain function, not a fixture)
# ---------------------------------------------------------------------------


def _flatten_payload(payload: dict) -> dict:
    """Build flat {errors, warnings, info} string lists from a structured payload.

    Mirrors the ``_text`` logic in ``collects_logs()`` so existing test
    assertions (substring checks on type names and messages) continue to work.
    """

    def _text(entry: dict) -> str:
        if entry.get("type") == "text":
            return entry.get("message", "")
        keys = {k: v for k, v in entry.items() if k != "level"}
        return str(keys)

    all_entries: list[dict] = []
    for stage in payload.get("stages", []):
        all_entries.extend(stage.get("errors", []))
        all_entries.extend(stage.get("warnings", []))
        all_entries.extend(stage.get("summaries", []))
        all_entries.extend(stage.get("detail", []))

    return {
        "errors": [_text(e) for e in all_entries if e["level"] == "error"],
        "warnings": [_text(e) for e in all_entries if e["level"] == "warning"],
        "info": [_text(e) for e in all_entries if e["level"] in ("info", "summary")],
    }


def _run_dry(election, election_name):
    """
    Run the loader in dry_run mode against the named fixture election.
    Returns a flat {errors, warnings, info} log dict derived from the
    structured payload.

    Safety overrides applied to every run:
    - ``geocoding.enabled`` forced to ``False`` (no API calls)
    - ``multiple_division_handling`` stripped (no PostGIS boundary lookups)
    """
    csv_path = os.path.join(FIXTURES_DIR, election_name, "polling_places.csv")
    config_path = os.path.join(FIXTURES_DIR, election_name, "config.json")

    with open(config_path) as f:
        config = json.load(f)

    # Prevent API calls and boundary PostGIS lookups in tests
    if "geocoding" in config:
        config["geocoding"]["enabled"] = False
    config.pop("multiple_division_handling", None)

    with open(csv_path, "rb") as f:
        loader = None
        try:
            loader = LoadPollingPlaces(election, f, dry_run=True, config=config)
            loader.run()
        except BadRequest as e:
            if loader is not None:
                return _flatten_payload(loader.collect_structured_logs())
            return _flatten_payload(getattr(e, "_partial_payload", {}))

    pytest.fail("LoadPollingPlaces.run() did not raise BadRequest for a dry run")


# ---------------------------------------------------------------------------
# Synthetic CSV helpers (Phase 1)
# ---------------------------------------------------------------------------

# A minimal polling place row that passes all field-validity and serializer checks.
# Coordinates are Melbourne CBD, well inside the test_election's Australia-wide bbox.
MINIMAL_ROW = {
    "name": "Test Hall",
    "premises": "Test Primary School",
    "address": "1 Test St, Testville VIC 1234",
    "state": "VIC",
    "wheelchair_access": "Full",
    "lat": "-37.8136",
    "lon": "144.9631",
    # ec_id must be present: prepare_polling_places() references polling_place["ec_id"]
    # directly (no .get() guard).  Real fixture CSVs supply it via add_columns.
    "ec_id": "",
}

# ---------------------------------------------------------------------------
# Realistic row templates derived from real 2024/2025 election CSV formats.
# Each covers a distinct field combination observed in production data.
# All coordinates fall within the test_election Australia-wide bbox.
# ---------------------------------------------------------------------------

# NSW LG 2024-style row:
#   - ec_id as a real numeric string (sourced directly from the CSV column)
#   - wheelchair_access_description (long free-text string, unique to NSW LG)
#   - divisions as a plain string (loader converts to list)
#   - no entrance_desc column
# Coord: Albury NSW (-36.07°S, 146.92°E) — well inside the Australia bbox.
NSW_LG_ROW = {
    "name": "Albury High School",
    "premises": "Albury High School",
    "address": "Griffith Street, Albury NSW 2640",
    "state": "NSW",
    "wheelchair_access": "Assisted",
    "wheelchair_access_description": "No designated accessible parking spot; Access ramp does not meet standards",
    "lat": "-36.0734",
    "lon": "146.9164",
    "ec_id": "88001",
    "divisions": "Albury",
}

# SA 2025-style row:
#   - entrance_desc present (free-text, common in SA and Federal elections)
#   - divisions as a plain string
#   - ec_id blank (injected via config add_columns in real elections)
#   - no wheelchair_access_description column
# Coord: Adelaide SA (-34.93°S, 138.61°E).
SA_ROW = {
    "name": "Gilles St Primary School",
    "premises": "Gilles St Primary School",
    "address": "91-93 Gilles St, Adelaide SA 5000",
    "state": "SA",
    "wheelchair_access": "Assisted",
    "entrance_desc": "Enter via front gate on Gilles St",
    "lat": "-34.9344",
    "lon": "138.6050",
    "ec_id": "",
    "divisions": "Adelaide",
}

# ACT 2024-style row — no premises-as-a-building (venue name == polling place name).
# premises="" tests the blank=True constraint on the model field.
# Coord: slightly offset Melbourne (shares election bbox but avoids MINIMAL_ROW clash).
NO_PREMISES_ROW = {
    "name": "Test Venue No Premises",
    "premises": "",
    "address": "2 Test St, Testville VIC 1234",
    "state": "VIC",
    "wheelchair_access": "Full",
    "lat": "-37.8200",
    "lon": "144.9631",
    "ec_id": "",
}

# ---------------------------------------------------------------------------
# Federal/AEC extras row (FED 2022, REF 2023, FED 2025 style)
# ---------------------------------------------------------------------------

# FED 2025-shape: entrance_desc + all six AEC extras columns.
# The extras columns are packed into the model's ``extras`` JSONField by the
# loader when AEC_EXTRAS_CONFIG is supplied.  Numeric strings (CCD…
# NoOfDecIssuingOff) are stored as ints; AdvBoothLocation is a string.
# ec_id mirrors the real AEC PPId integer column.
# Coord: Canberra ACT (-35.24°S, 149.07°E) — inside test_election bbox.
AEC_ROW = {
    "name": "Belconnen Community Centre",
    "premises": "Belconnen Community Centre",
    "address": "1 Swanson Ct, Belconnen ACT 2617",
    "state": "ACT",
    "wheelchair_access": "Full",
    "entrance_desc": "Entrance to polling place: Main door. Entrance to grounds: Swanson Ct",
    "lat": "-35.2381",
    "lon": "149.0690",
    "ec_id": "42001",
    "divisions": "Fenner",
    # AEC extras columns — packed into pp.extras via AEC_EXTRAS_CONFIG below.
    "CCD": "801011001",
    "OrdVoteEst": "950",
    "DecVoteEst": "12",
    "NoOrdIssuingOff": "8",
    "NoOfDecIssuingOff": "2",
    "AdvBoothLocation": "BELCONNEN COMMUNITY CENTRE",
}

# Loader config that packs all six FED 2025 extras columns into pp.extras.
# CCD/OrdVoteEst/DecVoteEst/NoOrdIssuingOff/NoOfDecIssuingOff are numeric →
# stored as ints.  AdvBoothLocation is a string → stored as-is.
AEC_EXTRAS_CONFIG = {
    "extras": {
        "fields": [
            "CCD",
            "OrdVoteEst",
            "DecVoteEst",
            "NoOrdIssuingOff",
            "NoOfDecIssuingOff",
            "AdvBoothLocation",
        ]
    }
}

# ---------------------------------------------------------------------------
# TAS accessibility-extras row (TAS 2024/2025 style)
# ---------------------------------------------------------------------------

# TAS 2024/2025: three accessibility-detail columns packed into extras.
# All three values are strings (not numeric), so they are stored as-is.
# Coord: Hobart TAS (-42.88°S, 147.33°E) — inside test_election bbox.
TAS_EXTRAS_ROW = {
    "name": "Hobart Town Hall",
    "premises": "Hobart Town Hall",
    "address": "Macquarie St, Hobart TAS 7000",
    "state": "TAS",
    "wheelchair_access": "Full",
    "lat": "-42.8821",
    "lon": "147.3272",
    "ec_id": "",
    "divisions": "Denison",
    # TAS extras columns — packed into pp.extras via TAS_EXTRAS_CONFIG below.
    "Access_To_Location": "Ground Level",
    "Location_Within_Premise": "Main Hall",
    "VI_Vote_service": "No",
}

# Loader config that packs the three TAS accessibility extras columns.
TAS_EXTRAS_CONFIG = {
    "extras": {
        "fields": ["Access_To_Location", "Location_Within_Premise", "VI_Vote_service"]
    }
}

# ---------------------------------------------------------------------------
# Federal overseas polling place row (FED 2022 / FED 2025 style)
# ---------------------------------------------------------------------------

# Overseas polling places appear in Federal elections only.  The AEC merges a
# manually-geocoded overseas CSV into the main domestic CSV before loading.  Key
# characteristics:
#   - state="Overseas" — the only valid non-Australian PollingPlaceState value.
#   - Coordinates are OUTSIDE the Australia-wide election bbox (lat/lon is London
#     here, representative of the AEC's UK embassy booth).
#   - booth_info contains a free-text location description (e.g. "London"); in
#     real elections this column is present in the merged overseas CSV directly.
#   - ec_id is blank (overseas booths are not assigned AEC PPIds).
#   - divisions is "Overseas" — every overseas booth serves the same pseudo-division.
# Coord: Australian High Commission, London — lon −0.12°, lat 51.51° — well
# outside the test_election bbox (110–170°E / 9–45°S).
OVERSEAS_ROW = {
    "name": "Australian High Commission London",
    "premises": "Australian High Commission",
    "address": "Australia House, Strand, London WC2B 4LA",
    "state": "Overseas",
    "wheelchair_access": "Full",
    "lat": "51.5126",
    "lon": "-0.1175",
    "ec_id": "",
    "divisions": "Overseas",
    "booth_info": "London",
}

# ---------------------------------------------------------------------------
# Federal overseas row (Federal 2022 / REF 2023 / Federal 2025 style)
# ---------------------------------------------------------------------------

# Overseas polling places are identified by state="Overseas" in the CSV.
# The AEC's merge_overseas.py script appends a booth_info column (which
# carries the country / category / address string from the AEC source)
# to every overseas row before the combined file is loaded.
#
# Key properties exercised by this row:
#   1. state="Overseas" → bbox check is skipped entirely (no error/warning
#      even though Tokyo is well outside the 110–170°E / 45–9°S Australia bbox)
#   2. booth_info column present → persisted verbatim on the model field
#   3. MPP migration: overseas=True, jurisdiction=None on the linked MPP
#
# Coord: Embassy of Australia, Tokyo (35.67°N, 139.74°E) — outside the
# Australia bbox used by test_election.
OVERSEAS_ROW = {
    "name": "Embassy of Australia, Tokyo",
    "premises": "Embassy of Australia",
    "address": "2-1-14 Mita, Minato-ku, Tokyo, Japan",
    "state": "Overseas",
    "wheelchair_access": "Full",
    "lat": "35.6716",
    "lon": "139.7390",
    "ec_id": "",
    "divisions": "",
    # booth_info is added by merge_overseas.py in real Federal elections;
    # including it directly in the row replicates the merged CSV format.
    "booth_info": "Asia/Pacific - Tokyo, Japan",
}

# ---------------------------------------------------------------------------
# QLD 2024-style row (opening_hours present)
# ---------------------------------------------------------------------------

# QLD 2024 is the only post-2022 election where every polling place carries a
# non-empty opening_hours field.  The value is a plain time-range string.
# Coord: Brisbane QLD (-27.46°S, 153.02°E) — inside test_election bbox.
QLD_ROW = {
    "name": "Centenary Pool",
    "premises": "Centenary Pool",
    "address": "400 Gregory Tce, Spring Hill QLD 4000",
    "state": "QLD",
    "wheelchair_access": "Full",
    "opening_hours": "08:00 AM - 06:00 PM",
    "lat": "-27.4598",
    "lon": "153.0213",
    "ec_id": "",
    "divisions": "Algester",
}

# ---------------------------------------------------------------------------
# ACT 2024-style row (wheelchair_access='Unknown', no division column)
# ---------------------------------------------------------------------------

# ACT 2024 is unusual in two ways:
#   1. Every booth is wheelchair_access='Unknown' — the supplier did not
#      certify any venues, so the loader must pass 'Unknown' through untouched.
#   2. ACT uses multi-member electorates assigned at the district level, not
#      per booth.  The real CSV has NO 'divisions' column at all; the loader
#      then stores the model's JSONField default [].
#      (Note: divisions="" in the CSV is different — split(",") gives [""].)
# Coord: Tuggeranong ACT (-35.42°S, 149.06°E) — inside test_election bbox.
ACT_UNKNOWN_ROW = {
    "name": "Tuggeranong Community Centre",
    "premises": "Tuggeranong Community Centre",
    "address": "Mortimer Lewis Dr, Tuggeranong ACT 2900",
    "state": "ACT",
    "wheelchair_access": "Unknown",
    "lat": "-35.4244",
    "lon": "149.0639",
    "ec_id": "",
    # No 'divisions' key — the absence of the column produces divisions=[]
    # in elections with no per-booth division mapping (ACT 2024, VIC 2022).
}


def make_csv(rows: list[dict]) -> io.BytesIO:
    """Return an in-memory BytesIO CSV built from *rows* (list of dicts).

    All rows must share the same set of keys (the first row's keys become the
    CSV header).  Values of ``None`` are written as empty strings.
    """
    if not rows:
        raise ValueError("rows must not be empty")
    fieldnames = list(rows[0].keys())
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="raise")
    writer.writeheader()
    for row in rows:
        writer.writerow({k: ("" if v is None else v) for k, v in row.items()})
    return io.BytesIO(buf.getvalue().encode("utf-8"))


def run_loader_dry(election, csv_bytes: io.BytesIO, config=None) -> dict:
    """Run the loader in dry-run mode and return a flat {errors, warnings, info} dict.

    Always returns a dict (either partial results from a failed stage, or the
    rollback payload from a successful dry-run).  If the loader does NOT raise
    ``BadRequest`` (which should never happen for dry_run=True), the test fails.
    """
    loader = None
    try:
        loader = LoadPollingPlaces(election, csv_bytes, dry_run=True, config=config)
        loader.run()
        pytest.fail("Dry run did not raise BadRequest — this should not happen.")
    except BadRequest as exc:
        if loader is not None:
            return _flatten_payload(loader.collect_structured_logs())
        return _flatten_payload(getattr(exc, "_partial_payload", {}))


def run_loader_full(election, csv_bytes: io.BytesIO, config=None):
    """Run the loader in non-dry-run mode and return the loader instance.

    Raises ``BadRequest`` (from ``raise_exception_if_errors``) if the loader
    encounters fatal errors during any stage.  Use this in DB-state tests.
    """
    loader = LoadPollingPlaces(election, csv_bytes, dry_run=False, config=config)
    loader.run()
    return loader


# ---------------------------------------------------------------------------
# ElectoralBoundaries fixture (Phase 1)
# ---------------------------------------------------------------------------


@pytest.fixture
def electoral_boundaries(test_election, db):
    """One ElectoralBoundaries polygon covering Melbourne (VIC).

    Division name ``"Hotham"`` is used in find_home_division tests so that CSV
    rows that carry ``divisions=["Hotham"]`` resolve correctly.
    """
    from demsausage.app.models import ElectoralBoundaries

    from django.contrib.gis.geos import MultiPolygon

    # Bounding box: lon 144.5–145.5°E, lat 38.5–37.5°S — surrounds Melbourne
    geom = MultiPolygon(Polygon.from_bbox((144.5, -38.5, 145.5, -37.5)))
    geom.srid = 4326
    return ElectoralBoundaries.objects.create(
        loader_id="test_2026",
        geom=geom,
        election_ids=[test_election.id],
        division_name="Hotham",
        state="VIC",
    )
