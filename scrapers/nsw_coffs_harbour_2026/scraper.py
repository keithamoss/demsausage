#!/usr/bin/env python
"""
Scraper for the NSW Coffs Harbour State By-Election (2026).

Pulls polling places from the NSWEC map's PlacemarkApi (the same API the
nsw_by_2024 scraper uses) and writes a CSV in the same shape as
nsw_kiama_2026/data, so the existing config.json can be used to load it.

Usage:
    python scraper.py                 # uses EVENT_ID below
    python scraper.py SB2601-020      # override the event/district ID

Event IDs are "<event>-<district>". Coffs Harbour is district 020 (stable
across events, e.g. SG2301-020 for the 2023 general election). The event
code for the by-election (e.g. SB2601) is listed at
https://map.elections.nsw.gov.au/ once NSWEC publish it.
"""

import csv
import datetime
import os
import sys

import requests

EVENT_ID = "SB2601-020"
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
]


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

    polling_places = {}
    for record in records:
        key = (record["Name"], record["Address"])
        if key in polling_places:
            continue
        polling_places[key] = _to_row(record)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_file = os.path.join(
        OUTPUT_DIR,
        f"nsw_coffs_harbour_{event_id}_{datetime.date.today().isoformat()}.csv",
    )
    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(sorted(polling_places.values(), key=lambda r: r["name"]))

    print(f"Wrote {len(polling_places)} polling places to {output_file}")


def _to_row(record: dict) -> dict:
    if record.get("LgaName") and record["LgaName"] != DISTRICT_NAME:
        print(f"  warning: {record['Name']} is in district {record['LgaName']!r}")

    wheelchair_access, wheelchair_access_description = _get_wheelchair_access(record)
    return {
        "name": record["Name"],
        "premises": record["Premises"],
        "address": record["Address"],
        "suburb": record["Locality"],
        "state": "NSW",
        "postcode": record["Postcode"],
        "lat": record["Lat"],
        "lon": record["Lon"],
        "wheelchair_access": wheelchair_access,
        "wheelchair_access_description": wheelchair_access_description,
        "opening_hours": record.get("OpeningHours") or "",
    }


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
