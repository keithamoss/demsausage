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
from .loader_check import election_config, loader_checks, pre_fix_rows_by_index
from .names import friendly_label, sort_scrapes
from .report import write_report


def slug(text: str) -> str:
    """Make a lowercase, filesystem-friendly name from text.

    Args:
        text: The text to turn into a folder-name part.

    Returns:
        Lowercase words separated by hyphens.
    """
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def pair_dir(out_dir: Path, old: Path, new: Path) -> Path:
    """Build the output folder path for a pair of source files.

    Args:
        out_dir: The folder that holds all pair reports.
        old: The earlier input file.
        new: The later input file.

    Returns:
        A folder path named after both input files.
    """
    return out_dir / f"{slug(old.stem)}__{slug(new.stem)}"


def snapshot(record: Record) -> dict[str, Any]:
    """Copy the place details needed to review a matcher disagreement.

    Args:
        record: The linked place to include.

    Returns:
        A JSON-ready snapshot with its source row index and key details.
    """
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
    """Build the disagreement records a person reviews in the report.

    Args:
        old: The earlier dataset.
        new: The later dataset.
        link_output: The matchers' links and comparison results.
        election: The election label to store with review verdicts.

    Returns:
        A JSON-ready record with each differing decision and its evidence.
    """
    results = {r["matcher"]: LinkResult.from_dict(r).by_left() for r in link_output["results"]}
    comparison = link_output.get("comparison") or {"disagreements": [], "matchers": list(results)}
    items = []
    for d in comparison["disagreements"]:
        decisions = {}
        for matcher, links in results.items():
            chosen = links.get(d["left"])
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


DIFF_SETTINGS_FILE = "diff.json"


def election_settings(out_dir: Path) -> dict[str, Any]:
    """Read the optional ``diff.json`` beside the election's loader config.

    Example settings::

        {"ignore": ["est_ordinary_votes"], "large_move_m": 1000, "replacement_radius_m": 500, "matcher": "both"}

    Args:
        out_dir: The folder holding the election's pair reports.

    Returns:
        The parsed settings, or an empty dictionary when no settings file exists.

    Raises:
        ValueError: If the settings file contains an unknown option.
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
    """Combine the election's saved settings with command-line overrides.

    The command line can add ignored columns and override the distance and matcher
    settings in ``diff.json``.

    Args:
        out_dir: The folder holding the election's pair reports.
        ignore: Extra column names to ignore.
        large_move_m: Replacement value for the move-warning threshold.
        replacement_radius_m: Replacement value for the possible-replacement radius.
        matcher: Replacement matcher choice.

    Returns:
        The resolved diff settings and matcher name.
    """
    file = election_settings(out_dir)
    defaults = Settings()
    settings = Settings(
        ignore=frozenset(file.get("ignore", [])) | frozenset(ignore or ()),
        large_move_m=large_move_m if large_move_m is not None else file.get("large_move_m", defaults.large_move_m),
        replacement_radius_m=(
            replacement_radius_m
            if replacement_radius_m is not None
            else file.get("replacement_radius_m", defaults.replacement_radius_m)
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
    """Link and compare two source files, then write their report.

    Args:
        old: The earlier input file.
        new: The later input file.
        out_dir: The folder where pair reports are stored.
        matcher: The matcher to run, or the election's configured default.
        ignore: Column names to leave out of comparisons.
        election: Label to store with disagreement verdicts.
        splink_model: Optional path to a Splink model file.
        large_move_m: Distance at which a location change is warned about.
        replacement_radius_m: Maximum distance for pairing a removed and added place.

    Returns:
        The folder containing this pair's linkage, diff, and HTML reports.
    """
    election = election or out_dir.resolve().parent.name
    settings, matcher = resolve_settings(out_dir, ignore, large_move_m, replacement_radius_m, matcher)
    left, right, link_output = link_files(old, new, matcher=matcher, splink_model=splink_model)
    target = pair_dir(out_dir, old, new)
    target.mkdir(parents=True, exist_ok=True)
    (target / "link.json").write_text(json.dumps(link_output, separators=(",", ":")))
    # Checks against the loader (its own rules via loader_rules); the same for every matcher.
    config = election_config(out_dir)
    checks = loader_checks(left, right, config)
    selector_rows = pre_fix_rows_by_index(right, config or {})
    rename = (config or {}).get("rename_columns") or {}
    for r in link_output["results"]:
        diff = build_diff(
            left, right, LinkResult.from_dict(r), link_output, settings, rename, selector_rows
        )
        diff["loader"] = checks
        (target / f"diff-{r['matcher']}.json").write_text(json.dumps(diff, indent=2))
    active_diffs = {f"diff-{r['matcher']}.json" for r in link_output["results"]}
    for path in target.glob("diff-*.json"):
        if path.name not in active_diffs:
            path.unlink()
    (target / "disagreements.json").write_text(json.dumps(disagreements(left, right, link_output, election), indent=2))
    write_report(target)
    write_index(out_dir)
    return target


def series(pattern: str) -> list[tuple[Path, Path]]:
    """Pair consecutive files matching a glob in scrape-date order.

    Args:
        pattern: A glob that matches the source files.

    Returns:
        Each adjacent pair as ``(older_file, newer_file)``.

    Raises:
        ValueError: If dated and undated filenames are mixed.

    Example:
        ``series("data/*.csv")`` returns every consecutive pair in ``data``.
    """
    files = sort_scrapes([Path(p) for p in globlib.glob(pattern)])
    return list(zip(files, files[1:]))


def check_inputs_unchanged(target: Path) -> None:
    """Ensure the source files still match the hashes used to build a report.

    Args:
        target: The pair folder containing ``link.json``.

    Returns:
        ``None`` when the inputs are unchanged or no longer present.

    Raises:
        RuntimeError: If a present source file has changed since linking.
    """
    link_output = json.loads((target / "link.json").read_text())
    for side in ("left", "right"):
        info = link_output[side]
        path = Path(info["path"])
        if path.exists() and file_sha256(path) != info["sha256"]:
            raise RuntimeError(f"{path} has changed since {target / 'link.json'} was written; re-run the diff")
