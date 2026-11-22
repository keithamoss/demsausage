"""Building a diff from two files and one matcher's linkage result.

The linkage result decides which rows are the same place; this module only
describes what changed between them. Every column is compared, not just the
ones used for matching, so wheelchair access, opening hours and so on show up.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from linkage.normalise import distance_m, equivalent
from linkage.records import Dataset, Record
from linkage.result import Link, LinkResult

from .loader_check import suggested_fix_problems
from .names import friendly_label

SCHEMA_VERSION = 3

#: Coordinate changes smaller than this are float noise ("-30.3344050" vs "-30.334405").
MIN_MOVE_M = 1.0
#: Moves at least this far get a warning.
LARGE_MOVE_M = 1000.0
#: One axis agreeing within this many degrees (~50 m) while the place moved more
#: than LARGE_MOVE_M looks like a typo in the other coordinate.
SINGLE_AXIS_TOLERANCE_DEG = 0.0005


def changed_text(a: str | None, b: str | None) -> bool:
    """Check whether two text values differ beyond surrounding whitespace.

    Whether a difference matters is decided separately by
    ``linkage.normalise.equivalent``.

    Args:
        a: The value from the older file.
        b: The value from the newer file.

    Returns:
        ``True`` if the trimmed values differ.

    Example:
        ``changed_text(" Hall ", "Hall")`` returns ``False``.
    """
    return (a or "").strip() != (b or "").strip()


def header(d: Dataset) -> list[str]:
    """Get the source columns in their original order.

    Args:
        d: The dataset to inspect.

    Returns:
        The CSV header, or the first record's column names for an in-memory dataset.
    """
    return d.header if d.header is not None else (list(d.records[0].raw) if d.records else [])


def location_change(
    old: Dataset,
    new: Dataset,
    i: int,
    j: int,
    large_move_m: float = LARGE_MOVE_M,
) -> dict[str, Any] | None:
    """Describe a linked place's coordinate change.

    Args:
        old: The dataset with the earlier locations.
        new: The dataset with the later locations.
        i: The place's row index in ``old``.
        j: The place's row index in ``new``.
        large_move_m: The distance at which a one-axis change is flagged as a likely typo.

    Returns:
        A location-change record, or ``None`` when the coordinates did not meaningfully change.
    """
    a, b = old.records[i], new.records[j]
    if not (a.has_coords and b.has_coords):
        if a.has_coords == b.has_coords:
            return None
        return {
            "old": [a.lat, a.lon],
            "new": [b.lat, b.lon],
            "moved_m": None,
            "note": "coordinates added" if b.has_coords else "coordinates removed",
        }
    moved = distance_m(a.lat, a.lon, b.lat, b.lon) or 0.0
    if moved < MIN_MOVE_M:
        return None
    change: dict[str, Any] = {"old": [a.lat, a.lon], "new": [b.lat, b.lon], "moved_m": round(moved, 1)}
    if moved >= large_move_m:
        lat_same = abs(a.lat - b.lat) < SINGLE_AXIS_TOLERANCE_DEG  # type: ignore[operator]
        lon_same = abs(a.lon - b.lon) < SINGLE_AXIS_TOLERANCE_DEG  # type: ignore[operator]
        if lat_same != lon_same:
            change["likely_typo"] = "longitude" if lat_same else "latitude"
    return change


def warnings_for(location: dict[str, Any] | None, large_move_m: float = LARGE_MOVE_M) -> list[str]:
    """Turn a location change into readable warnings.

    Args:
        location: The location-change record, if coordinates changed.
        large_move_m: The distance at which a move should be called out.

    Returns:
        Human-readable warnings, or an empty list when there is nothing to flag.
    """
    if not location or location.get("moved_m") is None:
        return [location["note"]] if location and location.get("note") else []
    moved = location["moved_m"]
    if moved < large_move_m:
        return []
    km = f"{moved / 1000:.1f} km"
    if "likely_typo" in location:
        return [f"Moved {km}, {location['likely_typo']} only: likely coordinate typo"]
    return [f"Moved {km}"]


def describe_pair(
    old: Dataset,
    new: Dataset,
    link: Link,
    ignore: set[str],
    large_move_m: float = LARGE_MOVE_M,
) -> dict[str, Any]:
    """Describe the changes for one pair of linked places.

    Args:
        old: The earlier dataset.
        new: The later dataset.
        link: The matcher's link between the two row indices.
        ignore: Column names that should not contribute to the diff.
        large_move_m: The distance used when creating location warnings.

    Returns:
        A record containing changed fields, location details, warnings, and link evidence.
    """
    a, b = old.records[link.left], new.records[link.right]
    coord_columns = {c for c in (old.columns.lat, old.columns.lon, new.columns.lat, new.columns.lon) if c}
    shared = [c for c in header(old) if c in b.raw and c not in ignore and c not in coord_columns]
    changes = [
        {
            "field": c,
            "old": a.raw.get(c, ""),
            "new": b.raw.get(c, ""),
            # Cosmetic: the linkage module treats both values as the same (case, punctuation,
            # spacing, abbreviations, number formatting, how times are written).
            "cosmetic": equivalent(new.columns.kind_of(c), a.raw.get(c), b.raw.get(c)),
        }
        for c in shared
        if changed_text(a.raw.get(c), b.raw.get(c))
    ]
    location = None if coord_columns & ignore else location_change(old, new, link.left, link.right, large_move_m)
    return {
        "old_index": link.left,
        "new_index": link.right,
        "name": b.label(),
        "old_name": a.label(),
        "changes": changes,
        "location": location,
        "warnings": warnings_for(location, large_move_m),
        "link": {"band": link.band, "score": link.score, "via": link.via, "explain": link.explain},
        "old": a.raw,
        "new": b.raw,
    }


#: Field-name patterns for grouping changes in the report, checked in order.
FIELD_CATEGORIES = [
    ("accessibility", re.compile(r"wheelchair|disab|^access|_access|vi_vote|vision", re.I)),
    ("entrance", re.compile(r"entrance|within_premise|within premise|booth_location|gate", re.I)),
    ("hours", re.compile(r"hour|open", re.I)),
    ("address", re.compile(r"address|suburb|locality|postcode|city|street", re.I)),
    ("name", re.compile(r"^name$|premises|ppname|polling.?place.?name", re.I)),
    ("divisions", re.compile(r"division|district|divname|ward", re.I)),
    ("votes", re.compile(r"vote|issuing", re.I)),
]

#: Wheelchair access levels, worst to best, for "improved" / "worse".
ACCESS_RANK = {"none": 0, "no": 0, "n": 0, "assisted": 1, "partial": 1, "a": 1, "full": 2, "yes": 2, "f": 2}

#: A removed place and an added place this close together are probably one venue replacing another.
REPLACEMENT_RADIUS_M = 500.0


@dataclass(frozen=True)
class Settings:
    """Per-election options for building a diff.

    Attributes:
        ignore: Columns to leave out of comparisons.
        large_move_m: Distance at which a location change is warned about.
        replacement_radius_m: Maximum distance for pairing a removed and added place.
    """

    ignore: frozenset[str] = frozenset()
    large_move_m: float = LARGE_MOVE_M
    replacement_radius_m: float = REPLACEMENT_RADIUS_M

    def to_dict(self) -> dict[str, Any]:
        """Return the options in a JSON-friendly form.

        Returns:
            A dictionary with sorted ignored columns and both distance thresholds.
        """
        return {
            "ignore": sorted(self.ignore),
            "large_move_m": self.large_move_m,
            "replacement_radius_m": self.replacement_radius_m,
        }

#: Places listed per quality check (the count is always complete).
QUALITY_LIST_LIMIT = 50


def field_category(field: str) -> str:
    """Group a column name into a report category.

    Args:
        field: The source column name.

    Returns:
        The matching category, or ``"other"`` when no category fits.

    Example:
        ``field_category("wheelchair_access")`` returns ``"accessibility"``.
    """
    return next((name for name, pattern in FIELD_CATEGORIES if pattern.search(field)), "other")


def access_direction(field: str, old: str, new: str) -> str | None:
    """Tell whether a wheelchair-access value improved or got worse.

    Args:
        field: The changed column name.
        old: The value from the earlier file.
        new: The value from the later file.

    Returns:
        ``"improved"``, ``"worse"``, or ``None`` when the change cannot be ranked.
    """
    if not re.search(r"wheelchair|disab", field, re.I) or "desc" in field.lower():
        return None
    a, b = ACCESS_RANK.get(old.strip().lower()), ACCESS_RANK.get(new.strip().lower())
    if a is None or b is None or a == b:
        return None
    return "improved" if b > a else "worse"


def annotate_changes(changes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Add report categories and accessibility direction to changed fields.

    Args:
        changes: Field changes to annotate.

    Returns:
        The same list, with category and optional direction added to each change.
    """
    for c in changes:
        c["category"] = field_category(c["field"])
        direction = access_direction(c["field"], c["old"], c["new"])
        if direction:
            c["direction"] = direction
    return changes


