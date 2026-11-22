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
from typing import Any, TypedDict, TypeGuard

#: In the source tree: linkage/verdicts/verdicts.jsonl
DEFAULT_PATH = Path(__file__).resolve().parents[2] / "verdicts" / "verdicts.jsonl"

SCHEMA_VERSION = 2

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


class VerdictIdentity(TypedDict):
    """Required fields identifying a human judgement.

    Attributes:
        old_sha256: Fingerprint of the first CSV.
        new_sha256: Fingerprint of the second CSV.
        left: Record details with filtered ``index`` and original ``source_index``.
            Legacy verdicts may omit ``source_index``.
        decisions: Matcher decisions, each an object or ``None``.
        verdict: Human judgement from the allowed verdict choices.
    """

    old_sha256: str
    new_sha256: str
    left: dict[str, Any]
    decisions: dict[str, dict[str, Any] | None]
    verdict: str


class Verdict(VerdictIdentity, total=False):
    """A judgement with optional contextual metadata.

    Attributes:
        schema_version: Format version; version 2 requires an original source-row index.
        election: Election label.
        reason: Short reason for the judgement.
        note: Free-text explanation.
        recorded_at: Timestamp supplied by the report.
    """

    schema_version: int
    election: str
    reason: str
    note: str
    recorded_at: str


class VerdictTally(TypedDict):
    """Summary counts for stored judgements.

    Attributes:
        total: Total judgement count.
        by_verdict: Counts by outcome.
        by_reason: Outcome counts grouped by reason.
        elections: Sorted election labels.
    """

    total: int
    by_verdict: dict[str, int]
    by_reason: dict[str, dict[str, int]]
    elections: list[str]


def key(v: Verdict) -> tuple[str, str, str, int]:
    """Identify a judgement so later imports replace the same place's verdict.

    Args:
        v: Validated judgement.

    Returns:
        Input fingerprints, identity kind, and the original source-row index.
        Legacy filtered indices use a separate identity kind so they cannot
        replace judgements with known source-row identities.
    """
    left = v["left"]
    identity_kind = "source" if "source_index" in left else "legacy"
    index = left["source_index"] if identity_kind == "source" else left["index"]
    return (v["old_sha256"], v["new_sha256"], identity_kind, index)


def validate(v: object) -> list[str]:
    """Check a downloaded verdict for required fields and allowed verdict values.

    Args:
        v: Verdict object to validate.

    Returns:
        Human-readable validation problems, or an empty list when valid.
    """
    if not isinstance(v, dict):
        return ["verdict must be an object"]

    problems = [f"missing {field!r}" for field in REQUIRED if field not in v]
    for field_name in ("old_sha256", "new_sha256"):
        if field_name in v and not isinstance(v[field_name], str):
            problems.append(f"{field_name} must be a string")
    if "verdict" in v and (
        not isinstance(v["verdict"], str) or v["verdict"] not in VERDICTS
    ):
        problems.append(f"verdict {v['verdict']!r} is not one of {sorted(VERDICTS)}")

    # Check nested record and decision details before accepting the report.
    if "left" in v:
        if not isinstance(v["left"], dict):
            problems.append("left record must be an object")
        else:
            left = v["left"]
            if "index" not in left:
                problems.append("left record has no index")
            for field_name in ("index", "source_index"):
                if field_name in left and (
                    type(left[field_name]) is not int or left[field_name] < 0
                ):
                    problems.append(
                        f"left record {field_name} must be a non-negative integer"
                    )
            if v.get("schema_version") == SCHEMA_VERSION and "source_index" not in left:
                problems.append("schema_version 2 requires left.source_index")

    if "decisions" in v:
        decisions = v["decisions"]
        if not isinstance(decisions, dict) or any(
            not isinstance(name, str)
            or (decision is not None and not isinstance(decision, dict))
            for name, decision in decisions.items()
        ):
            problems.append("decisions must map matcher names to objects or null")

    for field_name in ("election", "reason", "note", "recorded_at"):
        if field_name in v and not isinstance(v[field_name], str):
            problems.append(f"{field_name} must be a string")
    if "schema_version" in v and (
        type(v["schema_version"]) is not int
        or v["schema_version"] not in (1, SCHEMA_VERSION)
    ):
        problems.append(f"schema_version must be 1 or {SCHEMA_VERSION}")

    return problems


