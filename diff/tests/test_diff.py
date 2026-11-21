from __future__ import annotations

import csv
import json
from pathlib import Path

import pytest

from ppdiff.core import changed_text, location_change, warnings_for
from ppdiff.run import run_pair, series

from linkage.records import ColumnMap, Dataset, records_from_rows

COLUMNS = ColumnMap(name="name", premises="premises", address=("address",), lat="lat", lon="lon")
FIELDS = ["name", "premises", "address", "lat", "lon", "wheelchair_access"]


def _ds(rows):
    return Dataset(path="x.csv", columns=COLUMNS, records=records_from_rows(rows, COLUMNS))


def _row(name, lat, lon, address="1 Main St, Town", access="Full", premises=""):
    return {"name": name, "premises": premises, "address": address, "lat": f"{lat:.6f}", "lon": f"{lon:.6f}", "wheelchair_access": access}


def _write(path: Path, rows):
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)
    return path


def test_changed_text_only_ignores_surrounding_whitespace():
    assert not changed_text(" Full ", "Full")
    assert changed_text("1.50", "1.5")  # a change, but a cosmetic one (decided by linkage)
    assert changed_text("Full", "Assisted")


def test_location_change_ignores_float_noise_and_flags_single_axis_typos():
    old = _ds([_row("A", -31.656332, 116.671239), _row("B", -33.0, 151.0)])
    new = _ds([_row("A", -32.656332, 116.671239), _row("B", -33.0000001, 151.0)])
    typo = location_change(old, new, 0, 0)
    assert typo["likely_typo"] == "latitude" and typo["moved_m"] > 100_000
    assert warnings_for(typo) == ["Moved 111.2 km, latitude only: likely coordinate typo"]
    assert location_change(old, new, 1, 1) is None


def test_location_change_reports_coordinates_appearing():
    old = _ds([{"name": "A", "premises": "", "address": "", "lat": "", "lon": "", "wheelchair_access": ""}])
    new = _ds([_row("A", -33.0, 151.0)])
    assert location_change(old, new, 0, 0)["note"] == "coordinates added"


@pytest.fixture
def pair(tmp_path):
    (tmp_path / "data").mkdir()
    old = _write(tmp_path / "data" / "20260101 places.csv", [
        _row("Alpha Hall", -33.00, 151.00),
        _row("Beta School", -33.10, 151.10, access="Assisted"),
        _row("Gamma Church", -33.20, 151.20),
        _row("Delta Library", -33.30, 151.30),
    ])
    new = _write(tmp_path / "data" / "20260108 places.csv", [
        _row("Alpha Hall", -33.00, 151.00),
        _row("Beta School", -33.10, 151.10, access="Full"),  # changed field
        _row("Gamma Church", -34.20, 151.20),  # latitude typo
        _row("Epsilon Centre", -33.40, 151.40, address="9 New Rd, Elsewhere"),  # added; Delta removed
    ])
    return tmp_path, old, new


def test_run_pair_writes_one_diff_per_matcher_and_a_report(pair):
    root, old, new = pair
    target = run_pair(old, new, root / "diffs", matcher="rapidfuzz")
    assert sorted(p.name for p in target.iterdir()) == ["diff-rapidfuzz.json", "disagreements.json", "link.json", "report.html"]
    d = json.loads((target / "diff-rapidfuzz.json").read_text())
    assert d["summary"] == {
        "unchanged": 1, "changed": 2, "added": 1, "removed": 1, "possible_matches": 0, "cosmetic": 0,
        "likely_replacements": 0, "warnings": 1, "quality_issues": 0,
    }
    beta = next(e for e in d["changed"] if e["name"] == "Beta School")
    assert beta["changes"] == [
        {"field": "wheelchair_access", "old": "Assisted", "new": "Full", "cosmetic": False, "category": "accessibility", "direction": "improved"}
    ]
    gamma = next(e for e in d["changed"] if e["name"] == "Gamma Church")
    assert gamma["changes"] == [] and gamma["location"]["likely_typo"] == "latitude"
    assert [e["name"] for e in d["added"]] == ["Epsilon Centre"]
    assert [e["name"] for e in d["removed"]] == ["Delta Library"]
    assert d["old"]["sha256"] and d["matcher"] == "rapidfuzz"
    assert (d["old"]["label"], d["new"]["label"]) == ("Thu 1 Jan 2026", "Thu 8 Jan 2026")
    html = (target / "report.html").read_text()
    assert "<title>Thu 1 Jan 2026 → Thu 8 Jan 2026</title>" in html
    assert 'src="https://cdn.jsdelivr.net/npm/ol@10.11.0/dist/ol.js"' in html
    assert 'src="https://cdn.jsdelivr.net/npm/ol-mapbox-style@13.9.0/dist/olms.js"' in html
    assert "tiles.openfreemap.org/styles/liberty" in html and "google.com/maps/search" in html
    assert "cartocdn" not in html and "arcgisonline" not in html
    assert "Gamma Church" in html and "{{DATA}}" not in html and "</script" not in html.split('id="data">')[1].split("</script>")[0]


