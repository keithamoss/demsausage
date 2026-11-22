#!/usr/bin/env python
"""
Fetch and validate polling places for the City of Coffs Harbour Council
by-election on 12 December 2026.

This scraper reads the NSW Electoral Commission's Placemark API and writes
one CSV in the format used by the Democracy Sausage polling-place loader.
The event ID can be provided on the command line.

Example:
    python scraper.py                 # uses EVENT_ID below
    python scraper.py LB2615-031      # override the event/area ID
    python scraper.py --no-diff       # skip the diff against the previous scrape

After writing the CSV, the scraper compares it with the most recent scrape
using the repository's diff tool. The report is written to
``scrapers/nsw_coffs_harbour_2026/diffs/index.html``. When ``uv`` is unavailable,
the comparison is skipped and this command can be run later:

    cd ../../diff && uv run ppdiff latest "../scrapers/nsw_coffs_harbour_2026/data/*.csv" --out-dir ../scrapers/nsw_coffs_harbour_2026/diffs

Event IDs contain an event code and an area code, such as ``LB2615-031``.
For local-government events, the area code identifies the council. Event
codes are listed at https://map.elections.nsw.gov.au/.

Errors (missing API fields, a ward or another council, a name appearing twice
with different details, missing or out-of-area coordinates, a blank address)
stop the run and no CSV is written. Warnings (new API fields, exact duplicate
records, addresses that look like they contain notes) are printed, and the CSV
is still written.
"""

import argparse
import csv
import datetime
import os
import re
import shutil
import subprocess
import sys

import requests

EVENT_ID = "LB2615-031"
DISTRICT_NAME = "Coffs Harbour"
API_URL = "https://map.elections.nsw.gov.au/PlacemarkApi.ashx?mode=PP&ID={event_id}"
HERE = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(HERE, "data")
DIFFS_DIR = os.path.join(HERE, "diffs")
DIFF_PROJECT = os.path.join(HERE, "..", "..", "diff")

FIELDS = [
    "name",
    "premises",
    "address",
    "suburb",
    "state",
    "postcode",
    "lat",
    "lon",
    "wheelchair_access",
    "wheelchair_access_description",
    "opening_hours",
    "entrance_desc",
]

# Fields we read from each API record. A missing one is an error; a field not
# in KNOWN_API_FIELDS is a warning (the API may have grown something useful).
REQUIRED_API_FIELDS = {
    "Name",
    "LgaName",
    "Ward",
    "Address",
    "Locality",
    "Postcode",
    "Lat",
    "Lon",
    "Access",
    "AssistedAccess",
    "FeatureValues",
    "OpeningHours",
}
KNOWN_API_FIELDS = REQUIRED_API_FIELDS | {
    "Uppn",
    "UppnLabel",
    "Premises",
    "mcid",
    "Type",
    "openingHoursList",
    "OpenRightNow",
    "NotOpenYet",
    "NextAvailable",
    "Ppp",
    "RoTelephone",
    "depth",
    "Photos",
    "sortWard",
    "IsVenueTypePPP",
    "IsVenueTypeMW",
}

# Generous box around the City of Coffs Harbour LGA (Red Rock to Bonville, out
# to Ulong), to catch swapped or wildly wrong coordinates.
BBOX = {"lat_min": -30.6, "lat_max": -29.7, "lon_min": 152.6, "lon_max": 153.4}

# NSWEC sometimes put access notes in the address field, e.g. Kororo Public School:
# "James Small Drive NOTE: No access to Korora School Road (closed), ..."
ADDRESS_NOTE_PATTERN = re.compile(r"\s+NOTE:\s*", re.IGNORECASE)

# Other signs of notes left in an address (after any NOTE: is split out).
SUSPICIOUS_ADDRESS_PATTERN = re.compile(
    r"[()]|\b(enter|entry|entrance|via|access|use|closed|rear|behind|opposite)\b",
    re.IGNORECASE,
)