def find_replacements(
    old: Dataset,
    new: Dataset,
    removed: list[int],
    added: list[int],
    radius_m: float = REPLACEMENT_RADIUS_M,
) -> list[dict[str, Any]]:
    """Pair nearby removed and added places as possible venue replacements.

    The closest pairs are chosen first, and each place can appear in at most one pair.

    Args:
        old: The earlier dataset.
        new: The later dataset.
        removed: Row indices with no link in the later dataset.
        added: Row indices with no link in the earlier dataset.
        radius_m: The greatest distance at which two places can be paired.

    Returns:
        Replacement records ordered by the new place's name.
    """
    candidates = []
    for i in removed:
        a = old.records[i]
        for j in added:
            b = new.records[j]
            dist = distance_m(a.lat, a.lon, b.lat, b.lon)
            if dist is not None and dist <= radius_m:
                candidates.append((dist, i, j))
    used_old, used_new, pairs = set(), set(), []
    for dist, i, j in sorted(candidates):
        if i in used_old or j in used_new:
            continue
        used_old.add(i)
        used_new.add(j)
        pairs.append(
            {
                "old_index": i,
                "new_index": j,
                "old_name": old.records[i].label(),
                "new_name": new.records[j].label(),
                "distance_m": round(dist, 1),
            }
        )
    return sorted(pairs, key=lambda p: p["new_name"])


