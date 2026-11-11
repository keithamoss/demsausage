#!/usr/bin/env python3
"""
Transform step for the VIC 2026 state election (offline; reads the scrape cache only).

The spreadsheet is the source of truth; the API supplies lat/lon, the VEC venue ID and host district.

Usage: python transform.py [path/to/<stamp> scrape.json]   (defaults to the latest complete scrape)
"""

import argparse
import csv
import re
import sys
from pathlib import Path

from common import (
    CACHE_DIR,
    DATA_DIR,
    ApiVenue,
    PollingPlaceOutputRow,
    ScrapeCache,
    Venue,
    describe_api_record,
    latest_complete_cache_path,
    load_cache,
    load_evc_keys,
    load_vc_venues,
    match_venues,
    norm,
    parse_api_address_line_3,
    warnings_path_for_stamp,
)

EXPECTED_API_FIELDS = frozenset(
    {
        "venueId",
        "venueName",
        "name",
        "votingCentreType",
        "votingCentreTypeId",
        "accessibilityId",
        "wheelChairAccessType",
        "accessibilityDetails",
        "phoneNumber",
        "addressLine1",
        "addressLine2",
        "addressLine3",
        "latitude",
        "longitude",
        "operationDetails",
        "locationComment",
        "hostElectorateName",
        "hostElectorateType",
    }
)

WHEELCHAIR_ACCESS_MAP = {
    "LNWA": "None",
    "AWA": "Assisted",
    "IWA": "Full",
    None: "Unknown",
}

API_ACCESSIBILITY_IDS = {0: "LNWA", 1: "AWA", 2: "IWA", 4: None}

# Parenthesised Address Line 2 values are directions, e.g. "(access via X)", "(entry via X)", "(opposite X)"
ENTRANCE_RE = re.compile(r"^\((?P<text>.+)\)$")

# Joint voting centre markers: HJVC = host district's row, JVC = guest district's row
JOINT_SUFFIX_RE = re.compile(r"\s*\((?P<marker>H?JVC)\)$")

OPENING_HOURS = "8am to 6pm"
EXPECTED_ELECTION_DAY_HOURS = ("08:00", "18:00")
API_ONLY_VENUE_IDS = frozenset({"78927c1c-78c8-45bd-7f68-08df3bca53bf"})

TYPOGRAPHIC_TO_ASCII = str.maketrans(
    {
        "\u2010": "-",  # hyphen
        "\u2011": "-",  # non-breaking hyphen
        "\u2012": "-",  # figure dash
        "\u2013": "-",  # en dash
        "\u2014": "-",  # em dash
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2026": "...",
        "\u00a0": " ",  # non-breaking space
    }
)

CSV_FIELDS = [
    "name",
    "premises",
    "address",
    "lat",
    "lon",
    "state",
    "divisions",
    "wheelchair_access",
    "wheelchair_access_description",
    "entrance_desc",
    "opening_hours",
    "vec_venue_id",
    "host_district",
    "is_early_voting_centre",
    "est_ordinary_votes",
    "est_absent_votes",
]


def validate_api_fields(voting_centres: dict[str, ApiVenue]) -> None:
    actual_fields: set[str] = set()
    for record in voting_centres.values():
        actual_fields.update(record.keys())
    actual = frozenset(actual_fields)
    if actual != EXPECTED_API_FIELDS:
        raise ValueError(
            f"VEC API fields have changed. New: {sorted(actual - EXPECTED_API_FIELDS)} "
            f"Missing: {sorted(EXPECTED_API_FIELDS - actual)}"
        )


def parse_estimate(value: str | float | None) -> int | None:
    return None if value is None else int(value)


def sum_estimates(values: list[int | None]) -> int | None:
    if any(value is None for value in values):
        return None
    return sum(value for value in values if value is not None)


def clean_text(value: str) -> str:
    return " ".join(value.translate(TYPOGRAPHIC_TO_ASCII).split())


def venue_warnings(venue: Venue, api_record: ApiVenue, election_date: str) -> list[str]:
    """Places where the VEC map disagrees with the spreadsheet; the spreadsheet still wins."""
    warnings: list[str] = []
    label = f"{venue.name} ({api_record['hostElectorateName']})"

    hours = [
        (o["operatingFrom"][11:16], o["operatingTo"][11:16])
        for o in api_record["operationDetails"]
        if o["operatingFrom"][:10] == election_date
    ]
    if not hours:
        warnings.append(
            f"{label}: no election day hours on the VEC map (closed or provisional?)"
        )
    elif hours != [EXPECTED_ELECTION_DAY_HOURS]:
        warnings.append(
            f"{label}: unexpected election day hours on the VEC map: {hours}"
        )

    api_accessibility = API_ACCESSIBILITY_IDS.get(api_record["accessibilityId"], "?")
    if api_accessibility != venue.accessibility:
        warnings.append(
            f"{label}: wheelchair rating is {venue.accessibility} in the spreadsheet but "
            f"{api_record['wheelChairAccessType']!r} (id {api_record['accessibilityId']}) on the VEC map"
        )

    return warnings


