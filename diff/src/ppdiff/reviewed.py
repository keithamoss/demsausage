"""Review ticks saved in the repo: <pair folder>/reviewed.json.

A report's "Download review" button saves the browser's ticks with the pair identity
and input file hashes. import_reviewed() verifies these before replacing reviewed.json.
Older downloads without a pair identity are accepted only if their hashes identify
one report. A download includes saved ticks, so unticking removes a tick from the repo.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def find_pair_folder(
    diffs_dir: Path, old_sha256: str, new_sha256: str, pair_folder: str | None = None
) -> Path:
    """Find the report folder for a pair of source files.

    Args:
        diffs_dir: The election's folder of pair reports.
        old_sha256: The earlier file's SHA-256 hash.
        new_sha256: The later file's SHA-256 hash.
        pair_folder: The report folder name, when supplied by a newer download.

    Returns:
        The pair folder whose inputs have both matching hashes.

    Raises:
        FileNotFoundError: If no pair uses those two input files.
        ValueError: If an older download matches more than one pair.
    """
    matches = []
    for link in diffs_dir.glob("*/link.json"):
        data = json.loads(link.read_text())
        if (pair_folder is None or link.parent.name == pair_folder) and (
            data["left"]["sha256"], data["right"]["sha256"]
        ) == (old_sha256, new_sha256):
            matches.append(link.parent)
    if not matches:
        raise FileNotFoundError(f"No report in {diffs_dir} for that pair and those two files (check --diffs-dir)")
    if len(matches) > 1:
        raise ValueError(f"Review matches multiple reports in {diffs_dir}; download it again from the intended report")
    return matches[0]


def import_reviewed(source: Path, diffs_dir: Path) -> tuple[Path, dict[str, int]]:
    """Save downloaded review ticks in the matching pair folder.

    Args:
        source: The JSON file downloaded from a report.
        diffs_dir: The election's folder of pair reports.

    Returns:
        The pair folder and counts of saved, newly added, and removed ticks.

    Raises:
        FileNotFoundError: If no pair matches the downloaded review.
        ValueError: If the pair identity does not match, or the hashes are ambiguous.
    """
    download: dict[str, Any] = json.loads(source.read_text())
    pair = download.get("pair")
    if pair is not None and (pair["election"], pair["collection"]) != (diffs_dir.resolve().parent.name, diffs_dir.name):
        raise ValueError(f"Review belongs to a different election or diffs folder, not {diffs_dir}")
    folder = find_pair_folder(diffs_dir, download["old_sha256"], download["new_sha256"], pair["folder"] if pair else None)
    path = folder / "reviewed.json"
    before = json.loads(path.read_text()).get("reviewed", {}) if path.exists() else {}
    after = dict(sorted(download.get("reviewed", {}).items()))
    path.write_text(
        json.dumps(
            {"pair_folder": folder.name, "old_sha256": download["old_sha256"], "new_sha256": download["new_sha256"], "reviewed": after},
            indent=2,
        )
        + "\n"
    )
    return folder, {
        "ticked": len(after),
        "added": len(set(after) - set(before)),
        "removed": len(set(before) - set(after)),
    }