def scrape(event_id: str) -> str:
    """Fetch, validate, and save polling places for one NSWEC event.

    Args:
        event_id: NSWEC event and area identifier, such as ``LB2615-031``.

    Returns:
        The absolute path to the timestamped CSV file that was written.

    The process stops before writing any CSV if validation finds an error.
    """
    url = API_URL.format(event_id=event_id)
    print(f"Fetching {url}")
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    records = response.json()

    if not records:
        sys.exit(
            f"No polling places returned for {event_id}. NSWEC may not have published "
            "them yet, or the event ID is wrong (check https://map.elections.nsw.gov.au/)."
        )

    errors: list[str] = []
    warnings: list[str] = []

    _check_api_fields(records, errors, warnings)
    if errors:
        _report_and_exit(errors, warnings)

    rows = _build_rows(records, errors, warnings)
    for row in rows:
        _check_row(row, errors, warnings)

    if errors:
        _report_and_exit(errors, warnings)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_file = os.path.join(
        OUTPUT_DIR,
        # Timestamped so several scrapes on one day don't overwrite each other.
        f"nsw_coffs_harbour_{event_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
    )
    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda r: r["name"]))

    _print_list("Warnings", warnings)
    print(f"Wrote {len(rows)} polling places to {output_file}")
    return output_file


def diff_against_previous() -> None:
    """Compare the newest two CSV snapshots using the repository diff tool.

    Returns:
        None. A missing ``uv`` installation or an unsuccessful diff is reported
        on the command line without deleting the newly written CSV.
    """
    if shutil.which("uv") is None:
        print("\nSkipping the diff: uv isn't installed. See the module docstring to run it later.")
        return
    print("\nDiffing against the previous scrape...")
    result = subprocess.run(
        [
            "uv", "run", "--project", DIFF_PROJECT, "ppdiff", "latest",
            os.path.join(OUTPUT_DIR, "*.csv"), "--out-dir", DIFFS_DIR,
        ],
        check=False,
        # Let uv use the diff project's own environment, not this scraper's.
        env={k: v for k, v in os.environ.items() if k != "VIRTUAL_ENV"},
    )
    if result.returncode != 0:
        print("The diff failed (the scrape itself is fine). See the output above.")
    else:
        print(f"Open {os.path.join(DIFFS_DIR, 'index.html')} in a browser.")


def _check_api_fields(
    records: list[dict],
    errors: list[str],
    warnings: list[str],
) -> None:
    """Check the API response for missing or newly added fields.

    Args:
        records: Polling-place records returned by NSWEC.
        errors: List to receive validation errors.
        warnings: List to receive validation warnings.

    Returns:
        None. Validation findings are appended to ``errors`` and ``warnings``.
    """
    seen_fields = set().union(*(record.keys() for record in records))

    # Missing required fields are fatal because the loader cannot safely use
    # the record. Unknown fields are warnings so future API additions are visible.
    for record in records:
        missing = REQUIRED_API_FIELDS - record.keys()
        if missing:
            errors.append(
                f"{record.get('Name', '<no Name>')}: API record is missing "
                f"{', '.join(sorted(missing))}"
            )
    new_fields = seen_fields - KNOWN_API_FIELDS
    if new_fields:
        warnings.append(f"New API field(s), worth a look: {', '.join(sorted(new_fields))}")


def _build_rows(
    records: list[dict],
    errors: list[str],
    warnings: list[str],
) -> list[dict]:
    """Convert NSWEC records into loader-ready CSV rows.

    Args:
        records: Polling-place records returned by NSWEC.
        errors: List to receive validation errors.
        warnings: List to receive validation warnings.

    Returns:
        A list of de-duplicated polling-place dictionaries.
    """
    rows_by_name: dict[str, dict] = {}
    for record in records:
        name = record["Name"]

        # Stop if the response belongs to another council or assumes wards.
        # This scraper currently supports Coffs Harbour's undivided council area.
        if record["LgaName"] != DISTRICT_NAME:
            errors.append(f"{name}: in {record['LgaName']!r}, expected {DISTRICT_NAME!r}")
        if record["Ward"]:
            errors.append(
                f"{name}: has ward {record['Ward']!r}; the scraper assumes an "
                "undivided council (add divisions handling)"
            )

        row = _to_row(record)
        existing = rows_by_name.get(name)
        if existing is None:
            rows_by_name[name] = row
        elif existing == row:
            warnings.append(f"{name}: duplicate record in the API, ignored")
        else:
            errors.append(
                f"{name}: appears more than once with different details "
                f"({existing['address']!r} vs {row['address']!r})"
            )
    return list(rows_by_name.values())


