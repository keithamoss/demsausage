#!/usr/bin/env python
"""
Scraper for the City of Coffs Harbour Council By-Election (12 Dec 2026),
part of NSWEC's "December 2026 Local Government By-Elections" event (LB2615).

Pulls polling places from the NSWEC map's PlacemarkApi (the same API the
nsw_by_2024 scraper uses) and writes a CSV in the same shape as
nsw_kiama_2026/data, so the existing config.json can be used to load it.

Usage:
    python scraper.py                 # uses EVENT_ID below
    python scraper.py LB2615-031      # override the event/area ID

IDs are "<event>-<area>". For local government events the area is the council
(Coffs Harbour = 031); for state events it's the electoral district (Coffs
Harbour = 020). Event codes are listed at https://map.elections.nsw.gov.au/.

Errors (missing API fields, a ward or another council, a name appearing twice
with different details, missing or out-of-area coordinates, a blank address)
stop the run and no CSV is written. Warnings (new API fields, exact duplicate
records, addresses that look like they contain notes) are printed, and the CSV
is still written.
"""

import csv
import datetime
import os
import re
import sys

import requests

EVENT_ID = "LB2615-031"
DISTRICT_NAME = "Coffs Harbour"
API_URL = "https://map.elections.nsw.gov.au/PlacemarkApi.ashx?mode=PP&ID={event_id}"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

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



def scrape(event_id: str) -> None:
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
        f"nsw_coffs_harbour_{event_id}_{datetime.date.today().isoformat()}.csv",
    )
    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda r: r["name"]))

    _print_list("Warnings", warnings)
    print(f"Wrote {len(rows)} polling places to {output_file}")


def _check_api_fields(records: list[dict], errors: list[str], warnings: list[str]):
    seen_fields = set().union(*(record.keys() for record in records))
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


def _build_rows(records: list[dict], errors: list[str], warnings: list[str]) -> list[dict]:
    rows_by_name: dict[str, dict] = {}
    for record in records:
        name = record["Name"]
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


def _check_row(row: dict, errors: list[str], warnings: list[str]):
    name = row["name"]
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


def _print_list(title: str, items: list[str]):
    if items:
        print(f"\n{title} ({len(items)}):")
        for item in items:
            print(f"  - {item}")
        print()


def _report_and_exit(errors: list[str], warnings: list[str]):
    _print_list("Warnings", warnings)
    _print_list("Errors", errors)
    sys.exit("No CSV written.")


def _to_row(record: dict) -> dict:
    wheelchair_access, wheelchair_access_description = _get_wheelchair_access(record)
    address, entrance_desc = _split_address_note(record["Address"])
    return {
        "name": record["Name"],
        # NSWEC's Premises is always identical to Name. Following nsw_kiama_2026, we
        # leave premises blank: the redesigned frontends fall back to name
        # (premises || name), and name is required by the model and permalinks.
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
    """Move any 'NOTE: ...' text out of the address and into entrance_desc."""
    parts = ADDRESS_NOTE_PATTERN.split(address, maxsplit=1)
    if len(parts) == 1:
        return address.strip(), ""
    return parts[0].strip().rstrip(","), parts[1].strip()


def _get_wheelchair_access(record: dict) -> tuple[str, str]:
    if record["Access"] is True:
        return "Full", ""
    if record["AssistedAccess"] is True:
        return "Assisted", ", ".join(record["FeatureValues"])
    if record["Access"] is False and record["AssistedAccess"] is False:
        return "None", ""
    raise ValueError(f"Unhandled wheelchair access mode: {record}")


if __name__ == "__main__":
    scrape(sys.argv[1] if len(sys.argv) > 1 else EVENT_ID)
