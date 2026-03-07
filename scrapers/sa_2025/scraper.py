#!/usr/bin/env python3
"""
Scraper for SA 2025 polling places from ECSA (Electoral Commission of South Australia).

Fetches https://www.ecsa.sa.gov.au/map, extracts the App.pollingPlaces JSON blob
embedded in the page source, and writes a cleaned CSV to data/.
"""

import csv
import json
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ECSA_MAP_URL = "https://www.ecsa.sa.gov.au/map"
EXPECTED_AVAILABILITY = "Sat 21 March, 8am to 6pm"
OUTPUT_DIR = Path(__file__).parent / "data"

# Patches for known bad source data.
# Each entry: location_name -> {field: (expected_source_value, corrected_value)}
# If the source no longer has expected_source_value, an exception is raised
# (indicating ECSA has fixed their data and the patch should be removed).
PATCHES: dict[str, dict[str, tuple[str, str]]] = {
    "Mount Barker Early Voting Centre": {
        "type_code": ("PP", "EVC"),
    },
    "Salisbury Early Voting Centre": {
        "type_code": ("PP", "EVC"),
    },
}

# All fields expected in each record from App.pollingPlaces.
# If ECSA adds or removes fields, an error will be raised.
EXPECTED_SOURCE_FIELDS: frozenset[str] = frozenset(
    {
        "id",
        "obj_id",
        "location_id",
        "location_name",
        "district_id",
        "district_name",
        "disabled_access_id",
        "suburb",
        "postcode",
        "address_detail1",
        "address_detail2",
        "address_detail3",
        "lat",
        "lng",
        "archived",
        "polling_place_id",
        "type_code",
        "languages",
        "access_0",
        "access_1",
        "access_2",
        "access_3",
        "availability",
    }
)

WHEELCHAIR_ACCESS_MAP = {
    "F": "Full",
    "A": "Assisted",
    "N": "None",
}

# (JSON source field, CSV output field)
FIELD_MAP = [
    ("id", "id"),
    ("location_name", "name"),
    ("district_name", "divisions"),
    ("suburb", "suburb"),
    ("postcode", "postcode"),
    ("address_detail1", "premises"),
    ("address_detail2", "address_partial"),
    ("address_detail3", "entrance_desc"),
    ("lat", "lat"),
    ("lng", "lon"),
]

CSV_FIELDS = [csv_field for _, csv_field in FIELD_MAP] + ["wheelchair_access"]

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


def validate_source_fields(places: list[dict]) -> None:
    """
    Check that the fields present across all records exactly match
    EXPECTED_SOURCE_FIELDS.  Raises ValueError if fields were added or removed,
    listing what changed so the scraper can be updated accordingly.
    """
    actual: frozenset[str] = frozenset().union(*(p.keys() for p in places))
    added = actual - EXPECTED_SOURCE_FIELDS
    removed = EXPECTED_SOURCE_FIELDS - actual
    if added or removed:
        lines = ["ECSA source fields have changed:"]
        if added:
            lines.append(f"  New fields:     {sorted(added)}")
        if removed:
            lines.append(f"  Missing fields: {sorted(removed)}")
        lines.append("Update EXPECTED_SOURCE_FIELDS and review the scraper logic.")
        raise ValueError("\n".join(lines))


# ---------------------------------------------------------------------------
# Fetching
# ---------------------------------------------------------------------------


def fetch_html(url: str) -> str:
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.text


# ---------------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------------


def extract_polling_places(html: str) -> list[dict]:
    """Locate and parse the App.pollingPlaces JSON array from raw HTML source."""
    match = re.search(r"App\.pollingPlaces\s*=\s*", html)
    if not match:
        raise ValueError("Could not find 'App.pollingPlaces' assignment in page source")

    decoder = json.JSONDecoder()
    try:
        data, _ = decoder.raw_decode(html, match.end())
    except json.JSONDecodeError as exc:
        raise ValueError(f"Could not parse App.pollingPlaces JSON: {exc}") from exc

    if not isinstance(data, list):
        raise ValueError(
            f"Expected App.pollingPlaces to be a list, got {type(data).__name__}"
        )

    return data


# ---------------------------------------------------------------------------
# Processing
# ---------------------------------------------------------------------------