def test_run_pair_with_both_matchers_records_disagreements(pair):
    root, old, new = pair
    target = run_pair(old, new, root / "diffs", matcher="both", election="test_2026")
    assert {p.name for p in target.glob("diff-*.json")} == {"diff-rapidfuzz.json", "diff-splink.json"}
    dis = json.loads((target / "disagreements.json").read_text())
    assert dis["election"] == "test_2026" and dis["matchers"] == ["rapidfuzz", "splink"]
    for item in dis["items"]:
        assert set(item["decisions"]) == {"rapidfuzz", "splink"}


def test_series_pairs_consecutive_files(pair):
    root, old, new = pair
    later = _write(root / "data" / "20260115 places.csv", [_row("Alpha Hall", -33.0, 151.0)])
    assert series(str(root / "data" / "*.csv")) == [(old, new), (new, later)]


def test_field_categories_and_access_direction():
    from ppdiff.core import access_direction, field_category

    assert field_category("wheelchair_access") == "accessibility"
    assert field_category("entrance_desc") == "entrance"
    assert field_category("opening_hours") == "hours"
    assert field_category("suburb") == "address"
    assert field_category("est_ordinary_votes") == "votes"
    assert field_category("mystery") == "other"
    assert access_direction("wheelchair_access", "None", "Assisted") == "improved"
    assert access_direction("wheelchair_access", "Full", "Assisted") == "worse"
    assert access_direction("wheelchair_access_description", "None", "Full") is None
    assert access_direction("wheelchair_access", "Full", "Full") is None


def test_replacements_quality_and_categories_in_diff(pair, tmp_path):
    root, old, new = pair
    # Delta (removed) and a new venue 200 m away should pair up; Epsilon is far from anything.
    rows = [
        _row("Alpha Hall", -33.00, 151.00),
        _row("Beta School", -33.10, 151.10, access="Full"),
        _row("Gamma Church", -33.20, 151.20, address=""),  # address newly blank
        _row("Delta Replacement Hall", -33.3018, 151.30, address="2 Other St"),
        _row("Zeta Hall", -33.00, 151.00, address="99 Far Rd"),  # same coordinates as Alpha, different place
        _row("Eta Hut", -33.5, 151.5),
    ]
    rows[-1]["lat"], rows[-1]["lon"] = "-33.5", "151.5"  # low precision
    newer = _write(root / "data" / "20260108b places.csv", rows)
    target = run_pair(old, newer, root / "diffs2", matcher="rapidfuzz")
    d = json.loads((target / "diff-rapidfuzz.json").read_text())
    assert [(p["old_name"], p["new_name"]) for p in d["replacements"]] == [("Delta Library", "Delta Replacement Hall")]
    removed = next(r for r in d["removed"] if r["name"] == "Delta Library")
    assert removed["replaced_by"] is not None
    checks = {q["check"]: q for q in d["quality"]}
    assert {p["name"] for p in checks["same_coordinates"]["places"]} == {"Alpha Hall", "Zeta Hall"}
    assert [p["name"] for p in checks["low_precision"]["places"]] == ["Eta Hut"]
    assert [p["name"] for p in checks["newly_blank:address"]["places"]] == ["Gamma Church"]
    beta = next(e for e in d["changed"] if e["name"] == "Beta School")
    assert beta["changes"][0]["category"] == "accessibility" and beta["changes"][0]["direction"] == "improved"
    assert len(d["context_points"]) == 6


