"""The static HTML report for one pair folder.

Report data and interface code are embedded in one file. Maps load their libraries
and basemap from external services, so they need an internet connection. Verdicts
are kept in the browser's localStorage, and "Download verdicts" saves a JSON file
for `linkage verdicts import`.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from linkage.verdicts import REASONS, SCHEMA_VERSION, VERDICTS

from .html_utils import embed_json, escape_html
from .names import friendly_label

TEMPLATE = Path(__file__).with_name("report_template.html")


def write_report(folder: Path) -> Path:
    """Rebuild the HTML report from a pair folder's JSON files.

    Args:
        folder: The folder containing the pair's diff and linkage results.

    Returns:
        The path to the written ``report.html`` file.
    """
    diffs = [json.loads(p.read_text()) for p in sorted(folder.glob("diff-*.json"))]
    # rapidfuzz first, then Splink, then anything else, for a stable tab order.
    order = {"rapidfuzz": 0, "splink": 1}
    diffs.sort(key=lambda d: (order.get(d["matcher"], 9), d["matcher"]))
    for diff in diffs:
        loader = diff.get("loader") or {}
        counts: dict[str, int] = {}
        for fix in loader.get("fix_audit", []):
            content = json.dumps(fix["fix"], sort_keys=True, separators=(",", ":"))
            digest = hashlib.sha256(content.encode()).hexdigest()
            counts[digest] = counts.get(digest, 0) + 1
            fix["review_key"] = f"cfgfix-v2-{loader.get('config_hash', 'legacy')}-{digest}-{counts[digest]}"
    disagreements_path = folder / "disagreements.json"
    reviewed_path = folder / "reviewed.json"
    reviewed = json.loads(reviewed_path.read_text()) if reviewed_path.exists() else {}
    saved_hashes = (reviewed.get("old_sha256"), reviewed.get("new_sha256"))
    if not diffs or saved_hashes != (diffs[0]["old"]["sha256"], diffs[0]["new"]["sha256"]) or (
        reviewed.get("pair_folder") is not None and reviewed["pair_folder"] != folder.name
    ):
        reviewed = {}
    data = {
        "pair": {"election": folder.parent.parent.name, "collection": folder.parent.name, "folder": folder.name},
        # Ticks saved to the repo with `ppdiff reviewed import`; the browser adds its own on top.
        "reviewed": reviewed.get("reviewed", {}),
        "diffs": diffs,
        "disagreements": json.loads(disagreements_path.read_text()) if disagreements_path.exists() else None,
        "verdicts": VERDICTS,
        "reasons": REASONS,
        "verdict_schema_version": SCHEMA_VERSION,
    }
    title = "Polling place diff"
    if diffs:
        title = f"{friendly_label(diffs[0]['old']['path'])} → {friendly_label(diffs[0]['new']['path'])}"
    html = TEMPLATE.read_text().replace("{{TITLE}}", escape_html(title)).replace("{{DATA}}", embed_json(data))
    out = folder / "report.html"
    out.write_text(html)
    return out