def apply_patches(places: list[dict]) -> list[dict]:
    """
    Apply known patches to records with bad source data.

    For each patched field, the source value must still match the expected
    (bad) value. If it doesn't, an exception is raised — this means the
    upstream data has been corrected and the patch entry should be removed.
    """
    for place in places:
        name = place.get("location_name")
        if name not in PATCHES:
            continue
        for field, (expected_source, corrected_value) in PATCHES[name].items():
            actual = place.get(field)
            if actual != expected_source:
                raise ValueError(
                    f"Patch for {name!r} field {field!r} is stale: "
                    f"expected source value {expected_source!r} but got {actual!r}. "
                    f"Remove or update the patch."
                )
            place[field] = corrected_value
    return places


def clean_address(value: str | None) -> str:
    """Replace escaped slashes (\\/) with plain slashes (/)."""
    if not value:
        return ""
    return value.replace("\\/", "/")


def map_wheelchair_access(code: str, location_name: str) -> str:
    if code not in WHEELCHAIR_ACCESS_MAP:
        raise ValueError(
            f"Unknown wheelchair_access code {code!r} for place {location_name!r}"
        )
    return WHEELCHAIR_ACCESS_MAP[code]


def process_place(place: dict) -> dict | None:
    """
    Validate and transform a single polling place record.

    Returns None if the record should be filtered out, otherwise returns
    a dict ready for CSV output.

    Raises ValueError for unexpected field values.
    """
    location_name = place.get("location_name", "<unknown>")

    # --- Detect misclassified early voting centres ---
    if (
        "early voting centre" in location_name.lower()
        and place.get("type_code") != "EVC"
    ):
        raise ValueError(
            f"Place {location_name!r} looks like an EVC but has type_code "
            f"{place.get('type_code')!r}. Add a patch to PATCHES to fix this."
        )

    # --- Filter ---
    if place.get("type_code") == "EVC":
        return None

    # --- Validate archived ---
    archived = place.get("archived")
    if archived != 0:
        raise ValueError(
            f"Unexpected 'archived' value {archived!r} for place {location_name!r}"
        )

    # --- Validate availability ---
    availability = place.get("availability")
    if availability != EXPECTED_AVAILABILITY:
        print(
            f"WARNING: Unexpected 'availability' value {availability!r} for place {location_name!r} "
            f"(expected {EXPECTED_AVAILABILITY!r})",
            file=sys.stderr,
        )

    # --- Map fields ---
    row: dict = {}
    for json_field, csv_field in FIELD_MAP:
        value = place.get(json_field) or ""
        if json_field.startswith("address_detail"):
            value = clean_address(value)
        if json_field == "suburb":
            value = value.title()
        row[csv_field] = value

    # --- Wheelchair access ---
    row["wheelchair_access"] = map_wheelchair_access(
        place.get("disabled_access_id", ""), location_name
    )

    return row


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------


def write_csv(rows: list[dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def print_type_code_stats(places: list[dict]) -> None:
    counts = Counter(p.get("type_code") for p in places)
    print("\ntype_code counts (all records, before filtering):")
    for type_code, count in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {type_code or '<none>':20s} {count}")
    print(f"  {'TOTAL':20s} {sum(counts.values())}")
    print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    print(f"Fetching {ECSA_MAP_URL} ...")
    html = fetch_html(ECSA_MAP_URL)

    print("Extracting App.pollingPlaces ...")
    places = extract_polling_places(html)
    print(f"Found {len(places)} records")

    validate_source_fields(places)

    places = apply_patches(places)

    print_type_code_stats(places)

    rows: list[dict] = []
    for place in places:
        row = process_place(place)
        if row is not None:
            rows.append(row)

    print(f"\n{len(rows)} rows after filtering EVC entries")

    ids = [row["id"] for row in rows]
    if len(ids) != len(set(ids)):
        seen = set()
        dupes = [i for i in ids if i in seen or seen.add(i)]
        raise ValueError(f"Duplicate id values found in output rows: {dupes}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = OUTPUT_DIR / f"{timestamp} polling places.csv"
    write_csv(rows, output_path)
    print(f"CSV written to: {output_path}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