def location_name(venue: Venue, host_district: str) -> str:
    """The host district's Voting Location Name, without its joint voting centre marker."""
    host_row = venue.rows[venue.districts.index(host_district)]
    match = JOINT_SUFFIX_RE.search(host_row["Voting Location Name"])
    marker = match["marker"] if match else None
    expected_marker = "HJVC" if len(venue.rows) > 1 else None
    if marker != expected_marker:
        raise ValueError(
            f"{venue.name!r}: host district {host_district!r} row is marked {marker!r}, expected {expected_marker!r}"
        )
    return JOINT_SUFFIX_RE.sub("", host_row["Voting Location Name"])


def transform_venue(
    venue: Venue, api_record: ApiVenue, is_evc: bool
) -> PollingPlaceOutputRow:
    if venue.accessibility not in WHEELCHAIR_ACCESS_MAP:
        raise ValueError(
            f"Unknown Accessibility {venue.accessibility!r} for {venue.name!r}"
        )

    address_parts = [venue.address_line_1]
    entrance_desc = ""
    entrance = ENTRANCE_RE.match(venue.address_line_2)
    if entrance:
        text = entrance["text"]
        entrance_desc = text[0].upper() + text[1:]
    elif venue.address_line_2:
        address_parts.append(venue.address_line_2)
    address_parts.append(f"{venue.suburb} VIC {venue.postcode}")

    host_district = api_record["hostElectorateName"]
    if host_district not in venue.districts:
        raise ValueError(
            f"{venue.name!r}: API host district {host_district!r} not in spreadsheet districts {venue.districts}"
        )
    # Loader convention: home division first, then the rest sorted
    divisions = [host_district] + sorted(
        d for d in venue.districts if d != host_district
    )

    votes = [
        (parse_estimate(r["Est. Ord Votes"]), parse_estimate(r["Est. Absent Votes"]))
        for r in venue.rows
    ]

    return {
        "name": location_name(venue, host_district),
        "premises": venue.name,
        "address": ", ".join(address_parts),
        "lat": api_record["latitude"],
        "lon": api_record["longitude"],
        "state": "VIC",
        "divisions": ", ".join(divisions),
        "wheelchair_access": WHEELCHAIR_ACCESS_MAP[venue.accessibility],
        "wheelchair_access_description": venue.wheelchair_description,
        "entrance_desc": entrance_desc,
        "opening_hours": OPENING_HOURS,
        "vec_venue_id": api_record["venueId"],
        "host_district": host_district,
        "is_early_voting_centre": int(is_evc),
        "est_ordinary_votes": sum_estimates([ordinary for ordinary, _ in votes]),
        "est_absent_votes": sum_estimates([absent for _, absent in votes]),
    }


def transform_api_only_venue(
    api_record: ApiVenue, evc_keys: set[tuple[str, str, str]]
) -> PollingPlaceOutputRow:
    accessibility_id = api_record["accessibilityId"]
    if accessibility_id not in API_ACCESSIBILITY_IDS:
        raise ValueError(
            f"Unknown API accessibility id {accessibility_id} for {api_record['venueName']!r}"
        )
    accessibility = API_ACCESSIBILITY_IDS[accessibility_id]
    if accessibility not in WHEELCHAIR_ACCESS_MAP:
        raise ValueError(
            f"Unknown API accessibility {accessibility!r} for {api_record['venueName']!r}"
        )

    address_parts = [api_record["addressLine1"]]
    entrance_desc = ""
    entrance = ENTRANCE_RE.match(api_record["addressLine2"])
    if entrance:
        text = entrance["text"]
        entrance_desc = text[0].upper() + text[1:]
    elif api_record["addressLine2"]:
        address_parts.append(api_record["addressLine2"])
    address_parts.append(api_record["addressLine3"])

    suburb, _ = parse_api_address_line_3(api_record)
    if suburb is None:
        raise ValueError(
            f"Could not parse API address for {api_record['venueName']!r}"
        )
    evc_key = (
        norm(api_record["venueName"]),
        norm(api_record["addressLine1"]),
        norm(suburb),
    )
    accessibility_details = "; ".join(
        detail["description"] for detail in api_record["accessibilityDetails"]
    )

    return {
        "name": api_record["name"],
        "premises": api_record["venueName"],
        "address": ", ".join(address_parts),
        "lat": api_record["latitude"],
        "lon": api_record["longitude"],
        "state": "VIC",
        "divisions": api_record["hostElectorateName"],
        "wheelchair_access": WHEELCHAIR_ACCESS_MAP[accessibility],
        "wheelchair_access_description": accessibility_details,
        "entrance_desc": entrance_desc,
        "opening_hours": OPENING_HOURS,
        "vec_venue_id": api_record["venueId"],
        "host_district": api_record["hostElectorateName"],
        "is_early_voting_centre": int(evc_key in evc_keys),
        "est_ordinary_votes": None,
        "est_absent_votes": None,
    }


