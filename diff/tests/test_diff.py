from __future__ import annotations

import csv
import json
from pathlib import Path

import pytest

from ppdiff.core import changed_text, location_change, warnings_for
from ppdiff.run import disagreements, run_pair, series

from linkage.records import ColumnMap, Dataset, records_from_rows
from linkage.result import Link, LinkResult

COLUMNS = ColumnMap(name="name", premises="premises", address=("address",), lat="lat", lon="lon")
FIELDS = ["name", "premises", "address", "lat", "lon", "wheelchair_access"]


def _ds(rows):
    """Make a dataset from test rows.

    Args:
        rows: Source rows in their original order.

    Returns:
        A dataset using the test column mapping.
    """
    return Dataset(path="x.csv", columns=COLUMNS, records=records_from_rows(rows, COLUMNS))


def _row(name, lat, lon, address="1 Main St, Town", access="Full", premises=""):
    """Make a source row for a polling place.

    Args:
        name: Place name.
        lat: Latitude.
        lon: Longitude.
        address: Street address.
        access: Wheelchair access description.
        premises: Building name.

    Returns:
        A row using the test column names.
    """
    return {"name": name, "premises": premises, "address": address, "lat": f"{lat:.6f}", "lon": f"{lon:.6f}", "wheelchair_access": access}


def _write(path: Path, rows):
    """Write test rows to a CSV.

    Args:
        path: Destination file.
        rows: Source rows to write.

    Returns:
        The destination path.
    """
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
    """Create two test scrapes with additions, removals and changes.

    Args:
        tmp_path: Temporary directory supplied by pytest.

    Returns:
        The directory and the earlier and later CSV paths.
    """
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


@pytest.mark.parametrize("ignored_coordinate", ["lat", "lon"])
def test_ignored_coordinate_suppresses_location_changes_and_fixes(pair, ignored_coordinate):
    root, old, new = pair
    target = run_pair(old, new, root / f"diffs-ignore-{ignored_coordinate}", matcher="rapidfuzz", ignore={ignored_coordinate})
    d = json.loads((target / "diff-rapidfuzz.json").read_text())

    assert all(e["name"] != "Gamma Church" for e in d["changed"])
    assert d["summary"]["warnings"] == 0
    assert not [f for f in d["suggested_fixes"] if f["kind"] == "coordinates"]


@pytest.mark.parametrize("column", ["address", "lat"])
def test_ignored_newly_blank_field_has_no_quality_check_or_fix(tmp_path, column):
    row = _row("Hall", -33, 151)
    old = _write(tmp_path / "20260101.csv", [row])
    new = _write(tmp_path / "20260102.csv", [{**row, column: ""}])

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz", ignore={column})
    diff = json.loads((folder / "diff-rapidfuzz.json").read_text())

    assert diff["nothing_changed"]
    assert not any(q["check"] == f"newly_blank:{column}" for q in diff["quality"])
    assert not any(f.get("field") == column for f in diff["suggested_fixes"])


def test_short_csv_row_is_reported_as_blank_instead_of_crashing(tmp_path):
    old = _write(tmp_path / "20260101.csv", [_row("Hall", -33, 151)])
    new = tmp_path / "20260102.csv"
    new.write_text("name,premises,address,lat,lon,wheelchair_access\nHall,,1 Main St,-33,151\n")
    (tmp_path / "config.json").write_text(json.dumps({"add_columns": {"state": "NSW"}}))

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    diff = json.loads((folder / "diff-rapidfuzz.json").read_text())

    assert diff["changed"][0]["changes"][-1]["new"] == ""
    assert any("wheelchair_access" in problem for p in diff["loader"]["problems"] for problem in p["problems"])


@pytest.mark.parametrize("old_rows,new_rows", [([_row("Hall", -33, 151)], []), ([], [])])
def test_header_only_csv_preserves_column_changes(tmp_path, old_rows, new_rows):
    old = _write(tmp_path / "20260101.csv", old_rows)
    new = _write(tmp_path / "20260102.csv", new_rows)

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    diff = json.loads((folder / "diff-rapidfuzz.json").read_text())

    assert diff["columns"]["old"] == FIELDS
    assert diff["columns"]["new"] == FIELDS
    assert diff["columns"]["added"] == diff["columns"]["removed"] == []


def test_header_changes_between_empty_csvs_are_detected(tmp_path):
    old = _write(tmp_path / "20260101.csv", [])
    new = tmp_path / "20260102.csv"
    new.write_text("name,address,lat,lon,new_column\n")
    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    diff = json.loads((folder / "diff-rapidfuzz.json").read_text())

    assert diff["columns"]["added"] == ["new_column"]
    assert "wheelchair_access" in diff["columns"]["removed"]
    assert not diff["nothing_changed"]