def _is_verdict(value: object) -> TypeGuard[Verdict]:
    """Check the runtime shape before exposing a typed judgement.

    Args:
        value: Untrusted JSON value.

    Returns:
        Whether the value satisfies the verdict schema.
    """
    return not validate(value)


def _parse_verdict(value: object) -> Verdict:
    """Validate an external JSON judgement without discarding extra report fields.

    Args:
        value: JSON value read from a report or store.

    Returns:
        A validated judgement.

    Raises:
        ValueError: If required fields or their types are invalid.
    """
    if not _is_verdict(value):
        raise ValueError(f"Bad verdict: {'; '.join(validate(value))}")
    return value


def load(path: Path | None = None) -> list[Verdict]:
    """Load verdict records from a JSON Lines file.

    Args:
        path: Verdict file to load, or the default verdict store.

    Returns:
        Validated verdict dictionaries, or an empty list if the store is absent.
    """
    path = path or DEFAULT_PATH
    if not path.exists():
        return []
    return [
        _parse_verdict(json.loads(line))
        for line in path.read_text().splitlines()
        if line.strip()
    ]


def save(verdicts: Iterable[Verdict], path: Path | None = None) -> None:
    """Write sorted verdict records to a JSON Lines file.

    Args:
        verdicts: Verdict dictionaries to store.
        path: Destination file, or the default verdict store.

    Returns:
        None. The destination file is replaced with the sorted verdicts.
    """
    path = path or DEFAULT_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = sorted(verdicts, key=lambda v: (v.get("recorded_at", ""), key(v)))
    path.write_text("".join(json.dumps(v, sort_keys=True) + "\n" for v in rows))


def import_file(source: Path, path: Path | None = None) -> dict[str, int]:
    """Merge a downloaded verdict file into the local verdict record.

    Args:
        source: Downloaded JSON file containing verdict objects.
        path: Existing verdict store to update, or the default store.

    Returns:
        Counts of new verdicts, replacements, and the final total.

    Raises:
        ValueError: If a verdict is invalid or lacks an original source-row identity.
    """
    path = path or DEFAULT_PATH
    incoming = json.loads(source.read_text())
    if isinstance(incoming, dict):
        if "verdicts" not in incoming:
            raise ValueError("Verdict report must contain a 'verdicts' list")
        incoming = incoming["verdicts"]
    if not isinstance(incoming, list):
        # Invalid report shapes are validation errors, like malformed verdict rows.
        raise ValueError(  # noqa: TRY004 - invalid report schema, like malformed rows
            "Verdict import must be a list or a report containing a 'verdicts' list"
        )
    existing = {key(v): v for v in load(path)}
    added = replaced = 0
    for value in incoming:
        v = _parse_verdict(value)
        if "source_index" not in v["left"]:
            raise ValueError(
                "Verdict download has no original source-row identity "
                "(left.source_index). Regenerate the report before importing."
            )
        v["schema_version"] = SCHEMA_VERSION
        identity = key(v)
        if identity in existing:
            replaced += existing[identity] != v
        else:
            added += 1
        existing[identity] = v

    save(existing.values(), path)
    return {"added": added, "replaced": replaced, "total": len(existing)}


def tally(verdicts: list[Verdict]) -> VerdictTally:
    """Summarise verdicts by outcome, reason, and election.

    Args:
        verdicts: Verdict dictionaries to tally.

    Returns:
        Counts and sorted election names suitable for reports.
    """
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


def format_tally(t: VerdictTally) -> str:
    """Format a verdict tally as a human-readable text report.

    Args:
        t: Tally dictionary produced by :func:`tally`.

    Returns:
        A multi-line report of verdict and reason totals.
    """
    lines = [
        f"{t['total']} verdicts across {', '.join(t['elections']) or 'no elections'}"
    ]
    for verdict, label in VERDICTS.items():
        lines.append(f"  {label:22} {t['by_verdict'].get(verdict, 0)}")
    if t["by_reason"]:
        lines.append("By reason:")
        for reason, counts in t["by_reason"].items():
            parts = ", ".join(f"{k} {n}" for k, n in sorted(counts.items()))
            lines.append(f"  {reason:28} {parts}")
    return "\n".join(lines)