def build_rows(
    cache: ScrapeCache,
) -> tuple[list[PollingPlaceOutputRow], list[str], list[str]]:
    """Returns (rows, errors, warnings). Rows must not be written if there are errors."""
    spreadsheet_path = CACHE_DIR / cache["spreadsheet"]["filename"]
    venues = load_vc_venues(spreadsheet_path)
    evc_keys = load_evc_keys(spreadsheet_path)
    validate_api_fields(cache["voting_centres"])
    election_date = cache["election"]["electionDate"][:10]

    result = match_venues(venues, cache["voting_centres"])
    errors: list[str] = [
        f"STALE ALIAS (remove from VENUE_KEY_ALIASES): {key}"
        for key in result.stale_aliases
    ]
    errors += [f"NOT FOUND IN API: {v.describe()}" for v in result.unmatched_venues]
    unknown_api_records = {r["venueId"]: r for r in result.unknown_api_records}
    for venue_id in sorted(API_ONLY_VENUE_IDS - cache["voting_centres"].keys()):
        errors.append(f"APPROVED API-ONLY VENUE NOT FOUND IN API: {venue_id}")
    errors += [
        f"NOT IN SPREADSHEET: {describe_api_record(record)}"
        for venue_id, record in unknown_api_records.items()
        if venue_id not in API_ONLY_VENUE_IDS
    ]
    warnings: list[str] = []
    rows: list[PollingPlaceOutputRow] = []

    for key, records in result.matched.items():
        venue = venues[key]
        if len({(r["latitude"], r["longitude"]) for r in records}) > 1:
            errors.append(
                f"MULTIPLE API LOCATIONS: {venue.describe()} -> {[r['venueId'] for r in records]}"
            )
            continue
        rows.append(transform_venue(venue, records[0], key in evc_keys))
        warnings += venue_warnings(venue, records[0], election_date)

    for venue_id in API_ONLY_VENUE_IDS.intersection(unknown_api_records):
        record = unknown_api_records[venue_id]
        rows.append(transform_api_only_venue(record, evc_keys))
        api_hours = [
            (o["operatingFrom"][11:16], o["operatingTo"][11:16])
            for o in record["operationDetails"]
            if o["operatingFrom"][:10] == election_date
        ]
        if not api_hours:
            warnings.append(
                f"{record['name']}: no election day hours on the VEC map (closed or provisional?)"
            )
        elif api_hours != [EXPECTED_ELECTION_DAY_HOURS]:
            warnings.append(
                f"{record['name']}: unexpected election day hours on the VEC map: {api_hours}"
            )

    names_by_coords: dict[tuple[float, float], list[str]] = {}
    for row in rows:
        names_by_coords.setdefault((row["lat"], row["lon"]), []).append(row["name"])
    errors += [
        f"SHARED COORDINATES {coords}: {names}"
        for coords, names in names_by_coords.items()
        if len(names) > 1
    ]

    text_fields = (
        "name",
        "premises",
        "address",
        "state",
        "divisions",
        "wheelchair_access",
        "wheelchair_access_description",
        "entrance_desc",
        "opening_hours",
        "vec_venue_id",
        "host_district",
    )
    for row in rows:
        for field in text_fields:
            row[field] = clean_text(row[field])
            if not row[field].isascii():
                warnings.append(
                    f"{row['name']}: non-ASCII left in {field}: {row[field]!r}"
                )

    rows.sort(key=lambda r: (r["host_district"], r["name"]))
    return rows, errors, warnings


def write_csv(rows: list[PollingPlaceOutputRow], path: Path) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def main(cache_path: Path | None = None) -> int:
    cache_path = cache_path or latest_complete_cache_path()
    cache = load_cache(cache_path)
    if not cache["complete"]:
        raise ValueError(
            f"{cache_path.name} is incomplete; re-run scrape.py to finish it."
        )
    spreadsheet = cache["spreadsheet"]
    print(
        f"Using {cache_path.name} (spreadsheet Last-Modified {spreadsheet['last_modified']}; {spreadsheet['information_date']})"
    )

    rows, errors, warnings = build_rows(cache)

    for warning in warnings:
        print(f"WARNING: {warning}")
    if errors:
        print("\n".join(errors))
        print(f"\n{len(errors)} problem(s) found; no CSV written.")
        return 1

    output_path = DATA_DIR / f"{cache['stamp']} polling places.csv"
    write_csv(rows, output_path)
    warnings_path_for_stamp(cache["stamp"]).write_text(
        "".join(f"{w}\n" for w in warnings), encoding="utf-8"
    )
    print(
        f"Wrote {len(rows)} polling places ({sum(r['is_early_voting_centre'] for r in rows)} also EVCs) to {output_path}"
    )
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "cache",
        nargs="?",
        type=Path,
        help="scrape cache to use (default: latest complete)",
    )
    sys.exit(main(parser.parse_args().cache))