def test_run_pair_with_both_matchers_records_disagreements(pair):
    root, old, new = pair
    target = run_pair(old, new, root / "diffs", matcher="both", election="test_2026")
    assert {p.name for p in target.glob("diff-*.json")} == {"diff-rapidfuzz.json", "diff-splink.json"}
    dis = json.loads((target / "disagreements.json").read_text())
    assert dis["election"] == "test_2026" and dis["matchers"] == ["rapidfuzz", "splink"]
    for item in dis["items"]:
        assert set(item["decisions"]) == {"rapidfuzz", "splink"}


def test_disagreements_keep_each_matcher_decision():
    old = _ds([_row("A", -33, 151), _row("B", -33.1, 151.1)])
    new = _ds([_row("C", -33, 151), _row("D", -33.1, 151.1)])
    first = LinkResult("first", [Link(0, 0, 0.9, "auto", "matcher")], [1], [1])
    second = LinkResult("second", [Link(1, 1, 0.8, "review", "matcher")], [0], [0])
    link_output = {
        "left": {"path": "old.csv", "sha256": "old"},
        "right": {"path": "new.csv", "sha256": "new"},
        "results": [first.to_dict(), second.to_dict()],
        "comparison": {"disagreements": [{"left": 0}, {"left": 1}]},
    }

    items = disagreements(old, new, link_output, "test")["items"]

    assert items[0]["decisions"]["first"]["right"]["name"] == "C"
    assert items[0]["decisions"]["second"] is None
    assert items[1]["decisions"]["first"] is None
    assert items[1]["decisions"]["second"]["right"]["name"] == "D"


def test_disagreement_verdict_preserves_original_indices_after_filtering(tmp_path):
    from linkage.records import load_csv
    from linkage.verdicts import import_file

    old_path = _write(tmp_path / "old.csv", [_row("Skip", -33, 151), _row("Hall", -33.1, 151.1)])
    new_path = _write(tmp_path / "new.csv", [_row("Skip", -33, 151), _row("Hall", -33.1, 151.1)])
    keep_hall = lambda row: row["name"] == "Hall"
    old = load_csv(old_path, row_filter=keep_hall)
    new = load_csv(new_path, row_filter=keep_hall)
    linked = LinkResult("first", [Link(0, 0, 0.9, "auto", "matcher")], [], [])
    unlinked = LinkResult("second", [], [0], [0])
    output = {
        "left": {"path": str(old_path), "sha256": "old"},
        "right": {"path": str(new_path), "sha256": "new"},
        "results": [linked.to_dict(), unlinked.to_dict()],
        "comparison": {"disagreements": [{"left": 0}]},
    }

    item = disagreements(old, new, output, "test")["items"][0]
    assert (item["left"]["index"], item["left"]["source_index"]) == (0, 1)
    assert item["decisions"]["first"]["right"]["source_index"] == 1
    download = tmp_path / "verdicts.json"
    download.write_text(json.dumps([{
        "schema_version": 2, "old_sha256": "old", "new_sha256": "new",
        "left": item["left"], "decisions": item["decisions"], "verdict": "rapidfuzz",
    }]))
    store = tmp_path / "verdicts.jsonl"
    assert import_file(download, store)["added"] == 1
    assert json.loads(store.read_text())["left"]["source_index"] == 1


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
    """Make a small cluster of places around a town centre.

    Args:
        prefix: Town name used to label the places.
        lat: Centre latitude.
        lon: Centre longitude.
        n: Number of places.

    Returns:
        Source rows for the places.
    """
    return [_row(f"{prefix} Hall {i}", lat + 0.002 * i, lon + 0.002 * i, address=f"{i} {prefix} St") for i in range(n)]


def _typo_files():
    """Make matching rows with and without a latitude typo.

    Returns:
        The correct rows followed by a copy with one incorrect latitude.
    """
    good = _town("Northam", -31.656, 116.671) + _town("York", -31.888, 116.770)
    typo = [dict(r) for r in good]
    typo[0]["lat"] = "-32.656000"  # latitude off by one degree, far from every other place
    return good, typo


def test_suggested_fix_when_new_file_has_the_typo(tmp_path):
    good, typo = _typo_files()
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
    good, typo = _typo_files()
    (tmp_path / "data").mkdir()
    old = _write(tmp_path / "data" / "20260101 a.csv", typo)
    new = _write(tmp_path / "data" / "20260102 b.csv", good)
    d = json.loads((run_pair(old, new, tmp_path / "e" / "diffs", matcher="rapidfuzz") / "diff-rapidfuzz.json").read_text())
    (fix,) = [f for f in d["suggested_fixes"] if f["kind"] == "coordinates"]
    assert fix["no_fix_needed"] and fix["fix"] is None