def _decimals(text: str) -> int:
    """Count the decimal places in a coordinate string.

    Args:
        text: The coordinate text to inspect.

    Returns:
        The number of digits after the decimal point.
    """
    text = (text or "").strip()
    return len(text.split(".", 1)[1]) if "." in text else 0


def quality_checks(old: Dataset, new: Dataset, result: LinkResult, ignore: set[str]) -> list[dict[str, Any]]:
    """Find data-quality issues that are useful to check in the newer file.

    Args:
        old: The earlier dataset.
        new: The later dataset.
        result: The matcher's links between the two datasets.
        ignore: Source columns excluded from comparisons.

    Returns:
        Checks for duplicate coordinates, rough or missing coordinates, and newly blank fields.
    """
    checks: list[dict[str, Any]] = []

    def add(check: str, title: str, places: list[dict[str, Any]]) -> None:
        """Add a check only when there are places to show.

        Args:
            check: Stable identifier for this kind of quality check.
            title: Human-readable check name.
            places: Rows with this issue in the newer dataset.

        Returns:
            ``None``.
        """
        if places:
            checks.append({"check": check, "title": title, "count": len(places), "places": places[:QUALITY_LIST_LIMIT]})

    # Same coordinates, different place: a commission copying one venue's coordinates to another.
    groups: dict[tuple[float, float], list[Record]] = {}
    for r in new.records:
        if r.has_coords:
            groups.setdefault((round(r.lat, 5), round(r.lon, 5)), []).append(r)  # type: ignore[arg-type]
    same = []
    for recs in groups.values():
        identities = {r.n_premises or r.n_name for r in recs}
        if len(identities) > 1:
            names = ", ".join(sorted({r.label() for r in recs}))
            same.extend(
                {"new_index": r.index, "name": r.label(), "detail": f"shares coordinates with: {names}"}
                for r in recs
            )
    add("same_coordinates", "Different places at identical coordinates", same)

    lat_col, lon_col = new.columns.lat, new.columns.lon
    if lat_col and lon_col:
        coarse = [
            {"new_index": r.index, "name": r.label(), "detail": f"{r.raw.get(lat_col)}, {r.raw.get(lon_col)}"}
            for r in new.records
            if r.has_coords and min(_decimals(r.raw.get(lat_col, "")), _decimals(r.raw.get(lon_col, ""))) <= 3
        ]
        add("low_precision", "Coordinates with 3 or fewer decimal places (~100 m or worse)", coarse)
    add(
        "missing_coordinates",
        "No coordinates",
        [{"new_index": r.index, "name": r.label(), "detail": ""} for r in new.records if not r.has_coords],
    )

    # Fields that had a value and are now blank, on confidently linked places.
    blanked: dict[str, list[dict[str, Any]]] = {}
    for link in result.links:
        if link.band != "auto":
            continue
        a, b = old.records[link.left].raw, new.records[link.right].raw
        for column, value in a.items():
            if column not in ignore and column in b and (value or "").strip() and not (b[column] or "").strip():
                blanked.setdefault(column, []).append({
                    "old_index": link.left,
                    "new_index": link.right,
                    "name": new.records[link.right].label(),
                    "detail": f"was: {value}",
                    "old_value": value,
                })
    for column, places in sorted(blanked.items()):
        add(f"newly_blank:{column}", f"{column} is now blank", places)
    return checks