def test_index_follows_a_place_across_the_series(pair):
    from ppdiff.index import history

    root, old, new = pair
    later = _write(root / "data" / "20260115 places.csv", [
        _row("Alpha Hall", -33.00, 151.00),
        _row("Beta School", -33.10, 151.10, access="None"),
        _row("Gamma Church", -33.20, 151.20),
        _row("Epsilon Centre", -33.40, 151.40, address="9 New Rd, Elsewhere"),
    ])
    out = root / "diffs"
    run_pair(old, new, out, matcher="rapidfuzz")
    run_pair(new, later, out, matcher="rapidfuzz")
    assert (out / "index.html").exists()
    places = {p["name"]: [e["kind"] + ":" + e["text"] for e in p["events"]] for p in history(sorted(p.parent for p in out.glob("*/link.json")), "rapidfuzz")}
    assert places["Beta School"] == ["changed:wheelchair_access (improved)", "changed:wheelchair_access (worse)"]
    assert places["Gamma Church"] == ["changed:moved 111.2 km", "changed:moved 111.2 km"]
    assert places["Epsilon Centre"] == ["added:added"]
    assert places["Delta Library"] == ["removed:removed"]


def _town(prefix, lat, lon, n=4):
    """A small cluster of places around a town centre."""
    return [_row(f"{prefix} Hall {i}", lat + 0.002 * i, lon + 0.002 * i, address=f"{i} {prefix} St") for i in range(n)]


def _typo_files(root):
    good = _town("Northam", -31.656, 116.671) + _town("York", -31.888, 116.770)
    typo = [dict(r) for r in good]
    typo[0]["lat"] = "-32.656000"  # latitude off by one degree, far from every other place
    return good, typo


def test_suggested_fix_when_new_file_has_the_typo(tmp_path):
    good, typo = _typo_files(tmp_path)
    (tmp_path / "data").mkdir()
    old = _write(tmp_path / "data" / "20260101 a.csv", good)
    new = _write(tmp_path / "data" / "20260102 b.csv", typo)
    d = json.loads((run_pair(old, new, tmp_path / "e" / "diffs", matcher="rapidfuzz") / "diff-rapidfuzz.json").read_text())
    (fix,) = [f for f in d["suggested_fixes"] if f["kind"] == "coordinates"]
    assert fix["likely"] and not fix["no_fix_needed"]
    assert fix["fix"] == {
        "field": "name", "value": "Northam Hall 0",
        "overwrite": [{"field": "lat", "value": -31.656}, {"field": "lon", "value": 116.671}],
    }
    assert d["changed"][0]["name"] == "Northam Hall 0"  # biggest change first


def test_no_fix_needed_when_new_file_corrects_the_typo(tmp_path):
    good, typo = _typo_files(tmp_path)
    (tmp_path / "data").mkdir()
    old = _write(tmp_path / "data" / "20260101 a.csv", typo)
    new = _write(tmp_path / "data" / "20260102 b.csv", good)
    d = json.loads((run_pair(old, new, tmp_path / "e" / "diffs", matcher="rapidfuzz") / "diff-rapidfuzz.json").read_text())
    (fix,) = [f for f in d["suggested_fixes"] if f["kind"] == "coordinates"]
    assert fix["no_fix_needed"] and fix["fix"] is None


def test_fix_fields_use_the_loaders_renamed_columns(tmp_path):
    good, typo = _typo_files(tmp_path)
    renamed = lambda rows: [{"PPName": r["name"], "premises": r["premises"], "address": r["address"], "Lat": r["lat"], "Long": r["lon"]} for r in rows]
    election = tmp_path / "fed"
    (election / "data").mkdir(parents=True)
    (election / "config.json").write_text(json.dumps({"rename_columns": {"PPName": "name", "Lat": "lat", "Long": "lon"}}))
    def write(path, rows):
        with open(path, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=["PPName", "premises", "address", "Lat", "Long"]); w.writeheader(); w.writerows(rows)
        return path
    old = write(election / "data" / "20260101 a.csv", renamed(good))
    new = write(election / "data" / "20260102 b.csv", renamed(typo))
    d = json.loads((run_pair(old, new, election / "diffs", matcher="rapidfuzz") / "diff-rapidfuzz.json").read_text())
    (fix,) = [f for f in d["suggested_fixes"] if f["kind"] == "coordinates"]
    assert fix["fix"]["field"] == "name" and [o["field"] for o in fix["fix"]["overwrite"]] == ["lat", "lon"]


def test_nothing_changed_flag_and_latest_command(tmp_path, capsys):
    from ppdiff.cli import main

    (tmp_path / "data").mkdir()
    rows = _town("Coffs", -30.29, 153.11)
    _write(tmp_path / "data" / "20260101 a.csv", rows)
    _write(tmp_path / "data" / "20260102 b.csv", rows)
    _write(tmp_path / "data" / "20260103 c.csv", rows)
    out = tmp_path / "diffs"
    assert main(["latest", str(tmp_path / "data" / "*.csv"), "--out-dir", str(out), "--matcher", "rapidfuzz"]) == 0
    folders = [p.name for p in out.iterdir() if p.is_dir()]
    assert folders == ["20260102-b__20260103-c"]  # only the newest pair
    d = json.loads((out / folders[0] / "diff-rapidfuzz.json").read_text())
    assert d["nothing_changed"] is True
    capsys.readouterr()
    main(["latest", str(tmp_path / "data" / "*.csv"), "--out-dir", str(out), "--matcher", "rapidfuzz"])
    assert "already done" in capsys.readouterr().out