def test_coordinate_fix_respects_existing_loader_correction(tmp_path):
    config = {"fix_data_issues": [
        {"field": "name", "value": "Hall", "overwrite": [{"field": "lat", "value": "-33.2"}]}
    ]}
    (tmp_path / "config.json").write_text(json.dumps(config))
    old = _write(tmp_path / "20260101.csv", [_row("Hall", -33, 151)])
    new = _write(tmp_path / "20260102.csv", [_row("Hall", -34, 151)])

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    fixes = json.loads((folder / "diff-rapidfuzz.json").read_text())["suggested_fixes"]
    fix = next(f for f in fixes if f["kind"] == "coordinates")
    assert fix["fix"] is None
    assert fix["no_fix_needed"]


@pytest.mark.parametrize("old_lat, expected", [("-33.2", -33.2), ("invalid", None)])
def test_coordinate_fix_uses_and_validates_loaded_old_coordinates(tmp_path, old_lat, expected):
    config = {"fix_data_issues": [
        {"field": "wheelchair_access", "value": "Assisted", "overwrite": [{"field": "lat", "value": old_lat}]}
    ]}
    (tmp_path / "config.json").write_text(json.dumps(config))
    old = _write(tmp_path / "20260101.csv", [_row("Hall", -33, 151, access="Assisted")])
    new = _write(tmp_path / "20260102.csv", [_row("Hall", -34, 151)])

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    fixes = json.loads((folder / "diff-rapidfuzz.json").read_text())["suggested_fixes"]
    fix = next(f for f in fixes if f["kind"] == "coordinates")
    if expected is None:
        assert fix["fix"] is None and fix["note"]
    else:
        assert fix["fix"]["overwrite"][0] == {"field": "lat", "value": expected}


def test_fix_fields_use_the_loaders_renamed_columns(tmp_path):
    good, typo = _typo_files()
    renamed = lambda rows: [{"PPName": r["name"], "premises": r["premises"], "address": r["address"], "Lat": r["lat"], "Long": r["lon"]} for r in rows]
    election = tmp_path / "fed"
    (election / "data").mkdir(parents=True)
    (election / "config.json").write_text(json.dumps({"rename_columns": {"PPName": "name", "Lat": "lat", "Long": "lon"}}))
    def write(path, rows):
        """Write rows using the renamed source columns.

        Args:
            path: Destination file.
            rows: Source rows to write.

        Returns:
            The destination path.
        """
        with open(path, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=["PPName", "premises", "address", "Lat", "Long"])
            w.writeheader()
            w.writerows(rows)
        return path
    old = write(election / "data" / "20260101 a.csv", renamed(good))
    new = write(election / "data" / "20260102 b.csv", renamed(typo))
    d = json.loads((run_pair(old, new, election / "diffs", matcher="rapidfuzz") / "diff-rapidfuzz.json").read_text())
    (fix,) = [f for f in d["suggested_fixes"] if f["kind"] == "coordinates"]
    assert fix["fix"]["field"] == "name" and [o["field"] for o in fix["fix"]["overwrite"]] == ["lat", "lon"]


def test_suggested_fix_selector_uses_loader_cleaned_name(tmp_path):
    good, typo = _typo_files()
    typo[0]["name"] += " Polling Place"
    election = tmp_path / "fed"
    (election / "data").mkdir(parents=True)
    (election / "config.json").write_text(json.dumps({
        "cleaning_regexes": [{"field": "name", "regex": "^(?P<main>.+) Polling Place$"}],
    }))
    old = _write(election / "data" / "20260101 a.csv", good)
    new = _write(election / "data" / "20260102 b.csv", typo)

    d = json.loads((run_pair(old, new, election / "diffs", matcher="rapidfuzz") / "diff-rapidfuzz.json").read_text())

    (fix,) = [f for f in d["suggested_fixes"] if f["kind"] == "coordinates"]
    assert fix["fix"]["field"] == "name"
    assert fix["fix"]["value"] == "Northam Hall 0"
    assert fix["fix"]["value"] != typo[0]["name"]


