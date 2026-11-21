from __future__ import annotations

import csv
import json
from pathlib import Path

import pytest

from ppdiff.core import location_change, values_equal, warnings_for
from ppdiff.run import run_pair, series

from linkage.records import ColumnMap, Dataset, records_from_rows

COLUMNS = ColumnMap(name="name", premises="premises", address=("address",), lat="lat", lon="lon")
FIELDS = ["name", "premises", "address", "lat", "lon", "wheelchair_access"]


def _ds(rows):
    return Dataset(path="x.csv", columns=COLUMNS, records=records_from_rows(rows, COLUMNS))


def _row(name, lat, lon, address="1 Main St, Town", access="Full", premises=""):
    return {"name": name, "premises": premises, "address": address, "lat": str(lat), "lon": str(lon), "wheelchair_access": access}


def _write(path: Path, rows):
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)
    return path


def test_values_equal_ignores_whitespace_and_number_formatting():
    assert values_equal(" Full ", "Full")
    assert values_equal("-30.3344050", "-30.334405")
    assert not values_equal("Full", "Assisted")
    assert not values_equal("", "0")


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
    assert d["summary"] == {"unchanged": 1, "changed": 2, "added": 1, "removed": 1, "possible_matches": 0, "warnings": 1}
    beta = next(e for e in d["changed"] if e["name"] == "Beta School")
    assert beta["changes"] == [{"field": "wheelchair_access", "old": "Assisted", "new": "Full"}]
    gamma = next(e for e in d["changed"] if e["name"] == "Gamma Church")
    assert gamma["changes"] == [] and gamma["location"]["likely_typo"] == "latitude"
    assert [e["name"] for e in d["added"]] == ["Epsilon Centre"]
    assert [e["name"] for e in d["removed"]] == ["Delta Library"]
    assert d["old"]["sha256"] and d["matcher"] == "rapidfuzz"
    html = (target / "report.html").read_text()
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
