from __future__ import annotations

import json

import pytest

from linkage import verdicts


def _verdict(
    index: int, verdict: str, reason: str = "venue change", note: str = ""
) -> verdicts.Verdict:
    """Create a judgement for a synthetic place in a fixed pair of input files.

    Args:
        index: Left record's row index.
        verdict: Matcher judgement, including invalid choices for rejection tests.
        reason: Short explanation of the judgement.
        note: Optional free-text detail.

    Returns:
        A verdict dictionary with repeatable file fingerprints and place metadata.
    """
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
    assert verdicts.import_file(second, store) == {
        "added": 0,
        "replaced": 1,
        "total": 2,
    }
    stored = {v["left"]["index"]: v for v in verdicts.load(store)}
    assert (
        stored[1]["verdict"] == "splink"
        and stored[1].get("schema_version") == verdicts.SCHEMA_VERSION
    )


def test_import_rejects_bad_verdicts(tmp_path):
    bad = tmp_path / "bad.json"
    bad.write_text(json.dumps([_verdict(1, "maybe")]))
    with pytest.raises(ValueError, match="not one of"):
        verdicts.import_file(bad, tmp_path / "store.jsonl")


@pytest.mark.parametrize(
    "value",
    [
        None,
        [],
        "not a verdict",
        {**_verdict(1, "splink"), "left": None},
        {**_verdict(1, "splink"), "left": {"index": "1"}},
        {**_verdict(1, "splink"), "decisions": []},
        {**_verdict(1, "splink"), "reason": []},
        {**_verdict(1, "splink"), "schema_version": 999},
    ],
)
def test_invalid_shapes_do_not_modify_verdict_store(tmp_path, value):
    store = tmp_path / "store.jsonl"
    original = json.dumps(_verdict(0, "rapidfuzz")) + "\n"
    store.write_text(original)
    source = tmp_path / "download.json"
    source.write_text(json.dumps([_verdict(2, "splink"), value]))

    with pytest.raises(ValueError, match="Bad verdict"):
        verdicts.import_file(source, store)
    assert store.read_text() == original


def test_import_preserves_extra_fields_in_wrapped_reports(tmp_path):
    source = tmp_path / "download.json"
    store = tmp_path / "store.jsonl"
    verdict = {**_verdict(1, "splink"), "extra_report_field": {"value": 42}}
    source.write_text(json.dumps({"verdicts": [verdict]}))

    verdicts.import_file(source, store)

    assert json.loads(store.read_text())["extra_report_field"] == {"value": 42}


@pytest.mark.parametrize("report", [{}, {"verdicts": None}, {"verdicts": {}}])
def test_import_rejects_reports_without_a_verdict_list(tmp_path, report):
    source = tmp_path / "download.json"
    source.write_text(json.dumps(report))
    with pytest.raises(ValueError, match="list"):
        verdicts.import_file(source, tmp_path / "store.jsonl")


def test_tally_counts_by_verdict_and_reason():
    t = verdicts.tally(
        [
            _verdict(1, "rapidfuzz", "coordinate typo"),
            _verdict(2, "splink", "venue change"),
            _verdict(3, "splink", "venue change"),
        ]
    )
    assert t["by_verdict"] == {"rapidfuzz": 1, "splink": 2}
    assert t["by_reason"]["venue change"] == {"splink": 2}
    assert "Splink was right       2" in verdicts.format_tally(t)
