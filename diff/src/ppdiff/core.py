"""Building a diff from two files and one matcher's linkage result.

The linkage result decides which rows are the same place; this module only
describes what changed between them. Every column is compared, not just the
ones used for matching, so wheelchair access, opening hours and so on show up.
"""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from linkage.normalise import distance_m
from linkage.records import Dataset
from linkage.result import Link, LinkResult

SCHEMA_VERSION = 1

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


def values_equal(a: str | None, b: str | None) -> bool:
    """Equal after trimming whitespace, or numerically equal ("1.50" == "1.5")."""
    a, b = (a or "").strip(), (b or "").strip()
    if a == b:
        return True
    fa, fb = _to_float(a), _to_float(b)
    return fa is not None and fb is not None and fa == fb


def header(d: Dataset) -> list[str]:
    return list(d.records[0].raw) if d.records else []


def location_change(old: Dataset, new: Dataset, i: int, j: int) -> dict[str, Any] | None:
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
    if moved >= LARGE_MOVE_M:
        lat_same = abs(a.lat - b.lat) < SINGLE_AXIS_TOLERANCE_DEG  # type: ignore[operator]
        lon_same = abs(a.lon - b.lon) < SINGLE_AXIS_TOLERANCE_DEG  # type: ignore[operator]
        if lat_same != lon_same:
            change["likely_typo"] = "longitude" if lat_same else "latitude"
    return change


def warnings_for(location: dict[str, Any] | None) -> list[str]:
    if not location or location.get("moved_m") is None:
        return [location["note"]] if location and location.get("note") else []
    moved = location["moved_m"]
    if moved < LARGE_MOVE_M:
        return []
    km = f"{moved / 1000:.1f} km"
    if "likely_typo" in location:
        return [f"Moved {km}, {location['likely_typo']} only: likely coordinate typo"]
    return [f"Moved {km}"]


def describe_pair(old: Dataset, new: Dataset, link: Link, ignore: set[str]) -> dict[str, Any]:
    a, b = old.records[link.left], new.records[link.right]
    coord_columns = {c for c in (old.columns.lat, old.columns.lon, new.columns.lat, new.columns.lon) if c}
    shared = [c for c in header(old) if c in b.raw and c not in ignore and c not in coord_columns]
    changes = [
        {"field": c, "old": a.raw.get(c, ""), "new": b.raw.get(c, "")}
        for c in shared
        if not values_equal(a.raw.get(c), b.raw.get(c))
    ]
    location = location_change(old, new, link.left, link.right)
    return {
        "old_index": link.left,
        "new_index": link.right,
        "name": b.label(),
        "old_name": a.label(),
        "changes": changes,
        "location": location,
        "warnings": warnings_for(location),
        "link": {"band": link.band, "score": link.score, "via": link.via, "explain": link.explain},
        "old": a.raw,
        "new": b.raw,
    }


def build_diff(
    old: Dataset,
    new: Dataset,
    result: LinkResult,
    link_output: dict[str, Any],
    ignore: set[str] | None = None,
) -> dict[str, Any]:
    ignore = ignore or set()
    changed, possible, unchanged = [], [], 0
    for link in result.links:
        entry = describe_pair(old, new, link, ignore)
        if link.band == "review":
            possible.append(entry)
        elif entry["changes"] or entry["location"]:
            changed.append(entry)
        else:
            unchanged += 1
    old_cols, new_cols = header(old), header(new)
    added = [{"new_index": j, "name": new.records[j].label(), "record": new.records[j].raw} for j in result.unmatched_right]
    removed = [{"old_index": i, "name": old.records[i].label(), "record": old.records[i].raw} for i in result.unmatched_left]
    return {
        "schema_version": SCHEMA_VERSION,
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "matcher": result.matcher,
        "matcher_params": result.params,
        "old": link_output["left"],
        "new": link_output["right"],
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
            "warnings": sum(len(e["warnings"]) for e in changed + possible),
        },
        "changed": sorted(changed, key=lambda e: e["name"]),
        "possible_matches": sorted(possible, key=lambda e: e["name"]),
        "added": sorted(added, key=lambda e: e["name"]),
        "removed": sorted(removed, key=lambda e: e["name"]),
    }
