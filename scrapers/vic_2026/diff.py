#!/usr/bin/env python3
"""
Compare two transform outputs, keyed by VEC venue ID. Prints the report and saves it to diffs/.

Usage: python diff.py [old.csv new.csv]   (defaults to the two most recent outputs in data/)
"""

import argparse
import csv
import math
import sys
from collections.abc import Mapping
from datetime import datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from common import (
    DIFFS_DIR,
    ScrapeCache,
    cache_path_for_output,
    load_cache,
    output_paths,
    output_stamp,
    warnings_path_for_stamp,
)

KEY = "vec_venue_id"
CsvRow = dict[str, str]


def load(path: Path) -> dict[str, CsvRow]:
    with open(path, newline="", encoding="utf-8") as f:
        reader: csv.DictReader[str] = csv.DictReader(f)
        if not reader.fieldnames or reader.fieldnames.count(KEY) != 1:
            raise ValueError(f"{path.name} must contain exactly one {KEY!r} column")
        rows: dict[str, CsvRow] = {}
        for line_number, raw_row in enumerate(reader, start=2):
            if None in raw_row or any(
                not isinstance(value, str) for value in raw_row.values()
            ):
                raise ValueError(f"{path.name}:{line_number} has an invalid CSV row")
            row: CsvRow = {
                key: value
                for key, value in raw_row.items()
                if key is not None and isinstance(value, str)
            }
            identifier = row.get(KEY)
            if not identifier or identifier != identifier.strip():
                raise ValueError(
                    f"{path.name}:{line_number} has a blank or invalid {KEY}"
                )
            if identifier in rows:
                raise ValueError(
                    f"{path.name}:{line_number} duplicates {KEY} {identifier!r}"
                )
            rows[identifier] = row
        return rows


def load_warnings(csv_path: Path) -> set[str] | None:
    path = warnings_path_for_stamp(output_stamp(csv_path))
    return set(path.read_text(encoding="utf-8").splitlines()) if path.exists() else None


def warning_lines(old_path: Path, new_path: Path) -> list[str]:
    old, new = load_warnings(old_path), load_warnings(new_path)
    if old is None or new is None:
        return [
            "Warnings were not recorded for both outputs, so they cannot be compared.",
            "",
        ]
    added, resolved = sorted(new - old), sorted(old - new)
    lines = [f"{len(new)} total; {len(added)} new; {len(resolved)} resolved."]

    def warning_group(warning: str) -> str:
        value = warning.lower()
        if "no election day hours" in value:
            return "No election-day hours"
        if "wheelchair rating" in value:
            return "Wheelchair rating mismatch"
        return "Other warnings"

    grouped: dict[str, list[tuple[str, str]]] = {}
    for label, warnings, csv_path in (
        ("Still present", new & old, new_path),
        ("New", added, new_path),
        ("Resolved", resolved, old_path),
    ):
        for warning in warnings:
            grouped.setdefault(warning_group(warning), []).append(
                (label, format_warning(warning, csv_path))
            )

    for group in sorted(grouped):
        lines += ["", f"### {group}"]
        lines += [
            f"- **{label}:** {warning}" for label, warning in sorted(grouped[group])
        ]
    return lines + [""]


def format_warning(warning: str, csv_path: Path) -> str:
    label, separator, detail = warning.partition(": ")
    premises, marker, district = label.rpartition(" (")
    if not separator or not marker or not district.endswith(")"):
        return warning

    district = district[:-1]
    for row in load(csv_path).values():
        if row.get("premises") == premises and row.get("host_district") == district:
            return f"{venue_label_for_summary(row)}: {detail}"
    return warning