def test_blank_suggestion_keeps_field_when_loader_filters_out_its_row(pair):
    root, old, new = pair
    with open(new, newline="") as f:
        rows = list(csv.DictReader(f))
    gamma = next(row for row in rows if row["name"] == "Gamma Church")
    gamma["address"] = ""
    # Keep the place confidently linked so the blank-field check includes it.
    gamma["lat"], gamma["lon"] = "-33.200000", "151.200000"
    new = _write(root / "data" / "20260109 places.csv", rows)
    (root / "config.json").write_text(json.dumps(
        {"filters": [{"type": "is_exactly", "column": "name", "matches": ["Alpha Hall", "Beta School", "Epsilon Centre"]}]}
    ))

    target = run_pair(old, new, root / "diffs-filtered", matcher="rapidfuzz")
    d = json.loads((target / "diff-rapidfuzz.json").read_text())

    (fix,) = [f for f in d["suggested_fixes"] if f["kind"] == "blank"]
    assert fix["fix"] is None
    assert fix["field"] == "address"


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


@pytest.mark.parametrize("bad_review", [None, [], "ticks"])
def test_review_import_rejects_missing_or_invalid_ticks_without_overwriting(pair, tmp_path, bad_review):
    from ppdiff.reviewed import import_reviewed

    root, old, new = pair
    target = run_pair(old, new, root / "diffs", matcher="rapidfuzz")
    link = json.loads((target / "link.json").read_text())
    saved = target / "reviewed.json"
    saved.write_text(json.dumps({"reviewed": {"added-1": "x"}}))
    data = {"old_sha256": link["left"]["sha256"], "new_sha256": link["right"]["sha256"]}
    if bad_review is not None:
        data["reviewed"] = bad_review
    download = tmp_path / "download.json"
    download.write_text(json.dumps(data))

    with pytest.raises(ValueError, match="reviewed"):
        import_reviewed(download, target.parent)
    assert json.loads(saved.read_text())["reviewed"] == {"added-1": "x"}

    download.write_text(json.dumps({**data, "reviewed": {}}))
    import_reviewed(download, target.parent)
    assert json.loads(saved.read_text())["reviewed"] == {}


def test_report_rebuild_checks_relative_inputs_from_another_directory(pair, monkeypatch):
    from ppdiff.run import check_inputs_unchanged

    root, old, new = pair
    monkeypatch.chdir(root)
    target = run_pair(old.relative_to(root), new.relative_to(root), Path("diffs"), matcher="rapidfuzz")
    monkeypatch.chdir(root / "data")
    check_inputs_unchanged(root / target)
    new.write_text(new.read_text() + "\n")
    with pytest.raises(RuntimeError, match="has changed"):
        check_inputs_unchanged(root / target)


def test_legacy_relative_inputs_that_cannot_be_resolved_are_not_silently_skipped(pair, monkeypatch):
    from ppdiff.run import check_inputs_unchanged

    root, old, new = pair
    monkeypatch.chdir(root)
    target = run_pair(old.relative_to(root), new.relative_to(root), Path("diffs"), matcher="rapidfuzz")
    link_path = target / "link.json"
    link = json.loads(link_path.read_text())
    for side in ("left", "right"):
        link[side].pop("path_from_report", None)
    link_path.write_text(json.dumps(link))
    monkeypatch.chdir(root / "data")
    with pytest.raises(RuntimeError, match="re-run the diff"):
        check_inputs_unchanged(root / target)


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
        """Write rows using the loader test's source columns.

        Args:
            path: Destination file.
            rows: Source rows to write.

        Returns:
            The destination path.
        """
        with open(path, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=hdr)
            w.writeheader()
            w.writerows(rows)
        return path

    def row(name, lat, lon, access="Full", address="1 Main St"):
        """Make a row with the loader test's source column names.

        Args:
            name: Place name.
            lat: Latitude.
            lon: Longitude.
            access: Wheelchair access description.
            address: Street address.

        Returns:
            A row using the loader test's source columns.
        """
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


def test_missing_old_loader_column_reports_diagnostic_and_keeps_raw_diff(tmp_path):
    old = _write(tmp_path / "20260101.csv", [_row("Hall", -33, 151, address="Old")])
    new = tmp_path / "20260102.csv"
    new.write_text("name,premises,address,lat,lon,wheelchair_access,new_column\nHall,,,-33,151,Full,x\n")
    (tmp_path / "config.json").write_text(json.dumps({"rename_columns": {"new_column": "extra"}}))

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    diff = json.loads((folder / "diff-rapidfuzz.json").read_text())
    assert "new_column" in diff["columns"]["added"]
    assert any("new_column" in error and "20260101.csv" in error for error in diff["loader"]["transformation_errors"])
    fix = next(f for f in diff["suggested_fixes"] if f.get("field") == "address")
    assert fix["fix"] is None
    assert "new_column" in (folder / "report.html").read_text()


