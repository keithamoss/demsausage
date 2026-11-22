"""Review ticks saved in the repo: <pair folder>/reviewed.json.

A report's "Download review" button saves the browser's ticks with the two input files'
hashes; import_reviewed() finds the pair folder with those hashes and replaces its
reviewed.json with the downloaded ticks (the download already includes the saved ones,
so unticking in the browser removes a tick here too).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def find_pair_folder(diffs_dir: Path, old_sha256: str, new_sha256: str) -> Path:
    """Find the report folder for a pair of source files.

    Args:
        diffs_dir: The election's folder of pair reports.
        old_sha256: The earlier file's SHA-256 hash.
        new_sha256: The later file's SHA-256 hash.

    Returns:
        The pair folder whose inputs have both matching hashes.

    Raises:
        FileNotFoundError: If no pair uses those two input files.
    """
    for link in diffs_dir.glob("*/link.json"):
        data = json.loads(link.read_text())
        if (data["left"]["sha256"], data["right"]["sha256"]) == (old_sha256, new_sha256):
            return link.parent
    raise FileNotFoundError(f"No report in {diffs_dir} for those two files (check --diffs-dir)")


def import_reviewed(source: Path, diffs_dir: Path) -> tuple[Path, dict[str, int]]:
    """Save downloaded review ticks in the matching pair folder.

    Args:
        source: The JSON file downloaded from a report.
        diffs_dir: The election's folder of pair reports.

    Returns:
        The pair folder and counts of saved, newly added, and removed ticks.
    """
    download: dict[str, Any] = json.loads(source.read_text())
    folder = find_pair_folder(diffs_dir, download["old_sha256"], download["new_sha256"])
    path = folder / "reviewed.json"
    before = json.loads(path.read_text()).get("reviewed", {}) if path.exists() else {}
    after = dict(sorted(download.get("reviewed", {}).items()))
    path.write_text(
        json.dumps(
            {"old_sha256": download["old_sha256"], "new_sha256": download["new_sha256"], "reviewed": after},
            indent=2,
        )
        + "\n"
    )
    return folder, {
        "ticked": len(after),
        "added": len(set(after) - set(before)),
        "removed": len(set(before) - set(after)),
    }
