"""The static HTML report for one pair folder.

Everything is embedded in a single file (no external scripts, fonts or styles) so
it opens offline and anywhere. Verdicts are kept in the browser's localStorage as
you go, and "Download verdicts" saves a JSON file for `linkage verdicts import`.
"""

from __future__ import annotations

import json
from pathlib import Path

from linkage.verdicts import REASONS, SCHEMA_VERSION, VERDICTS

from .names import friendly_label

TEMPLATE = Path(__file__).with_name("report_template.html")


def _embed(data: object) -> str:
    # Safe inside <script type="application/json">: no "</script>" can appear.
    return json.dumps(data).replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")


def write_report(folder: Path) -> Path:
    diffs = [json.loads(p.read_text()) for p in sorted(folder.glob("diff-*.json"))]
    # rapidfuzz first, then Splink, then anything else, for a stable tab order.
    order = {"rapidfuzz": 0, "splink": 1}
    diffs.sort(key=lambda d: (order.get(d["matcher"], 9), d["matcher"]))
    disagreements_path = folder / "disagreements.json"
    reviewed_path = folder / "reviewed.json"
    data = {
        # Ticks saved to the repo with `ppdiff reviewed import`; the browser adds its own on top.
        "reviewed": json.loads(reviewed_path.read_text()).get("reviewed", {}) if reviewed_path.exists() else {},
        "diffs": diffs,
        "disagreements": json.loads(disagreements_path.read_text()) if disagreements_path.exists() else None,
        "verdicts": VERDICTS,
        "reasons": REASONS,
        "verdict_schema_version": SCHEMA_VERSION,
    }
    title = "Polling place diff"
    if diffs:
        title = f"{friendly_label(diffs[0]['old']['path'])} → {friendly_label(diffs[0]['new']['path'])}"
    html = TEMPLATE.read_text().replace("{{TITLE}}", _html_escape(title)).replace("{{DATA}}", _embed(data))
    out = folder / "report.html"
    out.write_text(html)
    return out


def _html_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