def test_missing_new_loader_column_marks_checks_unavailable(tmp_path):
    old = _write(tmp_path / "20260101.csv", [_row("Hall", -33, 151)])
    new = _write(tmp_path / "20260102.csv", [_row("Hall", -33, 151)])
    (tmp_path / "config.json").write_text(json.dumps({"rename_columns": {"missing": "other"}}))

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    loader = json.loads((folder / "diff-rapidfuzz.json").read_text())["loader"]
    assert loader["audit_unavailable"] and loader["load_unavailable"]
    assert len(loader["transformation_errors"]) == 2
    assert all("missing" in error for error in loader["transformation_errors"])


@pytest.mark.parametrize(("geocoding", "lat", "expected"), [
    (False, "", True), (False, "0", True), (False, "-33", False), (True, "", False), ("yes", "", True),
])
def test_loader_reports_places_skipped_without_geocoding(tmp_path, geocoding, lat, expected):
    old = _write(tmp_path / "20260101.csv", [_row("Hall", -33, 151)])
    new = _write(tmp_path / "20260102.csv", [{**_row("Hall", -33, 151), "lat": lat}])
    (tmp_path / "config.json").write_text(json.dumps({
        "add_columns": {"state": "NSW"}, "geocoding": {"enabled": geocoding},
    }))

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    diff = json.loads((folder / "diff-rapidfuzz.json").read_text())
    skipped = diff["loader"]["skipped"]
    assert bool(skipped) is expected
    if expected:
        assert skipped[0]["name"] == "Hall"
        assert "geocoding" in skipped[0]["problems"][0]


def test_config_fix_review_identity_changes_when_config_is_reordered(pair, tmp_path):
    from ppdiff.reviewed import import_reviewed

    root, old, new = pair
    fixes = [
        {"field": "name", "value": "Alpha Hall", "overwrite": [{"field": "address", "value": "2 Main St"}]},
        {"field": "name", "value": "Alpha Hall", "overwrite": [{"field": "wheelchair_access", "value": "Assisted"}]},
    ]
    config = root / "config.json"
    config.write_text(json.dumps({"fix_data_issues": fixes}))
    target = run_pair(old, new, root / "diffs", matcher="rapidfuzz")
    data = json.loads((target / "report.html").read_text().split('id="data">', 1)[1].split("</script>", 1)[0])
    original_key = data["diffs"][0]["loader"]["fix_audit"][0]["review_key"]
    download = tmp_path / "review.json"
    download.write_text(json.dumps({
        "old_sha256": data["diffs"][0]["old"]["sha256"], "new_sha256": data["diffs"][0]["new"]["sha256"],
        "reviewed": {original_key: "tick", "cfgfix-1": "legacy"},
    }))
    import_reviewed(download, target.parent)
    config.write_text(json.dumps({"fix_data_issues": fixes[::-1]}))

    run_pair(old, new, root / "diffs", matcher="rapidfuzz")
    data = json.loads((target / "report.html").read_text().split('id="data">', 1)[1].split("</script>", 1)[0])
    new_keys = [fix["review_key"] for fix in data["diffs"][0]["loader"]["fix_audit"]]
    assert original_key not in new_keys
    assert data["reviewed"]["cfgfix-1"] == "legacy"


def test_duplicate_config_fixes_have_distinct_review_keys(pair):
    root, old, new = pair
    fix = {"field": "name", "value": "Alpha Hall", "overwrite": [{"field": "address", "value": "2 Main St"}]}
    (root / "config.json").write_text(json.dumps({"fix_data_issues": [fix, fix]}))
    target = run_pair(old, new, root / "diffs", matcher="rapidfuzz")
    data = json.loads((target / "report.html").read_text().split('id="data">', 1)[1].split("</script>", 1)[0])
    keys = [entry["review_key"] for entry in data["diffs"][0]["loader"]["fix_audit"]]
    assert len(set(keys)) == 2


def test_missing_address_component_keeps_raw_report_and_marks_checks_unavailable(tmp_path):
    old = tmp_path / "20260101.csv"
    new = tmp_path / "20260102.csv"
    old.write_text("name,street,postcode,lat,lon,wheelchair_access\nHall,Main,2000,-33,151,Full\n")
    new.write_text("name,street,lat,lon,wheelchair_access\nHall,Main,-33,151,\n")
    (tmp_path / "config.json").write_text(json.dumps({
        "address_fields": ["street", "postcode"],
        "address_format": "{street} {postcode}",
        "add_columns": {"state": "NSW"},
    }))

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    diff = json.loads((folder / "diff-rapidfuzz.json").read_text())
    assert diff["loader"]["load_unavailable"]
    assert any("postcode" in error for error in diff["loader"]["transformation_errors"])
    assert diff["changed"]
    assert diff["suggested_fixes"]
    assert all(fix["fix"] is None for fix in diff["suggested_fixes"])
    assert (folder / "report.html").exists()


