"""The polling place loader's file rules, with no Django dependency.

LoadPollingPlaces (loader.py) runs these steps on every upload, and tools outside
Django (the scraper diff in diff/) import this module to apply an election's
config.json exactly as the loader would: converting rows to the loader's schema,
applying fix_data_issues, and checking values. Keep it free of Django imports.
"""

from __future__ import annotations

import re
from collections.abc import Iterable
from typing import Any

from demsausage.app.enums import PollingPlaceState, PollingPlaceWheelchairAccess
from demsausage.numbers import convert_string_to_number, is_numeric

Row = dict[str, Any]

#: Fields every row must have after conversion (blank=False, null=False on the
#: PollingPlaces model, excluding geom/election/status, plus lat/lon). The loader
#: derives this from the model; tests/loader/test_loader_rules.py checks they match.
REQUIRED_FIELDS = ("name", "address", "state", "wheelchair_access", "lat", "lon")

#: Values the model accepts.
WHEELCHAIR_ACCESS_VALUES = tuple(e.value for e in PollingPlaceWheelchairAccess)
STATE_VALUES = tuple(e.value for e in PollingPlaceState)


# ---- convert_to_demsausage_schema steps, in the loader's order ----


def filter_rows(rows: list[Row], filters: list[dict] | None) -> list[Row]:
    """Keep rows passing every filter ("is_exactly": the column's value is in matches)."""
    if filters is None:
        return rows

    def passes(row: Row) -> bool:
        for f in filters:
            if f["type"] == "is_exactly" and row[f["column"]] not in f["matches"]:
                return False
        return True

    return [row for row in rows if passes(row)]


def rename_columns(rows: list[Row], rename: dict[str, str] | None) -> list[Row]:
    """Rename columns in place (current name -> new name)."""
    if rename is None:
        return rows
    for row in rows:
        for current_name, new_name in rename.items():
            row[new_name] = row[current_name]
            del row[current_name]
    return rows


def add_columns(rows: list[Row], columns: dict[str, Any] | None) -> list[Row]:
    """Set the same value for a column on every row."""
    if columns is None:
        return rows
    for row in rows:
        for name, value in columns.items():
            row[name] = value
    return rows


def create_extras(rows: list[Row], extras: dict | None) -> list[Row]:
    """Move extras["fields"] into an "extras" dict on each row (numbers converted)."""
    if extras is None:
        return rows
    for row in rows:
        packed = {}
        for field_name in extras["fields"]:
            if is_numeric(row[field_name]) is True:
                packed[field_name] = convert_string_to_number(row[field_name])
            elif row[field_name] is not None:
                packed[field_name] = row[field_name]
            del row[field_name]
        row["extras"] = packed
    return rows


def exclude_columns(rows: list[Row], columns: Iterable[str] | None) -> list[Row]:
    """Drop the named columns."""
    if columns is None:
        return rows
    columns = list(columns)
    return [{k: v for k, v in row.items() if k not in columns} for row in rows]


def run_regexes(
    rows: list[Row], regexes: list[dict] | None
) -> tuple[list[Row], list[str]]:
    """Replace each regex's field with its "main" group. Returns rows and error messages
    for values the regex didn't match (the loader logs those as errors)."""
    errors: list[str] = []
    if regexes is None:
        return rows, errors
    for row in rows:
        for regex in regexes:
            match = re.search(regex["regex"], row[regex["field"]].strip())
            if match:
                row[regex["field"]] = match.groupdict()["main"].strip()
            else:
                errors.append(
                    "Cleaning regex '{}' did not match field value '{}'".format(
                        regex["regex"], row[regex["field"]]
                    )
                )
    return rows, errors