def _schema(column: str, rename: dict[str, str]) -> str:
    """Get a column's name after the loader applies ``rename_columns``.

    Args:
        column: The source column name.
        rename: The loader's source-to-schema name mapping.

    Returns:
        The renamed column name, or the original name if it is not renamed.
    """
    return rename.get(column, column)


def suggested_fixes(
    old: Dataset,
    new: Dataset,
    changed: list[dict[str, Any]],
    quality: list[dict[str, Any]],
    rename: dict[str, str],
    large_move_m: float = LARGE_MOVE_M,
    selector_rows: dict[int, dict[str, Any]] | None = None,
    old_loaded_rows: dict[int, dict[str, Any]] | None = None,
    loader_config: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Draft loader fixes for problems a person confirms in the report.

    Each fix selects the place by name in the new file and puts back the previous
    value. They are suggestions: only copy one in after checking the map.

    Args:
        old: The earlier dataset.
        new: The later dataset.
        changed: Linked places that changed or need review.
        quality: Data-quality checks for the newer dataset.
        rename: The loader's source-to-schema column mapping.
        large_move_m: The distance used to consider a coordinate change for a fix.
        selector_rows: New-file rows after the loader's existing fixes, keyed by source row index.
        old_loaded_rows: Old-file rows after the loader's existing fixes, keyed by source row index.
        loader_config: The configuration used to validate proposed fixes.

    Returns:
        Suggested fixes, including notes when a safe selector cannot be drafted.
    """
    name_col, lat_col, lon_col = new.columns.name, new.columns.lat, new.columns.lon
    selector_field = _schema(name_col, rename)
    rows_by_index = selector_rows if selector_rows is not None else {
        r.index: {_schema(k, rename): v for k, v in r.raw.items()} for r in new.records
    }

    def selector(new_index: int, overwrite_fields: list[str]) -> tuple[dict[str, str] | None, str | None]:
        """Build a safe loader selector for a place in the new dataset.

        Args:
            new_index: The row's index in the new dataset.
            overwrite_fields: Loader fields the proposed fix would overwrite.

        Returns:
            The selector and a duplicate-name note, or ``None`` with a reason
            when a safe selector cannot be made.
        """
        source_index = new.records[new_index].index
        row = rows_by_index.get(source_index)
        if row is None or selector_field not in row:
            return None, "No loaded row has this selector field; a safe fix cannot be drafted."
        value = str(row[selector_field])
        matching_indices = [
            index
            for index, candidate in rows_by_index.items()
            if selector_field in candidate and str(candidate[selector_field]) == value
        ]
        if source_index not in matching_indices:
            return None, "The loader selector does not match this place; a safe fix cannot be drafted."
        missing = sorted({
            field for index in matching_indices for field in overwrite_fields
            if field not in rows_by_index[index]
        })
        if missing:
            return None, f"The loader cannot overwrite missing fields: {', '.join(missing)}."
        note = None
        if len(matching_indices) > 1:
            note = f"{len(matching_indices)} places are named {value!r}: this fix would change all of them."
        return {"field": selector_field, "value": value}, note

    others = [(r.lat, r.lon) for r in new.records if r.has_coords]

    def nearest_other_m(lat: float, lon: float, exclude: tuple[float, float]) -> float | None:
        """Find the distance to the nearest other polling place.

        Args:
            lat: Latitude of the position to check.
            lon: Longitude of the position to check.
            exclude: Coordinates that should not count as another place.

        Returns:
            The nearest distance in metres, or ``None`` when no other place has coordinates.
        """
        dists = [distance_m(lat, lon, a, b) for a, b in others if (a, b) != exclude]
        dists = [d for d in dists if d is not None]
        return min(dists) if dists else None

    def checked_fix(
        sel: dict[str, str] | None, overwrite: list[dict[str, Any]], note: str | None
    ) -> tuple[dict[str, Any] | None, str | None]:
        """Validate a proposed fix against the rows its selector matches.

        Args:
            sel: The proposed loader selector, if one is safe to use.
            overwrite: Field values the fix would apply.
            note: Any existing explanation or duplicate-name warning.

        Returns:
            The copyable fix and note, or ``None`` and a validation explanation.
        """
        if sel is None:
            return None, note
        fix = {**sel, "overwrite": overwrite}
        if loader_config is not None:
            matching_rows = [
                row for row in rows_by_index.values()
                if sel["field"] in row and str(row[sel["field"]]) == sel["value"]
            ]
            problems = suggested_fix_problems(fix, matching_rows, loader_config)
            if problems:
                return None, f"The proposed fix would cause loader problems: {'; '.join(problems)}."
        return fix, note

    def loaded_coordinates(row: dict[str, Any] | None, fields: list[str]) -> tuple[float, float] | None:
        """Read a usable coordinate pair from a converted loader row.

        Args:
            row: The converted row, or ``None`` when it was unavailable.
            fields: The loader's latitude and longitude field names.

        Returns:
            A valid coordinate pair, or ``None`` if either value is unusable.
        """
        if row is None:
            return None
        try:
            lat, lon = (float(row[field]) for field in fields)
        except (KeyError, TypeError, ValueError):
            return None
        if not (math.isfinite(lat) and math.isfinite(lon) and -90 <= lat <= 90 and -180 <= lon <= 180):
            return None
        return (lat, lon) if lat and lon else None

    fixes = []
    for e in changed:
        loc = e.get("location")
        if not loc or loc.get("moved_m") is None or loc["moved_m"] < large_move_m or not (lat_col and lon_col):
            continue
        typo = loc.get("likely_typo")
        moved = f"Moved {loc['moved_m'] / 1000:.1f} km" + (f", {typo} only (likely typo)" if typo else "")
        # A wrong position usually lands far from every other polling place. Compare how
        # isolated each position is to guess which one is the mistake.
        new_pos = (loc["new"][0], loc["new"][1])
        iso_new = nearest_other_m(*new_pos, exclude=new_pos)
        iso_old = nearest_other_m(loc["old"][0], loc["old"][1], exclude=new_pos)
        if iso_new is not None and iso_old is not None and iso_old > 3 * iso_new and iso_old - iso_new > large_move_m:
            fixes.append(
                {
                    "new_index": e["new_index"],
                    "name": e["name"],
                    "kind": "coordinates",
                    "likely": False,
                    "no_fix_needed": True,
                    "reason": (
                        f"{moved}. The new position looks right: the old one was {iso_old / 1000:.1f} km from any "
                        f"other polling place, the new one {iso_new / 1000:.1f} km. No fix needed."
                    ),
                    "note": None,
                    "fix": None,
                }
            )
            continue
        new_isolated = (
            iso_new is not None
            and iso_old is not None
            and iso_new > 3 * iso_old
            and iso_new - iso_old > large_move_m
        )
        overwrite_fields = [_schema(lat_col, rename), _schema(lon_col, rename)]
        sel, note = selector(e["new_index"], overwrite_fields)
        old_fields = [
            _schema(old.columns.lat, rename) if old.columns.lat else "",
            _schema(old.columns.lon, rename) if old.columns.lon else "",
        ]
        old_row = old_loaded_rows.get(old.records[e["old_index"]].index) if old_loaded_rows is not None else None
        loaded_old = loaded_coordinates(old_row, old_fields) if old_loaded_rows is not None else tuple(loc["old"])
        loaded_new = loaded_coordinates(rows_by_index.get(new.records[e["new_index"]].index), overwrite_fields)
        if loaded_old is None and sel is not None:
            sel = None
            note = "The old loaded row has no usable coordinates; a safe fix cannot be drafted."
        loaded_distance = distance_m(*loaded_old, *loaded_new) if loaded_old is not None and loaded_new is not None else None
        already_correct = loaded_distance is not None and loaded_distance < MIN_MOVE_M
        if already_correct:
            sel = None
            note = "The existing loader fixes already give this place the previous coordinates."
        fix, note = checked_fix(
            sel,
            [{"field": field, "value": value} for field, value in zip(overwrite_fields, loaded_old or ())],
            note,
        )
        fixes.append(
            {
                "new_index": e["new_index"],
                "name": e["name"],
                "kind": "coordinates",
                "likely": not already_correct and (bool(typo) or new_isolated),
                "no_fix_needed": already_correct,
                "reason": f"{moved}. The existing loader fixes already restore the previous coordinates." if already_correct else (
                    f"{moved}."
                    + (
                        f" The new position is {iso_new / 1000:.1f} km from any other polling place, "
                        f"the old one {iso_old / 1000:.1f} km."
                        if new_isolated and iso_new is not None and iso_old is not None
                        else ""
                    )
                    + " If the new position is wrong, this keeps the previous one."
                ),
                "note": note,
                "fix": fix,
            }
        )
    for q in quality:
        if not q["check"].startswith("newly_blank:"):
            continue
        column = q["check"].split(":", 1)[1]
        for place in q["places"]:
            field = _schema(column, rename)
            sel, note = selector(place["new_index"], [field])
            old_row = old_loaded_rows.get(old.records[place["old_index"]].index) if old_loaded_rows is not None else None
            value = old_row.get(field) if old_row is not None else None
            if old_loaded_rows is None:
                value = place["old_value"]
            if sel and (value is None or not str(value).strip()):
                sel = None
                note = f"The old loaded row has no usable value for {field}; a safe fix cannot be drafted."
            fix, note = checked_fix(sel, [{"field": field, "value": value}], note)
            fixes.append(
                {
                    "new_index": place["new_index"],
                    "name": place["name"],
                    "kind": "blank",
                    "field": field,
                    "likely": False,
                    "no_fix_needed": False,
                    "reason": f"{column} is now blank. If that's a mistake, this keeps the previous value.",
                    "note": note,
                    "fix": fix,
                }
            )
    return fixes


def severity(e: dict[str, Any]) -> tuple:
    """Build a sort key that puts the most important changes first.

    Args:
        e: A changed-place record.

    Returns:
        A tuple ordered by warnings, worsening access, move distance, field count, and name.
    """
    worse = any(c.get("direction") == "worse" for c in e["changes"])
    loc = e.get("location") or {}
    moved = loc.get("moved_m") or 0
    return (not e["warnings"], not worse, -moved, -sum(not c.get("cosmetic") for c in e["changes"]), e["name"])


def context_points(new: Dataset) -> list[list[float]]:
    """Get the newer file's coordinates for the report's map background.

    Args:
        new: The later dataset.

    Returns:
        Latitude/longitude pairs rounded to roughly one metre.
    """
    return [[round(r.lat, 5), round(r.lon, 5)] for r in new.records if r.has_coords]  # type: ignore[arg-type]


def build_diff(
    old: Dataset,
    new: Dataset,
    result: LinkResult,
    link_output: dict[str, Any],
    settings: Settings | None = None,
    rename: dict[str, str] | None = None,
    selector_rows: dict[int, dict[str, Any]] | None = None,
    old_loaded_rows: dict[int, dict[str, Any]] | None = None,
    loader_config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build the report data for one matcher's results.

    Args:
        old: The earlier dataset.
        new: The later dataset.
        result: The matcher's links and unmatched rows.
        link_output: Provenance and matcher results produced by the linkage step.
        settings: Options controlling ignored columns and distance thresholds.
        rename: The loader's source-to-schema column mapping.
        selector_rows: New-file rows after loader conversion and existing fixes.
        old_loaded_rows: Old-file rows after loader conversion and existing fixes.
        loader_config: The configuration used to validate proposed fixes.

    Returns:
        A JSON-ready record with changes, summaries, quality checks, and suggested fixes.
    """
    settings = settings or Settings()
    ignore = set(settings.ignore)
    rename = rename or {}
    changed, possible, cosmetic, unchanged = [], [], [], 0
    for link in result.links:
        entry = describe_pair(old, new, link, ignore, settings.large_move_m)
        annotate_changes(entry["changes"])
        real = [c for c in entry["changes"] if not c["cosmetic"]]
        if link.band == "review":
            possible.append(entry)
        elif real or entry["location"]:
            changed.append(entry)
        elif entry["changes"]:
            cosmetic.append(entry)
        else:
            unchanged += 1
    old_cols, new_cols = header(old), header(new)
    replacements = find_replacements(
        old,
        new,
        result.unmatched_left,
        result.unmatched_right,
        settings.replacement_radius_m,
    )
    replaced_by = {p["old_index"]: p["new_index"] for p in replacements}
    replaces = {p["new_index"]: p["old_index"] for p in replacements}

    def place(d: Dataset, i: int) -> dict[str, Any]:
        """Build the report record for an added or removed place.

        Args:
            d: The dataset containing the place.
            i: The place's row index.

        Returns:
            Its name, coordinates, and original row data.
        """
        r = d.records[i]
        return {"name": r.label(), "lat": r.lat, "lon": r.lon, "record": r.raw}

    added = [{"new_index": j, **place(new, j), "replaces": replaces.get(j)} for j in result.unmatched_right]
    removed = [{"old_index": i, **place(old, i), "replaced_by": replaced_by.get(i)} for i in result.unmatched_left]
    quality = quality_checks(old, new, result, ignore)
    return {
        "schema_version": SCHEMA_VERSION,
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "matcher": result.matcher,
        "matcher_params": result.params,
        "old": {**link_output["left"], "label": friendly_label(link_output["left"]["path"])},
        "new": {**link_output["right"], "label": friendly_label(link_output["right"]["path"])},
        "columns": {
            "old": old_cols,
            "new": new_cols,
            "added": [c for c in new_cols if c not in old_cols],
            "removed": [c for c in old_cols if c not in new_cols],
            "ignored": sorted(ignore),
        },
        "summary": {
            "unchanged": unchanged,
            "changed": len(changed),
            "added": len(added),
            "removed": len(removed),
            "possible_matches": len(possible),
            "cosmetic": len(cosmetic),
            "likely_replacements": len(replacements),
            "warnings": sum(len(e["warnings"]) for e in changed + possible),
            "quality_issues": sum(q["count"] for q in quality),
        },
        # Cosmetic-only differences don't count as changes.
        "nothing_changed": not (changed or possible or added or removed or ((set(old_cols) ^ set(new_cols)) - ignore)),
        # Biggest first: warnings, accessibility getting worse, largest moves, most fields changed.
        "changed": sorted(changed, key=severity),
        # Least confident first.
        "possible_matches": sorted(possible, key=lambda e: (e["link"]["score"], e["name"])),
        # Only cosmetic differences (see linkage.normalise.equivalent).
        "cosmetic": sorted(cosmetic, key=lambda e: e["name"]),
        "added": sorted(added, key=lambda e: e["name"]),
        "removed": sorted(removed, key=lambda e: e["name"]),
        "replacements": replacements,
        "quality": quality,
        "suggested_fixes": suggested_fixes(
            old, new, changed + possible, quality, rename, settings.large_move_m,
            selector_rows, old_loaded_rows, loader_config
        ),
        "settings": settings.to_dict(),
        "context_points": context_points(new),
    }