def test_suggested_fix_validation_reports_missing_address_component():
    from ppdiff.loader_check import suggested_fix_problems

    row = {"name": "Hall", "street": "Main", "lat": "-33", "lon": "151", "wheelchair_access": "Full"}
    fix = {"field": "name", "value": "Hall", "overwrite": [{"field": "lat", "value": "-34"}]}
    config = {"address_fields": ["street", "postcode"], "address_format": "{street} {postcode}"}

    problems = suggested_fix_problems(fix, [row], config)
    assert any("postcode" in problem for problem in problems)


def test_report_disables_copy_all_when_one_fix_changes_another_selector(pair):
    from ppdiff.report import write_report

    root, old, new = pair
    target = run_pair(old, new, root / "diffs", matcher="rapidfuzz")
    diff_path = target / "diff-rapidfuzz.json"
    diff = json.loads(diff_path.read_text())
    access = {"field": "name", "value": "", "overwrite": [{"field": "wheelchair_access", "value": "Full"}]}
    name = {"field": "name", "value": "", "overwrite": [{"field": "name", "value": "Hall"}]}
    diff["suggested_fixes"] = [{"fix": name}, {"fix": access}]
    diff_path.write_text(json.dumps(diff))

    data = json.loads(write_report(target).read_text().split('id="data">', 1)[1].split("</script>", 1)[0])
    assert data["diffs"][0]["copy_all_conflict"]
    assert [item["fix"] for item in data["diffs"][0]["suggested_fixes"]] == [name, access]

    diff["suggested_fixes"] = [{"fix": access}, {"fix": {**access, "overwrite": [{"field": "lat", "value": "-33"}]}}]
    diff_path.write_text(json.dumps(diff))
    data = json.loads(write_report(target).read_text().split('id="data">', 1)[1].split("</script>", 1)[0])
    assert not data["diffs"][0]["copy_all_conflict"]


@pytest.mark.parametrize("relative_output", [True, False])
def test_review_import_accepts_relative_output_and_dot_collection(pair, monkeypatch, relative_output):
    from ppdiff.reviewed import import_reviewed

    root, old, new = pair
    monkeypatch.chdir(root)
    out = Path("diffs") if relative_output else root / "diffs"
    target = run_pair(old, new, out, matcher="rapidfuzz")
    data = json.loads((target / "report.html").read_text().split('id="data">', 1)[1].split("</script>", 1)[0])
    assert data["pair"]["election"] == root.name
    download = root / "review.json"
    download.write_text(json.dumps({
        "pair": data["pair"], "old_sha256": data["diffs"][0]["old"]["sha256"],
        "new_sha256": data["diffs"][0]["new"]["sha256"], "reviewed": {"added-1": "tick"},
    }))
    expected_target = target.resolve()
    monkeypatch.chdir(root / "diffs")
    folder, _ = import_reviewed(download, Path("."))
    assert folder.resolve() == expected_target
    assert json.loads((folder / "reviewed.json").read_text())["reviewed"] == {"added-1": "tick"}


def test_series_builds_index_once_and_single_run_still_builds_it(pair, monkeypatch):
    from ppdiff.cli import main
    import ppdiff.run as run_module

    root, old, new = pair
    _write(root / "data" / "20260115 places.csv", [_row("Alpha Hall", -33, 151)])
    calls = []
    write_index = run_module.write_index

    def count_index(out_dir):
        calls.append(out_dir)
        return write_index(out_dir)

    monkeypatch.setattr(run_module, "write_index", count_index)
    monkeypatch.setattr("ppdiff.cli.write_index", count_index)
    out = root / "diffs"
    assert main(["series", str(root / "data" / "*.csv"), "--out-dir", str(out), "--matcher", "rapidfuzz"]) == 0
    assert calls == [out]
    assert (out / "index.html").exists()
    calls.clear()
    assert main(["run", str(old), str(new), "--out-dir", str(out), "--matcher", "rapidfuzz"]) == 0
    assert calls == [out]


