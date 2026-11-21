from __future__ import annotations

import json

import pytest

from linkage import verdicts


def _verdict(index, verdict, reason="venue change", note=""):
    return {
        "old_sha256": "a" * 64,
        "new_sha256": "b" * 64,
        "election": "test_2026",
        "left": {"index": index, "name": f"Place {index}"},
        "decisions": {"rapidfuzz": None, "splink": None},
        "verdict": verdict,
        "reason": reason,
        "note": note,
        "recorded_at": f"2026-11-21T00:00:0{index}Z",
    }


def test_import_adds_then_replaces_by_place(tmp_path):
    store = tmp_path / "verdicts.jsonl"
    first = tmp_path / "one.json"
    first.write_text(json.dumps([_verdict(1, "rapidfuzz"), _verdict(2, "splink")]))
    assert verdicts.import_file(first, store) == {"added": 2, "replaced": 0, "total": 2}

    second = tmp_path / "two.json"
    second.write_text(json.dumps([_verdict(1, "splink", note="changed my mind")]))
    assert verdicts.import_file(second, store) == {"added": 0, "replaced": 1, "total": 2}
    stored = {v["left"]["index"]: v for v in verdicts.load(store)}
    assert stored[1]["verdict"] == "splink" and stored[1]["schema_version"] == verdicts.SCHEMA_VERSION


def test_import_rejects_bad_verdicts(tmp_path):
    bad = tmp_path / "bad.json"
    bad.write_text(json.dumps([_verdict(1, "maybe")]))
    with pytest.raises(ValueError, match="not one of"):
        verdicts.import_file(bad, tmp_path / "store.jsonl")


def test_tally_counts_by_verdict_and_reason():
    t = verdicts.tally([
        _verdict(1, "rapidfuzz", "coordinate typo"),
        _verdict(2, "splink", "venue change"),
        _verdict(3, "splink", "venue change"),
    ])
    assert t["by_verdict"] == {"rapidfuzz": 1, "splink": 2}
    assert t["by_reason"]["venue change"] == {"splink": 2}
    assert "Splink was right       2" in verdicts.format_tally(t)