def to_schema(rows: list[Row], config: dict | None) -> tuple[list[Row], list[str]]:
    """All of convert_to_demsausage_schema, in the loader's order. Returns rows and errors."""
    config = config or {}
    rows = filter_rows(rows, config.get("filters"))
    rows = rename_columns(rows, config.get("rename_columns"))
    rows = add_columns(rows, config.get("add_columns"))
    rows = create_extras(rows, config.get("extras"))
    rows = exclude_columns(rows, config.get("exclude_columns"))
    return run_regexes(rows, config.get("cleaning_regexes"))


# ---- fix_polling_places ----


def fix_matches(fix: dict, row: Row) -> bool:
    """Whether a fix_data_issues entry selects this row."""
    return fix["field"] in row and str(row[fix["field"]]) == str(fix["value"])


def apply_fix(fix: dict, row: Row) -> Row:
    """Apply one entry's overwrites to a row it selects (only fields the row has)."""
    for overwrite in fix["overwrite"]:
        if overwrite["field"] in row:
            row[overwrite["field"]] = overwrite["value"]
    return row


def apply_fixes(rows: list[Row], fixes: list[dict] | None) -> list[Row]:
    """Apply every fix_data_issues entry in order, as the loader does."""
    if fixes is None:
        return rows
    for fix in fixes:
        rows = [apply_fix(fix, row) if fix_matches(fix, row) else row for row in rows]
    return rows


# ---- prepare_polling_places: address and divisions ----


def merge_address(
    row: Row, address_fields: list[str] | None, address_format: str | None
) -> tuple[Row, bool]:
    """Build "address" from address_fields with address_format (dropping those fields),
    unless the row already has one. Returns the row and whether it has an address."""
    if "address" in row:
        return row, True
    if address_format is None:
        return row, False
    parts = {k: v.strip() for k, v in dict(row).items() if k in address_fields}
    address = address_format.format(**parts)
    # Tidy up after missing components
    address = re.sub(r"\s{2,}", " ", address)
    address = (
        address.replace(", ,", ",").replace(" , ", ", ").replace(",, ", ", ").strip()
    )
    if address.startswith(","):
        address = address[1:]
    if address.endswith(","):
        address = address[:-1]
    row["address"] = address
    for field in address_fields:
        del row[field]
    return row, True


def merge_divisions(row: Row, division_fields: list[str] | None) -> Row:
    """Split "divisions" on commas, or gather division_fields into a list (dropping them)."""
    if "divisions" in row:
        row["divisions"] = [d.strip() for d in row["divisions"].split(",")]
        return row
    if division_fields is not None:
        row["divisions"] = [
            value.strip()
            for key, value in dict(row).items()
            if key in division_fields and value.strip() != ""
        ]
        for field in division_fields:
            del row[field]
    return row


# ---- value checks (a subset of what the loader's serializer and checks enforce) ----


def row_problems(row: Row) -> list[str]:
    """Problems the loader would reject a converted row for, as far as they can be
    checked without the database (no boundary or serializer checks)."""
    problems = []
    for field in REQUIRED_FIELDS:
        if field not in row:
            problems.append(f"missing field {field!r}")
    for field in ("name", "address"):
        if field in row and not str(row[field] or "").strip():
            problems.append(f"{field} is blank")
    if (
        "wheelchair_access" in row
        and row["wheelchair_access"] not in WHEELCHAIR_ACCESS_VALUES
    ):
        problems.append(
            f"wheelchair_access {row['wheelchair_access']!r} isn't one of {', '.join(WHEELCHAIR_ACCESS_VALUES)}"
        )
    if "state" in row and row["state"] not in STATE_VALUES:
        problems.append(
            f"state {row['state']!r} isn't one of {', '.join(STATE_VALUES)}"
        )
    for field, low, high in (("lat", -90, 90), ("lon", -180, 180)):
        value = row.get(field)
        if value in (None, ""):
            continue  # blank coordinates are geocoded by the loader when geocoding is on
        if not is_numeric(value) or not low <= float(value) <= high:
            problems.append(f"{field} {value!r} isn't a valid coordinate")
    return problems
