"""The polling place loader's file rules, with no Django dependency.

LoadPollingPlaces (loader.py) runs these steps on every upload, and tools outside
Django (the scraper diff in diff/) import this module to apply an election's
config.json exactly as the loader would: converting rows to the loader's schema,
applying fix_data_issues, and checking values. Keep it free of Django imports.
"""

from __future__ import annotations

import math
import re
from collections.abc import Callable, Iterable
from typing import Any, Literal, TypedDict

from demsausage.app.enums import PollingPlaceState, PollingPlaceWheelchairAccess
from demsausage.numbers import convert_string_to_number, is_numeric

Row = dict[str, Any]


class FilterRule(TypedDict):
    type: Literal["is_exactly"]
    column: str
    matches: list[Any]


class ExtrasConfig(TypedDict):
    fields: list[str]


class RegexRule(TypedDict):
    field: str
    regex: str


class OverwriteRule(TypedDict):
    field: str
    value: Any


class FixRule(TypedDict):
    field: str
    value: Any
    overwrite: list[OverwriteRule]


class SchemaConfig(TypedDict, total=False):
    filters: list[FilterRule]
    rename_columns: dict[str, str]
    add_columns: dict[str, Any]
    extras: ExtrasConfig
    exclude_columns: list[str]
    cleaning_regexes: list[RegexRule]


SchemaStepCallback = Callable[[str, int, int, list[str]], None]

#: Fields every row must have after conversion (blank=False, null=False on the
#: PollingPlaces model, excluding geom/election/status, plus lat/lon). The loader
#: derives this from the model; tests/loader/test_loader_rules.py checks they match.
REQUIRED_FIELDS = ("name", "address", "state", "wheelchair_access", "lat", "lon")

#: Values the model accepts.
WHEELCHAIR_ACCESS_VALUES = tuple(e.value for e in PollingPlaceWheelchairAccess)
STATE_VALUES = tuple(e.value for e in PollingPlaceState)


# ---- convert_to_demsausage_schema steps, in the loader's order ----


def filter_rows(rows: list[Row], filters: list[FilterRule] | None) -> list[Row]:
    """Keep rows that pass all configured filters.

    An ``is_exactly`` filter keeps a row only when the named column value is
    in the filter's ``matches`` list.

    Args:
        rows: Polling place rows to filter.
        filters: Filter definitions from the election config, or ``None``.

    Returns:
        The rows that passed every filter. The input list is returned when no
        filters are configured.

    Example:
        ``filter_rows([{"state": "NSW"}], [{"type": "is_exactly",
        "column": "state", "matches": ["NSW"]}])`` returns the original row.
    """
    if filters is None:
        return rows

    def passes(row: Row) -> bool:
        for f in filters:
            if f["type"] == "is_exactly" and row[f["column"]] not in f["matches"]:
                return False
        return True

    return [row for row in rows if passes(row)]


def rename_columns(rows: list[Row], rename: dict[str, str] | None) -> list[Row]:
    """Rename columns on each row.

    Args:
        rows: Polling place rows to update.
        rename: A mapping from current column names to replacement names.

    Returns:
        The same list of rows after replacing the column names.
    """
    if rename is None:
        return rows
    for row in rows:
        for current_name, new_name in rename.items():
            row[new_name] = row[current_name]
            del row[current_name]
    return rows


def add_columns(rows: list[Row], columns: dict[str, Any] | None) -> list[Row]:
    """Add configured values to every row.

    Args:
        rows: Polling place rows to update.
        columns: Column names and values to add, or ``None``.

    Returns:
        The same list of rows after adding the columns.
    """
    if columns is None:
        return rows
    for row in rows:
        for name, value in columns.items():
            row[name] = value
    return rows


def create_extras(rows: list[Row], extras: ExtrasConfig | None) -> list[Row]:
    """Pack selected fields into each row's ``extras`` value.

    Numeric text is converted to a number. Text and other values are retained
    as supplied.

    Args:
        rows: Polling place rows to update.
        extras: Election config containing the ``fields`` list, or ``None``.

    Returns:
        The same list of rows after moving the configured fields.
    """
    if extras is None:
        return rows
    for row in rows:
        packed = {}
        for field_name in extras["fields"]:
            if is_numeric(row[field_name]) is True:
                packed[field_name] = convert_string_to_number(row[field_name])
            elif row[field_name] is not None:
                packed[field_name] = row[field_name]
            row.pop(field_name, None)
        row["extras"] = packed
    return rows


def exclude_columns(rows: list[Row], columns: Iterable[str] | None) -> list[Row]:
    """Remove configured columns from every row.

    Args:
        rows: Polling place rows to update.
        columns: Column names to remove, or ``None``.

    Returns:
        A new list of rows containing only the columns that were not excluded.
    """
    if columns is None:
        return rows
    columns = list(columns)
    return [{k: v for k, v in row.items() if k not in columns} for row in rows]


def run_regexes(
    rows: list[Row], regexes: list[RegexRule] | None
) -> tuple[list[Row], list[str]]:
    """Clean configured fields with regular expressions.

    Args:
        rows: Polling place rows to update.
        regexes: Cleaning definitions containing ``field`` and ``regex`` keys.
            Each expression must provide a named ``main`` capture group.

    Returns:
        A pair containing the updated rows and messages for values that did not
        match their configured expression.
    """
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