def test_cosmetic_changes_are_decided_by_linkage(tmp_path):
    (tmp_path / "data").mkdir()
    a = [_row("Alpha Hall", -33.0, 151.0, address="12 Smith Street, Town"), _row("Beta Hall", -33.1, 151.1, access="None")]
    b = [_row("Alpha Hall", -33.0, 151.0, address="12 Smith St, Town"), _row("Beta Hall", -33.1, 151.1, access="Full")]
    old, new = _write(tmp_path / "data" / "20260101 a.csv", a), _write(tmp_path / "data" / "20260102 b.csv", b)
    d = json.loads((run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz") / "diff-rapidfuzz.json").read_text())
    assert [e["name"] for e in d["cosmetic"]] == ["Alpha Hall"] and d["cosmetic"][0]["changes"][0]["cosmetic"] is True
    assert [e["name"] for e in d["changed"]] == ["Beta Hall"]
    assert d["summary"]["changed"] == 1 and d["summary"]["cosmetic"] == 1


def test_diff_json_settings_and_cli_overrides(pair):
    root, old, new = pair
    (root / "diff.json").write_text(json.dumps({"ignore": ["wheelchair_access"], "large_move_m": 200000, "matcher": "rapidfuzz"}))
    target = run_pair(old, new, root / "diffs")
    assert [p.name for p in target.glob("diff-*.json")] == ["diff-rapidfuzz.json"]  # matcher from diff.json
    d = json.loads((target / "diff-rapidfuzz.json").read_text())
    assert d["settings"] == {"ignore": ["wheelchair_access"], "large_move_m": 200000, "replacement_radius_m": 500.0}
    assert all(c["field"] != "wheelchair_access" for e in d["changed"] for c in e["changes"])
    gamma = next(e for e in d["changed"] if e["name"] == "Gamma Church")
    assert gamma["warnings"] == []  # 111 km is under the 200 km threshold set in diff.json
    target = run_pair(old, new, root / "diffs", ignore={"address"}, large_move_m=1000)
    d = json.loads((target / "diff-rapidfuzz.json").read_text())
    assert d["settings"]["ignore"] == ["address", "wheelchair_access"] and d["settings"]["large_move_m"] == 1000


def test_diff_json_rejects_unknown_settings(pair):
    root, old, new = pair
    (root / "diff.json").write_text(json.dumps({"ignroe": ["x"]}))
    with pytest.raises(ValueError, match="unknown settings"):
        run_pair(old, new, root / "diffs")


def test_reviewed_import_saves_ticks_into_the_pair_folder(pair, tmp_path):
    from ppdiff.cli import main

    root, old, new = pair
    target = run_pair(old, new, root / "diffs", matcher="rapidfuzz")
    link = json.loads((target / "link.json").read_text())
    download = tmp_path / "reviewed download.json"
    download.write_text(json.dumps({
        "old_sha256": link["left"]["sha256"], "new_sha256": link["right"]["sha256"],
        "reviewed": {"pair-1": "2026-11-21T10:00:00Z", "added-3": "2026-11-21T10:01:00Z"},
    }))
    assert main(["reviewed", "import", str(download), "--diffs-dir", str(root / "diffs")]) == 0
    saved = json.loads((target / "reviewed.json").read_text())
    assert sorted(saved["reviewed"]) == ["added-3", "pair-1"]
    html = (target / "report.html").read_text()
    assert '"reviewed": {"added-3"' in html.replace("\\u0022", '"') or '"added-3"' in html
    # Unticking in the browser (a download without pair-1) removes it from the repo too.
    download.write_text(json.dumps({**json.loads(download.read_text()), "reviewed": {"added-3": "x"}}))
    main(["reviewed", "import", str(download), "--diffs-dir", str(root / "diffs")])
    assert list(json.loads((target / "reviewed.json").read_text())["reviewed"]) == ["added-3"]


def test_index_flags_quiet_pairs_and_tallies_this_elections_verdicts(tmp_path, monkeypatch):
    from linkage import verdicts as verdict_store
    from ppdiff.index import write_index

    election = tmp_path / "test_2026"
    (election / "data").mkdir(parents=True)
    rows = _town("Coffs", -30.29, 153.11)
    for name in ("20260101 a.csv", "20260102 b.csv", "20260103 c.csv"):
        _write(election / "data" / name, rows)
    for a, b in series(str(election / "data" / "*.csv")):
        run_pair(a, b, election / "diffs", matcher="rapidfuzz")
    store = tmp_path / "verdicts.jsonl"
    store.write_text(
        json.dumps({"old_sha256": "x", "new_sha256": "y", "election": "test_2026", "left": {"index": 0}, "decisions": {}, "verdict": "splink", "reason": "venue change"}) + "\n"
        + json.dumps({"old_sha256": "p", "new_sha256": "q", "election": "other", "left": {"index": 0}, "decisions": {}, "verdict": "rapidfuzz", "reason": "rename"}) + "\n"
    )
    monkeypatch.setattr(verdict_store, "DEFAULT_PATH", store)
    html = write_index(election / "diffs").read_text()
    data = json.loads(html.split('id="data">')[1].split("</script>")[0])
    assert [p["nothing_changed"] for p in data["pairs"]] == [True, True]
    assert data["tally_here"]["by_verdict"] == {"splink": 1}
    assert data["tally_all"]["total"] == 2


def test_loader_checks_audit_fixes_and_find_load_problems(tmp_path):
    election = tmp_path / "test_2026"
    (election / "data").mkdir(parents=True)
    hdr = ["PPName", "premises", "address", "lat", "lon", "access"]

    def write(path, rows):
        with open(path, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=hdr); w.writeheader(); w.writerows(rows)
        return path

    def row(name, lat, lon, access="Full", address="1 Main St"):
        return {"PPName": name, "premises": "", "address": address, "lat": f"{lat:.6f}", "lon": f"{lon:.6f}", "access": access}

    old_rows = [row("Alpha", -33.0, 151.0), row("Beta", -33.1, 151.1), row("Gone", -33.2, 151.2), row("Twin", -33.3, 151.3), row("Twin", -33.4, 151.4)]
    new_rows = [row("Alpha", -33.0, 151.0), row("Beta", -33.5, 151.1), row("Twin", -33.3, 151.3), row("Twin", -33.4, 151.4),
                row("Delta", -33.6, 151.6, access="Wheelchair Access", address=" ")]
    (election / "config.json").write_text(json.dumps({
        "rename_columns": {"PPName": "name", "access": "wheelchair_access"},
        "add_columns": {"state": "NSW", "ec_id": ""},
        "fix_data_issues": [
            {"field": "name", "value": "Alpha", "overwrite": [{"field": "lat", "value": -33.9}, {"field": "lng", "value": 151.9}]},
            {"field": "name", "value": "Gone", "overwrite": [{"field": "lat", "value": -33.9}]},
            {"field": "name", "value": "Beta", "overwrite": [{"field": "lat", "value": "-33.500000"}]},
            {"field": "name", "value": "Twin", "overwrite": [{"field": "lat", "value": -34.0}]},
            {"field": "name", "value": "Delta", "overwrite": [{"field": "lat", "value": -34.1}]},
            {"field": "wheelchair_access", "value": "Wheelchair Access", "overwrite": [{"field": "wheelchair_access", "value": "Full"}]},
        ],
    }))
    old = write(election / "data" / "20260101 a.csv", old_rows)
    new = write(election / "data" / "20260102 b.csv", new_rows)
    d = json.loads((run_pair(old, new, election / "diffs", matcher="rapidfuzz") / "diff-rapidfuzz.json").read_text())
    loader = d["loader"]
    assert [f["status"] for f in loader["fix_audit"]] == [
        "missing_field", "stopped_matching", "already_fixed", "multiple", "applies", "applies",
    ]
    assert loader["fix_audit"][0]["missing_fields"] == ["lng"]
    assert loader["fix_audit"][5]["translates_value"] is True
    # Delta's wheelchair value is translated by the last fix, so only its blank address is a problem.
    assert loader["problems"] == [{"new_index": 4, "name": "Delta", "problems": ["address is blank"]}]
    assert loader["rows_after_filters"] == 5


def test_loader_checks_skip_without_config(pair):
    root, old, new = pair
    d = json.loads((run_pair(old, new, root / "diffs", matcher="rapidfuzz") / "diff-rapidfuzz.json").read_text())
    assert d["loader"] == {"config_found": False}