def test_series_rebuilds_index_for_completed_pairs_when_later_pair_fails(pair, monkeypatch):
    from ppdiff.cli import main
    import ppdiff.cli as cli

    root, _, _ = pair
    _write(root / "data" / "20260115 places.csv", [_row("Alpha Hall", -33, 151)])
    run = cli._run
    calls = 0

    def fail_second(*args, **kwargs):
        nonlocal calls
        calls += 1
        if calls == 2:
            raise RuntimeError("test failure")
        return run(*args, **kwargs)

    monkeypatch.setattr(cli, "_run", fail_second)
    out = root / "diffs"
    with pytest.raises(RuntimeError, match="test failure"):
        main(["series", str(root / "data" / "*.csv"), "--out-dir", str(out), "--matcher", "rapidfuzz"])
    data = json.loads((out / "index.html").read_text().split('id="data">', 1)[1].split("</script>", 1)[0])
    assert len(data["pairs"]) == 1


@pytest.mark.parametrize("value", ["NaN", "inf", "-Infinity"])
@pytest.mark.parametrize("axis", ["lat", "lon"])
def test_nonfinite_coordinates_are_missing_and_reports_remain_valid(tmp_path, value, axis):
    old_row = _row("Hall", -33, 151)
    new_row = {**old_row, axis: value}
    old = _write(tmp_path / "20260101.csv", [old_row])
    new = _write(tmp_path / "20260102.csv", [new_row])

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    diff = json.loads((folder / "diff-rapidfuzz.json").read_text())
    assert diff["changed"][0]["location"]["new"] == [None, None]
    assert diff["changed"][0]["location"]["note"] == "coordinates removed"
    for html in (folder / "report.html", folder.parent / "index.html"):
        embedded = html.read_text().split('id="data">', 1)[1].split("</script>", 1)[0]
        json.loads(embedded, parse_constant=lambda value: pytest.fail(f"Invalid JSON number: {value}"))


def test_embedded_json_rejects_nonfinite_numbers():
    from ppdiff.html_utils import embed_json

    with pytest.raises(ValueError, match="JSON compliant"):
        embed_json({"value": float("nan")})


def test_nonfinite_coordinates_are_safe_for_blocked_matching():
    from linkage.matchers.rapidfuzz_lsa import RapidfuzzMatcher

    row = _row("Hall", -33, 151)
    left = _ds([{**row, "lat": "NaN"}])
    right = _ds([row])
    assert RapidfuzzMatcher(all_pairs_limit=0).candidates(left, right, [0], [0]) == {(0, 0)}


@pytest.mark.parametrize(("kind", "field"), [("blank", "address"), ("coordinates", "lat")])
def test_suggested_fixes_do_not_overwrite_loader_extras(tmp_path, kind, field):
    election = tmp_path / "election"
    election.mkdir()
    old_rows, new_rows = _typo_files()
    if kind == "blank":
        new_rows[0]["lat"] = old_rows[0]["lat"]
        new_rows[0]["address"] = ""
    (election / "config.json").write_text(json.dumps({"extras": {"fields": [field]}}))
    old = _write(election / "20260101.csv", old_rows)
    new = _write(election / "20260102.csv", new_rows)

    folder = run_pair(old, new, election / "diffs", matcher="rapidfuzz")
    fixes = json.loads((folder / "diff-rapidfuzz.json").read_text())["suggested_fixes"]
    fix = next(f for f in fixes if f["kind"] == kind and f["new_index"] == 0)
    assert fix["fix"] is None
    assert field in fix["note"]


def test_blank_fix_uses_value_after_existing_loader_fixes(tmp_path):
    from linkage.records import load_csv
    from ppdiff.loader_check import as_loaded

    config = {
        "fix_data_issues": [
            {"field": "wheelchair_access", "value": "Assistance",
             "overwrite": [{"field": "wheelchair_access", "value": "Assisted"}]},
        ]
    }
    (tmp_path / "config.json").write_text(json.dumps(config))
    old = _write(tmp_path / "20260101.csv", [_row("Hall", -33, 151, access="Assistance")])
    new = _write(tmp_path / "20260102.csv", [_row("Hall", -33, 151, access="")])

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    fixes = json.loads((folder / "diff-rapidfuzz.json").read_text())["suggested_fixes"]
    fix = next(f for f in fixes if f.get("field") == "wheelchair_access")
    assert fix["fix"]["overwrite"] == [{"field": "wheelchair_access", "value": "Assisted"}]
    loaded, errors = as_loaded(load_csv(new), {**config, "fix_data_issues": [*config["fix_data_issues"], fix["fix"]]}, True)
    assert not errors
    assert loaded[0]["wheelchair_access"] == "Assisted"


