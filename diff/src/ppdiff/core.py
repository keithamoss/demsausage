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
from linkage.records import Dataset
from linkage.result import Link, LinkResult

from .names import friendly_label

SCHEMA_VERSION = 3

#: Coordinate changes smaller than this are float noise ("-30.3344050" vs "-30.334405").
MIN_MOVE_M = 1.0
#: Moves at least this far get a warning.
LARGE_MOVE_M = 1000.0
#: One axis agreeing within this many degrees (~50 m) while the place moved more
#: than LARGE_MOVE_M looks like a typo in the other coordinate.
SINGLE_AXIS_TOLERANCE_DEG = 0.0005


def _to_float(value: str | None) -> float | None:
    try:
        number = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def changed_text(a: str | None, b: str | None) -> bool:
    """Whether the text differs at all (ignoring surrounding whitespace). Whether a
    difference matters is linkage's call: see linkage.normalise.equivalent."""
    return (a or "").strip() != (b or "").strip()


def header(d: Dataset) -> list[str]:
    return list(d.records[0].raw) if d.records else []


def location_change(old: Dataset, new: Dataset, i: int, j: int, large_move_m: float = LARGE_MOVE_M) -> dict[str, Any] | None:
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
    if not location or location.get("moved_m") is None:
        return [location["note"]] if location and location.get("note") else []
    moved = location["moved_m"]
    if moved < large_move_m:
        return []
    km = f"{moved / 1000:.1f} km"
    if "likely_typo" in location:
        return [f"Moved {km}, {location['likely_typo']} only: likely coordinate typo"]
    return [f"Moved {km}"]


def describe_pair(old: Dataset, new: Dataset, link: Link, ignore: set[str], large_move_m: float = LARGE_MOVE_M) -> dict[str, Any]:
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
    location = location_change(old, new, link.left, link.right, large_move_m)
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
    """Per-election diff settings, usually from diff.json beside the election's config.json."""

    ignore: frozenset[str] = frozenset()
    large_move_m: float = LARGE_MOVE_M
    replacement_radius_m: float = REPLACEMENT_RADIUS_M

    def to_dict(self) -> dict[str, Any]:
        return {"ignore": sorted(self.ignore), "large_move_m": self.large_move_m, "replacement_radius_m": self.replacement_radius_m}

#: Places listed per quality check (the count is always complete).
QUALITY_LIST_LIMIT = 50


def field_category(field: str) -> str:
    return next((name for name, pattern in FIELD_CATEGORIES if pattern.search(field)), "other")


def access_direction(field: str, old: str, new: str) -> str | None:
    if not re.search(r"wheelchair|disab", field, re.I) or "desc" in field.lower():
        return None
    a, b = ACCESS_RANK.get(old.strip().lower()), ACCESS_RANK.get(new.strip().lower())
    if a is None or b is None or a == b:
        return None
    return "improved" if b > a else "worse"