def _check_row(row: dict, errors: list[str], warnings: list[str]) -> None:
    """Check one converted row for coordinates, address, and note problems.

    Args:
        row: Loader-ready polling-place dictionary.
        errors: List to receive validation errors.
        warnings: List to receive validation warnings.

    Returns:
        None. Validation findings are appended to ``errors`` and ``warnings``.
    """
    name = row["name"]

    # Coordinates must be numeric and inside a deliberately broad Coffs
    # Harbour area box, so a swapped or grossly wrong location is caught.
    try:
        lat, lon = float(row["lat"]), float(row["lon"])
    except (TypeError, ValueError):
        errors.append(f"{name}: missing or non-numeric coordinates ({row['lat']!r}, {row['lon']!r})")
    else:
        if not (
            BBOX["lat_min"] <= lat <= BBOX["lat_max"]
            and BBOX["lon_min"] <= lon <= BBOX["lon_max"]
        ):
            errors.append(f"{name}: coordinates ({lat}, {lon}) are outside the Coffs Harbour area")

    if not row["address"]:
        errors.append(f"{name}: blank address")
    elif SUSPICIOUS_ADDRESS_PATTERN.search(row["address"]):
        warnings.append(f"{name}: address may contain a note: {row['address']!r}")


def _print_list(title: str, items: list[str]) -> None:
    """Print a labelled list of validation messages.

    Args:
        title: Heading to print above the messages.
        items: Messages to print beneath the heading.

    Returns:
        None.
    """
    if items:
        print(f"\n{title} ({len(items)}):")
        for item in items:
            print(f"  - {item}")
        print()


def _report_and_exit(errors: list[str], warnings: list[str]) -> None:
    """Print validation findings and stop the scraper.

    Args:
        errors: Fatal validation errors found before output.
        warnings: Non-fatal validation warnings found before output.

    Returns:
        None. This function exits the process with a failure message.
    """
    _print_list("Warnings", warnings)
    _print_list("Errors", errors)
    sys.exit("No CSV written.")


def _to_row(record: dict) -> dict:
    """Convert one NSWEC API record into one CSV row.

    Args:
        record: One polling-place record returned by NSWEC.

    Returns:
        A dictionary with the scraper's CSV field names and values.
    """
    wheelchair_access, wheelchair_access_description = _get_wheelchair_access(record)
    address, entrance_desc = _split_address_note(record["Address"])
    return {
        "name": record["Name"],
        # NSWEC's premises value is identical to Name. Leave premises blank,
        # matching the Kiama 2026 scraper and allowing the frontend to fall back
        # to Name, which is required by the polling-place model and permalinks.
        "premises": "",
        "address": address,
        "suburb": record["Locality"],
        "state": "NSW",
        "postcode": record["Postcode"],
        "lat": record["Lat"],
        "lon": record["Lon"],
        "wheelchair_access": wheelchair_access,
        "wheelchair_access_description": wheelchair_access_description,
        "opening_hours": record["OpeningHours"] or "",
        "entrance_desc": entrance_desc,
    }


def _split_address_note(address: str) -> tuple[str, str]:
    """Move NSWEC's ``NOTE:`` text out of the address.

    Args:
        address: Street address text returned by NSWEC.

    Returns:
        A tuple containing the cleaned street address and any entrance
        information. The entrance information is empty when no note is present.
    """
    parts = ADDRESS_NOTE_PATTERN.split(address, maxsplit=1)
    if len(parts) == 1:
        return address.strip(), ""
    return parts[0].strip().rstrip(","), parts[1].strip()


def _get_wheelchair_access(record: dict) -> tuple[str, str]:
    """Translate NSWEC wheelchair-access fields into loader values.

    Args:
        record: One polling-place record returned by NSWEC.

    Returns:
        A tuple containing the wheelchair-access level and a human-readable
        description of any assisted-access limitations.

    Raises:
        ValueError: The API response contains an unsupported combination of
            full-access and assisted-access flags.
    """
    if record["Access"] is True:
        return "Full", ""
    if record["AssistedAccess"] is True:
        return "Assisted", ", ".join(record["FeatureValues"])
    if record["Access"] is False and record["AssistedAccess"] is False:
        return "None", ""
    raise ValueError(f"Unhandled wheelchair access mode: {record}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("event_id", nargs="?", default=EVENT_ID)
    parser.add_argument("--no-diff", action="store_true", help="Don't diff against the previous scrape")
    args = parser.parse_args()
    scrape(args.event_id)
    if not args.no_diff:
        diff_against_previous()