def test_blank_fix_selector_uses_name_after_existing_loader_fixes(tmp_path):
    config = {
        "fix_data_issues": [
            {"field": "name", "value": "Hall",
             "overwrite": [{"field": "name", "value": "Corrected Hall"}]},
        ]
    }
    (tmp_path / "config.json").write_text(json.dumps(config))
    old = _write(tmp_path / "20260101.csv", [_row("Hall", -33, 151)])
    new = _write(tmp_path / "20260102.csv", [_row("Hall", -33, 151, address="")])

    folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
    fixes = json.loads((folder / "diff-rapidfuzz.json").read_text())["suggested_fixes"]
    fix = next(f for f in fixes if f.get("field") == "address")
    assert fix["fix"]["value"] == "Corrected Hall"


def test_blank_fix_is_withheld_when_loaded_old_value_is_invalid_or_filtered(tmp_path):
    old = _write(tmp_path / "20260101.csv", [_row("Hall", -33, 151, access="Invalid")])
    new = _write(tmp_path / "20260102.csv", [_row("Hall", -33, 151, access="")])

    for config in ({}, {"filters": [{"type": "is_exactly", "column": "wheelchair_access", "matches": [""]}]}):
        (tmp_path / "config.json").write_text(json.dumps(config))
        folder = run_pair(old, new, tmp_path / "diffs", matcher="rapidfuzz")
        fixes = json.loads((folder / "diff-rapidfuzz.json").read_text())["suggested_fixes"]
        fix = next(f for f in fixes if f.get("field") == "wheelchair_access")
        assert fix["fix"] is None
        assert fix["note"]


def test_ambiguous_review_import_requires_pair_identity(pair, tmp_path):
    from ppdiff.reviewed import import_reviewed

    root, old, new = pair
    target = run_pair(old, new, root / "diffs", matcher="rapidfuzz")
    link = json.loads((target / "link.json").read_text())
    duplicate = target.parent / "another-pair"
    duplicate.mkdir()
    (duplicate / "link.json").write_text(json.dumps(link))
    download = tmp_path / "review.json"
    data = {"old_sha256": link["left"]["sha256"], "new_sha256": link["right"]["sha256"], "reviewed": {"added-1": "x"}}
    download.write_text(json.dumps(data))
    with pytest.raises(ValueError, match="multiple reports"):
        import_reviewed(download, target.parent)
    assert not (target / "reviewed.json").exists()
    assert not (duplicate / "reviewed.json").exists()

    data["pair"] = {"election": root.name, "collection": "diffs", "folder": target.name}
    download.write_text(json.dumps(data))
    assert import_reviewed(download, target.parent)[0] == target
    assert not (duplicate / "reviewed.json").exists()
    data["pair"]["election"] = "another-election"
    download.write_text(json.dumps(data))
    with pytest.raises(ValueError, match="different election"):
        import_reviewed(download, target.parent)


def test_series_and_index_use_scrape_dates_and_keep_history_in_order(tmp_path):
    from ppdiff.index import history, pair_folders

    paths = []
    for day, access in [("31-08-2026", "None"), ("01-09-2026", "Assisted"), ("02-09-2026", "Full")]:
        paths.append(_write(tmp_path / f"places-{day}.csv", [_row("Hall", -33, 151, access=access)]))
    assert series(str(tmp_path / "*.csv")) == list(zip(paths, paths[1:]))
    out = tmp_path / "diffs"
    for old, new in zip(paths, paths[1:]):
        run_pair(old, new, out, matcher="rapidfuzz")
    folders = pair_folders(out)
    assert [json.loads((p / "link.json").read_text())["left"]["path"] for p in folders] == [str(p) for p in paths[:-1]]
    assert [e["text"] for e in history(folders, "rapidfuzz")[0]["events"]] == [
        "wheelchair_access (improved)", "wheelchair_access (improved)",
    ]


def test_series_rejects_mixed_dated_and_undated_files(tmp_path):
    (tmp_path / "20260101.csv").touch()
    (tmp_path / "latest.csv").touch()
    with pytest.raises(ValueError, match="dated and undated"):
        series(str(tmp_path / "*.csv"))


def test_series_uses_filename_order_for_undated_and_same_date_files(tmp_path):
    a = tmp_path / "a.csv"
    b = tmp_path / "b.csv"
    a.touch()
    b.touch()
    assert series(str(tmp_path / "*.csv")) == [(a, b)]
    a.unlink()
    b.unlink()
    a = tmp_path / "20260101_a.csv"
    b = tmp_path / "20260101_b.csv"
    a.touch()
    b.touch()
    assert series(str(tmp_path / "*.csv")) == [(a, b)]