def annotate_changes(changes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    for c in changes:
        c["category"] = field_category(c["field"])
        direction = access_direction(c["field"], c["old"], c["new"])
        if direction:
            c["direction"] = direction
    return changes


def find_replacements(old: Dataset, new: Dataset, removed: list[int], added: list[int], radius_m: float = REPLACEMENT_RADIUS_M) -> list[dict[str, Any]]:
    """Pair removed and added places that sit close together, nearest first, each used once."""
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
    text = (text or "").strip()
    return len(text.split(".", 1)[1]) if "." in text else 0


def quality_checks(old: Dataset, new: Dataset, result: LinkResult) -> list[dict[str, Any]]:
    """Problems worth a look in the new file, whichever matcher you trust."""
    checks: list[dict[str, Any]] = []

    def add(check: str, title: str, places: list[dict[str, Any]]) -> None:
        if places:
            checks.append({"check": check, "title": title, "count": len(places), "places": places[:QUALITY_LIST_LIMIT]})

    # Same coordinates, different place: a commission copying one venue's coordinates to another.
    groups: dict[tuple[float, float], list] = {}
    for r in new.records:
        if r.has_coords:
            groups.setdefault((round(r.lat, 5), round(r.lon, 5)), []).append(r)  # type: ignore[arg-type]
    same = []
    for recs in groups.values():
        identities = {r.n_premises or r.n_name for r in recs}
        if len(identities) > 1:
            names = ", ".join(sorted({r.label() for r in recs}))
            same += [{"new_index": r.index, "name": r.label(), "detail": f"shares coordinates with: {names}"} for r in recs]
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
            if column in b and (value or "").strip() and not (b[column] or "").strip():
                blanked.setdefault(column, []).append(
                    {"new_index": link.right, "name": new.records[link.right].label(), "detail": f"was: {value}", "old_value": value}
                )
    for column, places in sorted(blanked.items()):
        add(f"newly_blank:{column}", f"{column} is now blank", places)
    return checks


def _schema(column: str | None, rename: dict[str, str]) -> str | None:
    """The column's name after the loader's rename_columns (fix_data_issues runs after renaming)."""
    return None if column is None else rename.get(column, column)


def suggested_fixes(
    old: Dataset,
    new: Dataset,
    changed: list[dict[str, Any]],
    quality: list[dict[str, Any]],
    rename: dict[str, str],
    large_move_m: float = LARGE_MOVE_M,
    selector_rows: dict[int, dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """Draft fix_data_issues entries for the loader's config.json, for problems a human confirms.

    Each fix selects the place by name in the new file and puts back the previous
    value. They are suggestions: only copy one in after checking the map.
    """
    name_col, lat_col, lon_col = new.columns.name, new.columns.lat, new.columns.lon
    selector_field = _schema(name_col, rename)
    rows_by_index = selector_rows if selector_rows is not None else {
        r.index: {selector_field: r.raw.get(name_col, "")} for r in new.records
    }

    def selector(new_index: int) -> tuple[dict[str, str] | None, str | None]:
        source_index = new.records[new_index].index
        row = rows_by_index.get(source_index)
        if selector_field is None or row is None or selector_field not in row:
            return None, "No pre-fix loader row has this selector field; a safe fix cannot be drafted."
        value = str(row[selector_field])
        matching_indices = [
            index
            for index, candidate in rows_by_index.items()
            if selector_field in candidate and str(candidate[selector_field]) == value
        ]
        if source_index not in matching_indices:
            return None, "The loader selector does not match this place; a safe fix cannot be drafted."
        note = None
        if len(matching_indices) > 1:
            note = f"{len(matching_indices)} places are named {value!r}: this fix would change all of them."
        return {"field": selector_field, "value": value}, note

    others = [(r.lat, r.lon) for r in new.records if r.has_coords]

    def nearest_other_m(lat: float, lon: float, exclude: tuple[float, float]) -> float | None:
        dists = [distance_m(lat, lon, a, b) for a, b in others if (a, b) != exclude]
        dists = [d for d in dists if d is not None]
        return min(dists) if dists else None

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
        new_isolated = iso_new is not None and iso_old is not None and iso_new > 3 * iso_old and iso_new - iso_old > large_move_m
        sel, note = selector(e["new_index"])
        fixes.append(
            {
                "new_index": e["new_index"],
                "name": e["name"],
                "kind": "coordinates",
                "likely": bool(typo) or new_isolated,
                "no_fix_needed": False,
                "reason": (
                    f"{moved}."
                    + (f" The new position is {iso_new / 1000:.1f} km from any other polling place, the old one {iso_old / 1000:.1f} km." if new_isolated else "")
                    + " If the new position is wrong, this keeps the previous one."
                ),
                "note": note,
                "fix": {
                    **sel,
                    "overwrite": [
                        {"field": _schema(lat_col, rename), "value": loc["old"][0]},
                        {"field": _schema(lon_col, rename), "value": loc["old"][1]},
                    ],
                } if sel else None,
            }
        )
    for q in quality:
        if not q["check"].startswith("newly_blank:"):
            continue
        column = q["check"].split(":", 1)[1]
        for place in q["places"]:
            sel, note = selector(place["new_index"])
            fixes.append(
                {
                    "new_index": place["new_index"],
                    "name": place["name"],
                    "kind": "blank",
                    "likely": False,
                    "no_fix_needed": False,
                    "reason": f"{column} is now blank. If that's a mistake, this keeps the previous value.",
                    "note": note,
                    "fix": {**sel, "overwrite": [{"field": _schema(column, rename), "value": place["old_value"]}]} if sel else None,
                }
            )
    return fixes


def severity(e: dict[str, Any]) -> tuple:
    """Sort key putting the changes most worth a look first."""
    worse = any(c.get("direction") == "worse" for c in e["changes"])
    loc = e.get("location") or {}
    moved = loc.get("moved_m") or 0
    return (not e["warnings"], not worse, -moved, -sum(not c.get("cosmetic") for c in e["changes"]), e["name"])


def context_points(new: Dataset) -> list[list[float]]:
    """Every place's coordinates in the new file, rounded (~1 m), as map background."""
    return [[round(r.lat, 5), round(r.lon, 5)] for r in new.records if r.has_coords]  # type: ignore[arg-type]


def build_diff(
    old: Dataset,
    new: Dataset,
    result: LinkResult,
    link_output: dict[str, Any],
    settings: Settings | None = None,
    rename: dict[str, str] | None = None,
    selector_rows: dict[int, dict[str, Any]] | None = None,
) -> dict[str, Any]:
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
    replacements = find_replacements(old, new, result.unmatched_left, result.unmatched_right, settings.replacement_radius_m)
    replaced_by = {p["old_index"]: p["new_index"] for p in replacements}
    replaces = {p["new_index"]: p["old_index"] for p in replacements}

    def place(d: Dataset, i: int) -> dict[str, Any]:
        r = d.records[i]
        return {"name": r.label(), "lat": r.lat, "lon": r.lon, "record": r.raw}

    added = [{"new_index": j, **place(new, j), "replaces": replaces.get(j)} for j in result.unmatched_right]
    removed = [{"old_index": i, **place(old, i), "replaced_by": replaced_by.get(i)} for i in result.unmatched_left]
    quality = quality_checks(old, new, result)
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
            old, new, changed + possible, quality, rename, settings.large_move_m, selector_rows
        ),
        "settings": settings.to_dict(),
        "context_points": context_points(new),
    }
