"""The verdict record: human judgements on where the matchers disagreed.

Each line of verdicts/verdicts.jsonl is one judgement on one disagreement: the
place in the old file, what each matcher linked it to (or nothing), which matcher
was right, and why. Over time this tallies which matcher is better at what, and
the verdicts can become training labels.

Verdicts are recorded in the diff's HTML report, downloaded as a JSON file, and
imported here with `linkage verdicts import FILE`.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from collections.abc import Iterable
from pathlib import Path
from typing import Any

#: In the source tree: linkage/verdicts/verdicts.jsonl
DEFAULT_PATH = Path(__file__).resolve().parents[2] / "verdicts" / "verdicts.jsonl"

SCHEMA_VERSION = 1

#: Allowed values for "verdict".
VERDICTS = {
    "rapidfuzz": "rapidfuzz was right",
    "splink": "Splink was right",
    "neither": "Both were wrong",
    "both": "Both are defensible",
}

#: Suggested values for "reason" (free text is allowed too).
REASONS = [
    "coordinate typo",
    "venue change",
    "rename",
    "address change",
    "same venue, different booth",
    "data error",
    "other",
]

REQUIRED = ("old_sha256", "new_sha256", "left", "decisions", "verdict")


def key(v: dict[str, Any]) -> tuple:
    """One verdict per place per pair of files; a later import replaces an earlier one."""
    return (v["old_sha256"], v["new_sha256"], v["left"]["index"])


def validate(v: dict[str, Any]) -> list[str]:
    problems = [f"missing {field!r}" for field in REQUIRED if field not in v]
    if "verdict" in v and v["verdict"] not in VERDICTS:
        problems.append(f"verdict {v['verdict']!r} is not one of {sorted(VERDICTS)}")
    if "left" in v and "index" not in v["left"]:
        problems.append("left record has no index")
    return problems


def load(path: Path | None = None) -> list[dict[str, Any]]:
    path = path or DEFAULT_PATH
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def save(verdicts: Iterable[dict[str, Any]], path: Path | None = None) -> None:
    path = path or DEFAULT_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = sorted(verdicts, key=lambda v: (v.get("recorded_at", ""), key(v)))
    path.write_text("".join(json.dumps(v, sort_keys=True) + "\n" for v in rows))


def import_file(source: Path, path: Path | None = None) -> dict[str, int]:
    """Merge a downloaded verdicts file into the record. Returns counts."""
    path = path or DEFAULT_PATH
    incoming = json.loads(source.read_text())
    if isinstance(incoming, dict):
        incoming = incoming.get("verdicts", [])
    existing = {key(v): v for v in load(path)}
    added = replaced = 0
    for v in incoming:
        problems = validate(v)
        if problems:
            raise ValueError(f"Bad verdict for {v.get('left', {}).get('name')!r}: {'; '.join(problems)}")
        v.setdefault("schema_version", SCHEMA_VERSION)
        if key(v) in existing:
            replaced += existing[key(v)] != v
        else:
            added += 1
        existing[key(v)] = v
    save(existing.values(), path)
    return {"added": added, "replaced": replaced, "total": len(existing)}


def tally(verdicts: list[dict[str, Any]]) -> dict[str, Any]:
    by_verdict = Counter(v["verdict"] for v in verdicts)
    by_reason: dict[str, Counter] = defaultdict(Counter)
    for v in verdicts:
        by_reason[v.get("reason") or "(no reason)"][v["verdict"]] += 1
    return {
        "total": len(verdicts),
        "by_verdict": dict(by_verdict),
        "by_reason": {r: dict(c) for r, c in sorted(by_reason.items())},
        "elections": sorted({v.get("election") or "?" for v in verdicts}),
    }


def format_tally(t: dict[str, Any]) -> str:
    lines = [f"{t['total']} verdicts across {', '.join(t['elections']) or 'no elections'}"]
    for verdict, label in VERDICTS.items():
        lines.append(f"  {label:22} {t['by_verdict'].get(verdict, 0)}")
    if t["by_reason"]:
        lines.append("By reason:")
        for reason, counts in t["by_reason"].items():
            parts = ", ".join(f"{k} {n}" for k, n in sorted(counts.items()))
            lines.append(f"  {reason:28} {parts}")
    return "\n".join(lines)