def to_schema(
    rows: list[Row],
    config: SchemaConfig | None,
    on_step: SchemaStepCallback | None = None,
) -> tuple[list[Row], list[str]]:
    """Convert rows using every file-rule step in loader order.

    Args:
        rows: Source rows read from the polling place file.
        config: The election's ``config.json`` conversion settings, or ``None``.
        on_step: Optional callback receiving each step name, row counts before
            and after, and any cleaning regex errors.

    Returns:
        A pair containing the converted rows and any cleaning regex errors.
    """
    config = config or {}

    def apply_step(
        name: str, setting: Any, step: Callable[[list[Row]], list[Row]]
    ) -> list[Row]:
        if setting is None:
            return rows
        before = len(rows)
        updated = step(rows)
        if on_step is not None:
            on_step(name, before, len(updated), [])
        return updated

    rows = apply_step(
        "filters",
        config.get("filters"),
        lambda current: filter_rows(current, config.get("filters")),
    )
    rows = apply_step(
        "rename_columns",
        config.get("rename_columns"),
        lambda current: rename_columns(current, config.get("rename_columns")),
    )
    rows = apply_step(
        "add_columns",
        config.get("add_columns"),
        lambda current: add_columns(current, config.get("add_columns")),
    )
    rows = apply_step(
        "extras",
        config.get("extras"),
        lambda current: create_extras(current, config.get("extras")),
    )
    rows = apply_step(
        "exclude_columns",
        config.get("exclude_columns"),
        lambda current: exclude_columns(current, config.get("exclude_columns")),
    )

    regexes = config.get("cleaning_regexes")
    if regexes is None:
        return rows, []
    before = len(rows)
    rows, errors = run_regexes(rows, regexes)
    if on_step is not None:
        on_step("cleaning_regexes", before, len(rows), errors)
    return rows, errors


# ---- fix_polling_places ----


def fix_matches(fix: FixRule, row: Row) -> bool:
    """Check whether a fix rule matches a row.

    Args:
        fix: A fix rule containing ``field`` and ``value`` keys.
        row: The polling place row to check.

    Returns:
        ``True`` when the rule's field exists and matches the row value.
    """
    return fix["field"] in row and str(row[fix["field"]]) == str(fix["value"])


def apply_fix(fix: FixRule, row: Row) -> Row:
    """Apply a fix rule's overwrites to a row.

    Args:
        fix: A fix rule containing overwrite field and value pairs.
        row: The polling place row to update.

    Returns:
        The updated row. Fields absent from the row are not added.
    """
    for overwrite in fix["overwrite"]:
        if overwrite["field"] in row:
            row[overwrite["field"]] = overwrite["value"]
    return row


def apply_fixes(rows: list[Row], fixes: list[FixRule] | None) -> list[Row]:
    """Apply fix rules to rows in their configured order.

    Args:
        rows: Polling place rows to update.
        fixes: Fix rules from the election config, or ``None``.

    Returns:
        The same list of rows after applying all matching fixes.
    """
    if fixes is None:
        return rows
    for fix in fixes:
        rows = [apply_fix(fix, row) if fix_matches(fix, row) else row for row in rows]
    return rows


# ---- prepare_polling_places: address and divisions ----


def _strip_text(value: Any) -> str:
    """Return a value as stripped text, using an empty string for no value."""
    return "" if value is None else str(value).strip()


def merge_address(
    row: Row, address_fields: list[str] | None, address_format: str | None
) -> tuple[Row, bool]:
    """Build an address from separate source fields when needed.

    Args:
        row: Polling place row to update.
        address_fields: Source field names used in the address format.
        address_format: Format string for joining the source fields.

    Returns:
        A pair containing the updated row and whether it has an address.

    Raises:
        ValueError: If a configured address field is missing or is ``None``.
    """
    if "address" in row:
        return row, True
    if address_format is None or address_fields is None:
        return row, False
    parts = {}
    for field in address_fields:
        if field not in row:
            raise ValueError(f"Missing address field {field!r}")
        if row[field] is None:
            raise ValueError(f"Address field {field!r} is None")
        parts[field] = _strip_text(row[field])
    address = address_format.format(**parts)
    # Tidy up after missing components
    address = re.sub(r"\s{2,}", " ", address)
    address = (
        address.replace(", ,", ",").replace(" , ", ", ").replace(",, ", ", ").strip()
    )
    address = address.strip(" ,")
    row["address"] = address
    for field in address_fields:
        row.pop(field, None)
    return row, True


def merge_divisions(row: Row, division_fields: list[str] | None) -> Row:
    """Normalize a row's division data into a list.

    Args:
        row: Polling place row to update.
        division_fields: Separate fields that may contain division names.

    Returns:
        The updated row with division names stored in ``divisions``.
        A ``None`` divisions value is treated as an empty list.
    """
    if "divisions" in row:
        value = row["divisions"]
        row["divisions"] = (
            []
            if value is None
            else [d.strip() for d in str(value).split(",") if d.strip()]
        )
        return row
    if division_fields is not None:
        row["divisions"] = [
            _strip_text(value)
            for key, value in dict(row).items()
            if key in division_fields and _strip_text(value)
        ]
        for field in division_fields:
            row.pop(field, None)
    return row


# ---- value checks (a subset of what the loader's serializer and checks enforce) ----


def _coordinate_is_valid(value: Any, low: float, high: float) -> bool:
    """Check whether a coordinate is numeric, finite, and inside its range."""
    if not is_numeric(value):
        return False
    try:
        number = float(value)
    except (TypeError, ValueError):
        return False
    return math.isfinite(number) and low <= number <= high


def row_problems(row: Row) -> list[str]:
    """Find validation problems that can be checked without the database.

    Args:
        row: Converted polling place row to validate.

    Returns:
        Human-readable messages describing missing fields, invalid values, or
        coordinates outside their supported ranges.
    """
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
        if field not in row:
            continue
        value = row[field]
        if isinstance(value, str) and not value.strip():
            continue  # blank coordinates are geocoded by the loader when geocoding is on
        if not _coordinate_is_valid(value, low, high):
            problems.append(f"{field} {value!r} isn't a valid coordinate")
    return problems