def summary_text(
    old: dict[str, CsvRow],
    new: dict[str, CsvRow],
    added: list[str],
    removed: list[str],
    modified: list[str],
    old_cache: ScrapeCache | None,
    old_path: Path,
    new_path: Path,
) -> str:
    delta = len(new) - len(old)
    previous_load_date = (
        format_awst_date(old_cache["started_at"]) if old_cache else None
    )
    change = f"Latest load: {len(new):,} polling places"
    if delta > 0:
        comparison = (
            f"up {delta} from {previous_load_date}"
            if previous_load_date
            else f"up {delta}"
        )
    elif delta < 0:
        comparison = (
            f"down {abs(delta)} from {previous_load_date}"
            if previous_load_date
            else f"down {abs(delta)}"
        )
    else:
        comparison = (
            f"unchanged from {previous_load_date}"
            if previous_load_date
            else "unchanged"
        )
    change += f", {comparison}"
    changes: list[str] = []
    if added:
        changes.append(
            "added: " + ", ".join(venue_label_for_summary(new[k]) for k in added)
        )
    if removed:
        changes.append(
            "removed: " + ", ".join(venue_label_for_summary(old[k]) for k in removed)
        )
    if changes:
        change += f" ({'; '.join(changes)})"
    sentences: list[str] = [change + "."]

    address_changes: list[str] = [
        venue_label_for_summary(new[k])
        for k in modified
        if old[k].get("address") != new[k].get("address")
    ]

    shifts: list[str] = []
    for key in modified:
        if {"lat", "lon"} & {
            field
            for field in ("lat", "lon")
            if old[key].get(field) != new[key].get(field)
        }:
            distance = coordinate_shift_metres(old[key], new[key])
            if distance is not None:
                shifts.append(f"{venue_label_for_summary(new[key])} ({distance:.1f} m)")
    update_details: list[str] = []
    if address_changes:
        update_details.append("address changes at " + ", ".join(address_changes))
    if shifts:
        update_details.append("coordinate shifts at " + ", ".join(shifts))
    if modified:
        details = "; ".join(update_details) if update_details else "other field changes"
        sentences.append(
            f"{len(modified)} existing polling places changed, including {details}."
        )

    old_warnings, new_warnings = load_warnings(old_path), load_warnings(new_path)
    if old_warnings is not None and new_warnings is not None:
        sentences.append(
            f"Warnings: {len(new_warnings)} remain, {len(new_warnings - old_warnings)} new, "
            f"{len(old_warnings - new_warnings)} resolved."
        )
    return "\n\n".join(sentences)


def venue_label_for_summary(row: Mapping[str, str]) -> str:
    premises = row.get("premises", "")
    return (
        f"{premises} ({row['name']})"
        if premises and premises != row["name"]
        else row["name"]
    )


def format_awst(timestamp: str, *, is_http_date: bool = False) -> str:
    value = (
        parsedate_to_datetime(timestamp)
        if is_http_date
        else datetime.fromisoformat(timestamp)
    )
    if value.tzinfo is None:
        value = value.replace(tzinfo=ZoneInfo("Australia/Perth"))
    return value.astimezone(ZoneInfo("Australia/Perth")).strftime(
        "%Y-%m-%d %H:%M:%S AWST"
    )


def format_awst_date(timestamp: str) -> str:
    value = datetime.fromisoformat(timestamp)
    if value.tzinfo is None:
        value = value.replace(tzinfo=ZoneInfo("Australia/Perth"))
    value = value.astimezone(ZoneInfo("Australia/Perth"))
    return f"{value:%A} {value.day} {value:%b}"


def coordinate_shift_metres(
    old: Mapping[str, str], new: Mapping[str, str]
) -> float | None:
    try:
        old_lat, old_lon = float(old["lat"]), float(old["lon"])
        new_lat, new_lon = float(new["lat"]), float(new["lon"])
    except (KeyError, TypeError, ValueError):
        return None

    lat1, lat2 = math.radians(old_lat), math.radians(new_lat)
    delta_lat = lat2 - lat1
    delta_lon = math.radians(new_lon - old_lon)
    haversine = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2) ** 2
    )
    return 2 * 6_371_008.8 * math.asin(math.sqrt(haversine))


def describe_source(csv_path: Path, row_count: int, cache: ScrapeCache | None) -> str:
    if cache is None:
        return "\n".join(
            [
                f"- File: `{csv_path.name}`",
                f"- Polling places: {row_count}",
                "- Scrape metadata: unavailable",
            ]
        )
    spreadsheet = cache["spreadsheet"]
    last_modified = spreadsheet["last_modified"]
    finished_at = cache["finished_at"]
    last_modified_display = (
        f"{format_awst(last_modified, is_http_date=True)} ({last_modified})"
        if last_modified is not None
        else "unknown"
    )
    return (
        f"- File: `{csv_path.name}`\n"
        f"- Polling places: {row_count}\n"
        f"- Scrape started: {format_awst(cache['started_at'])}\n"
        f"- Scrape finished: {format_awst(finished_at) if finished_at is not None else 'not finished'}\n"
        f"- Spreadsheet last modified: {last_modified_display}\n"
        f"- Spreadsheet says: {spreadsheet.get('information_date') or 'information date unknown'}\n"
        f"- Spreadsheet SHA-256: `{spreadsheet['sha256'][:12]}`"
    )


