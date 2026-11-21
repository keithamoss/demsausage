"""Running a diff end to end: link the files, diff per matcher, write the report."""

from __future__ import annotations

import glob as globlib
import json
import re
from pathlib import Path
from typing import Any

from linkage.records import Dataset, Record
from linkage.result import LinkResult
from linkage.run import file_sha256, link_files

from .core import Settings, build_diff
from .index import write_index
from .names import friendly_label
from .report import write_report


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def pair_dir(out_dir: Path, old: Path, new: Path) -> Path:
    return out_dir / f"{slug(old.stem)}__{slug(new.stem)}"


def snapshot(record: Record) -> dict[str, Any]:
    return {
        "index": record.index,
        "name": record.name,
        "premises": record.premises,
        "address": record.address,
        "lat": record.lat,
        "lon": record.lon,
        "divisions": sorted(record.divisions),
    }


def disagreements(old: Dataset, new: Dataset, link_output: dict[str, Any], election: str) -> dict[str, Any]:
    """Each place the matchers handled differently, with everything a reviewer needs."""
    results = {r["matcher"]: LinkResult.from_dict(r) for r in link_output["results"]}
    comparison = link_output.get("comparison") or {"disagreements": [], "matchers": list(results)}
    items = []
    for d in comparison["disagreements"]:
        decisions = {}
        for matcher, result in results.items():
            chosen = result.by_left().get(d["left"])
            decisions[matcher] = (
                None
                if chosen is None
                else {
                    "right": snapshot(new.records[chosen.right]),
                    "score": chosen.score,
                    "band": chosen.band,
                    "via": chosen.via,
                    "explain": chosen.explain,
                }
            )
        items.append({"left": snapshot(old.records[d["left"]]), "decisions": decisions})
    return {
        "election": election,
        "old_file": Path(link_output["left"]["path"]).name,
        "new_file": Path(link_output["right"]["path"]).name,
        "old_label": friendly_label(link_output["left"]["path"]),
        "new_label": friendly_label(link_output["right"]["path"]),
        "old_sha256": link_output["left"]["sha256"],
        "new_sha256": link_output["right"]["sha256"],
        "matchers": list(results),
        "agree": comparison.get("agree"),
        "left_records": comparison.get("left_records"),
        "items": items,
    }


def loader_renames(out_dir: Path) -> dict[str, str]:
    """rename_columns from the election's config.json (beside the diffs folder), if any."""
    config = out_dir.resolve().parent / "config.json"
    if not config.exists():
        return {}
    try:
        return json.loads(config.read_text()).get("rename_columns") or {}
    except json.JSONDecodeError:
        return {}


DIFF_SETTINGS_FILE = "diff.json"


def election_settings(out_dir: Path) -> dict[str, Any]:
    """diff.json beside the election's config.json (the diffs folder's parent), if any.

        {"ignore": ["est_ordinary_votes"], "large_move_m": 1000, "replacement_radius_m": 500, "matcher": "both"}
    """
    path = out_dir.resolve().parent / DIFF_SETTINGS_FILE
    if not path.exists():
        return {}
    data = json.loads(path.read_text())
    unknown = set(data) - {"ignore", "large_move_m", "replacement_radius_m", "matcher"}
    if unknown:
        raise ValueError(f"{path}: unknown settings {sorted(unknown)}")
    return data


def resolve_settings(
    out_dir: Path,
    ignore: set[str] | None = None,
    large_move_m: float | None = None,
    replacement_radius_m: float | None = None,
    matcher: str | None = None,
) -> tuple[Settings, str]:
    """diff.json, then command-line options on top (extra ignores add to the file's)."""
    file = election_settings(out_dir)
    defaults = Settings()
    settings = Settings(
        ignore=frozenset(file.get("ignore", [])) | frozenset(ignore or ()),
        large_move_m=large_move_m if large_move_m is not None else file.get("large_move_m", defaults.large_move_m),
        replacement_radius_m=(
            replacement_radius_m if replacement_radius_m is not None else file.get("replacement_radius_m", defaults.replacement_radius_m)
        ),
    )
    return settings, matcher or file.get("matcher", "both")


def run_pair(
    old: Path,
    new: Path,
    out_dir: Path,
    matcher: str | None = None,
    ignore: set[str] | None = None,
    election: str | None = None,
    splink_model: str | None = None,
    large_move_m: float | None = None,
    replacement_radius_m: float | None = None,
) -> Path:
    election = election or out_dir.resolve().parent.name
    settings, matcher = resolve_settings(out_dir, ignore, large_move_m, replacement_radius_m, matcher)
    left, right, link_output = link_files(old, new, matcher=matcher, splink_model=splink_model)
    target = pair_dir(out_dir, old, new)
    target.mkdir(parents=True, exist_ok=True)
    (target / "link.json").write_text(json.dumps(link_output, separators=(",", ":")))
    for r in link_output["results"]:
        diff = build_diff(left, right, LinkResult.from_dict(r), link_output, settings, loader_renames(out_dir))
        (target / f"diff-{r['matcher']}.json").write_text(json.dumps(diff, indent=2))
    (target / "disagreements.json").write_text(json.dumps(disagreements(left, right, link_output, election), indent=2))
    write_report(target)
    write_index(out_dir)
    return target


def series(pattern: str) -> list[tuple[Path, Path]]:
    """Consecutive pairs of the files matching a glob, in name order (our files are timestamped)."""
    files = sorted(Path(p) for p in globlib.glob(pattern))
    return list(zip(files, files[1:]))


def check_inputs_unchanged(target: Path) -> None:
    """Refuse to report on a folder whose source files have changed since linking."""
    link_output = json.loads((target / "link.json").read_text())
    for side in ("left", "right"):
        info = link_output[side]
        path = Path(info["path"])
        if path.exists() and file_sha256(path) != info["sha256"]:
            raise RuntimeError(f"{path} has changed since {target / 'link.json'} was written; re-run the diff")
