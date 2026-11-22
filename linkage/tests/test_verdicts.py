from __future__ import annotations

import json

import pytest
from linkage.compare import compare_results
from linkage.result import Link, LinkResult
from linkage.run import link_files

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
        "left": {"index": index, "source_index": index, "name": f"Place {index}"},
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


def test_verdict_import_uses_source_rows_across_filtered_reports(tmp_path):
    old, new = tmp_path / "old.csv", tmp_path / "new.csv"
    text = "name,address\nAlpha,1 First Road\nBeta,2 Second Road\n"
    old.write_text(text)
    new.write_text(text)
    whole_left, whole_right, whole_report = link_files(old, new, matcher="rapidfuzz")
    filtered_left, filtered_right, filtered_report = link_files(
        old, new, matcher="rapidfuzz", row_filter=lambda row: row["name"] == "Beta"
    )
    assert whole_report["left"]["source_indices"] == [0, 1]
    assert filtered_report["left"]["source_indices"] == [1]
    assert [r.source_index for r in whole_right.records] == [0, 1]
    assert [r.source_index for r in filtered_right.records] == [1]
    assert whole_report["left"]["sha256"] == filtered_report["left"]["sha256"]
    comparison = compare_results(
        LinkResult("first", [Link(0, 0, 1.0, "auto", "matcher")], [], []),
        LinkResult("second", [], [0], [0]),
        filtered_left,
        filtered_right,
    )
    disagreement = comparison["disagreements"][0]
    assert disagreement["left"] == 0
    assert disagreement["left_source_index"] == 1
    assert disagreement["first"]["right_source_index"] == 1

    store, source = tmp_path / "store.jsonl", tmp_path / "download.json"
    for records, report, row_index, judgement, expected in [
        (
            whole_left,
            whole_report,
            0,
            "rapidfuzz",
            {"added": 1, "replaced": 0, "total": 1},
        ),
        (
            filtered_left,
            filtered_report,
            0,
            "splink",
            {"added": 1, "replaced": 0, "total": 2},
        ),
        (
            whole_left,
            whole_report,
            1,
            "neither",
            {"added": 0, "replaced": 1, "total": 2},
        ),
    ]:
        record = records.records[row_index]
        value = {
            **_verdict(row_index, judgement),
            "old_sha256": report["left"]["sha256"],
            "new_sha256": report["right"]["sha256"],
            "left": {
                "index": record.index,
                "source_index": record.source_index,
                "name": record.name,
            },
        }
        source.write_text(json.dumps([value]))
        assert verdicts.import_file(source, store) == expected

    stored = {v["left"]["source_index"]: v for v in verdicts.load(store)}
    assert stored[0]["left"]["name"] == "Alpha"
    assert stored[0]["verdict"] == "rapidfuzz"
    assert stored[1]["left"]["name"] == "Beta"
    assert stored[1]["verdict"] == "neither"


def test_legacy_verdicts_remain_separate_from_source_row_verdicts(tmp_path):
    source, store = tmp_path / "download.json", tmp_path / "store.jsonl"
    legacy = {**_verdict(0, "rapidfuzz"), "schema_version": 1}
    legacy["left"].pop("source_index")
    store.write_text(json.dumps(legacy) + "\n")
    assert verdicts.load(store) == [legacy]
    source.write_text(json.dumps([_verdict(0, "splink")]))

    assert verdicts.import_file(source, store) == {
        "added": 1,
        "replaced": 0,
        "total": 2,
    }
    stored = verdicts.load(store)
    assert len(stored) == 2
    assert (
        next(v for v in stored if v.get("schema_version") == 1)["verdict"]
        == "rapidfuzz"
    )
    assert (
        next(v for v in stored if v.get("schema_version") == 2)["verdict"] == "splink"
    )


def test_legacy_downloads_require_regeneration_without_modifying_store(tmp_path):
    source, store = tmp_path / "download.json", tmp_path / "store.jsonl"
    original = json.dumps(_verdict(0, "splink")) + "\n"
    store.write_text(original)
    legacy = _verdict(1, "rapidfuzz")
    legacy["left"].pop("source_index")
    source.write_text(json.dumps([_verdict(2, "neither"), legacy]))

    with pytest.raises(ValueError, match="Regenerate the report"):
        verdicts.import_file(source, store)
    assert store.read_text() == original


@pytest.mark.parametrize("source_index", [None, True, -1, "1"])
def test_invalid_source_rows_cannot_modify_verdict_store(tmp_path, source_index):
    source, store = tmp_path / "download.json", tmp_path / "store.jsonl"
    value = _verdict(0, "rapidfuzz")
    value["left"]["source_index"] = source_index
    source.write_text(json.dumps([value]))
    with pytest.raises(ValueError, match="source_index"):
        verdicts.import_file(source, store)
    assert not store.exists()


def test_current_verdict_schema_requires_a_source_row(tmp_path):
    source = tmp_path / "download.json"
    value = {**_verdict(0, "splink"), "schema_version": 2}
    value["left"].pop("source_index")
    source.write_text(json.dumps([value]))
    with pytest.raises(ValueError, match="source_index"):
        verdicts.import_file(source, tmp_path / "store.jsonl")


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