def build_report(old_path: Path, new_path: Path) -> list[str]:
    old, new = load(old_path), load(new_path)
    removed = sorted(old.keys() - new.keys(), key=lambda k: old[k]["name"])
    added = sorted(new.keys() - old.keys(), key=lambda k: new[k]["name"])
    modified = sorted(
        (k for k in old.keys() & new.keys() if old[k] != new[k]),
        key=lambda k: new[k]["name"],
    )
    old_cache_path, new_cache_path = cache_path_for_output(
        old_path
    ), cache_path_for_output(new_path)
    old_cache = load_cache(old_cache_path) if old_cache_path.exists() else None
    new_cache = load_cache(new_cache_path) if new_cache_path.exists() else None
    old_sheet = old_cache["spreadsheet"] if old_cache else None
    new_sheet = new_cache["spreadsheet"] if new_cache else None

    lines = [
        "# Polling Place Data Diff",
        "",
        "## Summary",
        "",
        summary_text(old, new, added, removed, modified, old_cache, old_path, new_path),
        "",
    ]
    if old_sheet and new_sheet and old_sheet["sha256"] == new_sheet["sha256"]:
        lines += [
            "The spreadsheet is unchanged; any differences come from the VEC map.",
            "",
        ]
    lines += ["## Warnings", ""] + warning_lines(old_path, new_path)
    lines += [
        "## Changes",
        "",
        f"**{len(added)} added, {len(removed)} removed, {len(modified)} modified**",
        "",
    ]

    if added:
        lines += ["### Added", ""]
        lines += [
            f"- **{venue_label_for_summary(new[k])}**: {new[k]['address']} ({new[k]['divisions']})"
            for k in added
        ]
        lines.append("")
    if removed:
        lines += ["### Removed", ""]
        lines += [
            f"- **{venue_label_for_summary(old[k])}**: {old[k]['address']} ({old[k]['divisions']})"
            for k in removed
        ]
        lines.append("")
    if modified:
        lines += ["### Modified", ""]
        for k in modified:
            lines.append(f"#### {venue_label_for_summary(new[k])}")
            changed_fields = [
                field for field in new[k] if old[k].get(field) != new[k][field]
            ]
            shift = (
                coordinate_shift_metres(old[k], new[k])
                if {"lat", "lon"} & set(changed_fields)
                else None
            )
            if shift is not None:
                lines.append(
                    f"- Coordinates: `({old[k]['lat']}, {old[k]['lon']})` -> "
                    f"`({new[k]['lat']}, {new[k]['lon']})` (shift: {shift:.1f} m)"
                )
                changed_fields = [
                    field for field in changed_fields if field not in {"lat", "lon"}
                ]
            lines += [
                f"- `{field}`: `{old[k].get(field)}` -> `{new[k][field]}`"
                for field in changed_fields
            ]
            lines.append("")
    lines += [
        "## Source Details",
        "",
        "### Previous File",
        describe_source(old_path, len(old), old_cache),
        "",
        "### Latest File",
        describe_source(new_path, len(new), new_cache),
        "",
    ]
    return lines


def main(old_path: Path | None = None, new_path: Path | None = None) -> int:
    if old_path is None or new_path is None:
        outputs = output_paths()
        if len(outputs) < 2:
            print("Need at least two outputs in data/ to diff.")
            return 1
        old_path, new_path = outputs[-2], outputs[-1]

    lines = build_report(old_path, new_path)
    print("\n".join(lines))

    DIFFS_DIR.mkdir(exist_ok=True)
    report_path = (
        DIFFS_DIR
        / f"{old_path.name.removesuffix('.csv')} vs {new_path.name.removesuffix('.csv')}.md"
    )
    report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nReport saved to {report_path}")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("old", nargs="?", type=Path)
    parser.add_argument("new", nargs="?", type=Path)
    args = parser.parse_args()
    sys.exit(main(args.old, args.new))
