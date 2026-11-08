import csv
import importlib.util
import json
import subprocess
import sys
from pathlib import Path
from types import ModuleType

import pytest

ROOT = Path(__file__).resolve().parents[2]
DOMESTIC_FILE = "prdelms.gaz.statics.220521.09.00.01_cleaned"
OVERSEAS_FILE = "overseas_polling_places_2022"


def write_csv(path, fieldnames, rows):
    with path.open("w", newline="", encoding="utf-8") as target:
        writer = csv.DictWriter(target, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def test_federal_2022_merge_uses_the_cleaned_input(tmp_path):
    data = tmp_path / "data"
    data.mkdir()
    write_csv(
        data / f"{DOMESTIC_FILE}.csv",
        ["id", "name"],
        [{"id": "1", "name": "Local"}],
    )
    write_csv(
        data / f"{OVERSEAS_FILE}.csv",
        ["id", "name", "booth_info"],
        [{"id": "2", "name": "Overseas", "booth_info": "Embassy"}],
    )

    subprocess.run(
        [sys.executable, ROOT / "scrapers/federal_2022/merge_overseas.py"],
        cwd=tmp_path,
        check=True,
        capture_output=True,
        text=True,
    )

    with (data / f"{DOMESTIC_FILE}_merged_overseas.csv").open(
        newline="", encoding="utf-8"
    ) as source:
        rows = list(csv.DictReader(source))
    assert rows == [
        {"id": "1", "name": "Local", "booth_info": ""},
        {"id": "2", "name": "Overseas", "booth_info": "Embassy"},
    ]


def test_federal_2022_merge_rejects_mismatched_headers(tmp_path):
    data = tmp_path / "data"
    data.mkdir()
    write_csv(data / f"{DOMESTIC_FILE}.csv", ["id"], [{"id": "1"}])
    write_csv(
        data / f"{OVERSEAS_FILE}.csv",
        ["id", "name", "booth_info"],
        [{"id": "2", "name": "Overseas", "booth_info": "Embassy"}],
    )

    result = subprocess.run(
        [sys.executable, ROOT / "scrapers/federal_2022/merge_overseas.py"],
        cwd=tmp_path,
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert (
        "ValueError: The two polling place files should be identical" in result.stderr
    )
    assert not (data / f"{DOMESTIC_FILE}_merged_overseas.csv").exists()


def test_historical_experiment_can_be_imported_without_running_main(tmp_path):
    diff = tmp_path / "diff.txt"
    diff.write_text(
        "PPId 123 (Example): Mismatch ->\nName: 'Before' != 'After'\n",
        encoding="utf-8",
    )
    source = tmp_path / "source.csv"
    source.write_bytes(b"\xef\xbb\xbfPPId,Name\n123,Example\n")
    code = """
import sys

for name in ("key_experiment", "within", "cross", "historical"):
    sys.path.insert(0, sys.argv[1])
    __import__(name)

import historical
import cross

assert historical.parse(sys.argv[2]) == {"123": {"Name": ("Before", "After")}}
assert historical.read_raw(sys.argv[3]) == (
    ["PPId", "Name"], [{"PPId": "123", "Name": "Example"}]
)
calls = []
cross.latest = lambda name: (name, f"{name}.csv")
cross.pair = lambda label, a, b, truth: calls.append((label, a, b, truth))
cross.fallback_report = lambda label, a, b, strategy: None
cross.series("series", ["one", "two", "three"], truth=True)
assert calls == [
    ("series: one.csv -> two.csv", "one", "two", True),
    ("series: two.csv -> three.csv", "two", "three", True),
]
"""
    result = subprocess.run(
        [
            sys.executable,
            "-c",
            code,
            ROOT / "docs/modernisation/experiments",
            diff,
            source,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    assert result.stdout == ""


def test_api_usage_analysis_keeps_first_and_third_party_counts(tmp_path):
    log = tmp_path / "nginx.log"
    log.write_text(
        "127.0.0.1 - - [01/May/2025:12:00:00 +0000] "
        '"GET /api/0.1/items/123 HTTP/1.1" 200 5 '
        '"https://democracysausage.org/" "Browser" "-"\n'
        "127.0.0.1 - - [01/May/2025:12:00:01 +0000] "
        '"GET /api/0.1/items/456 HTTP/1.1" 200 5 '
        '"https://example.invalid/" "ExternalAgent" "-"\n',
        encoding="utf-8",
    )

    result = subprocess.run(
        [sys.executable, ROOT / "project_cache/aws/analyse_api_usage.py", log],
        check=True,
        capture_output=True,
        text=True,
    )

    entry = next(
        line
        for line in result.stdout.splitlines()
        if line.startswith("GET /api/0.1/items/{id}")
    )
    assert entry.split()[2:4] == ["1", "1"]
    assert "ExternalAgent (1)" in entry


def test_static_snapshot_writes_points_and_booths_without_network(tmp_path):
    output = tmp_path / "snapshot"
    code = """
import io
import json
import runpy
import sys
import urllib.request

script, output = sys.argv[1:]

def fake_urlopen(request, context):
    if "/map/?" in request.full_url:
        payload = {"features": [{"id": 123}]}
    elif "/polling_places/search/?" in request.full_url:
        payload = [{"id": 123, "name": "Example"}]
    else:
        raise AssertionError(request.full_url)
    return io.BytesIO(json.dumps(payload).encode())

urllib.request.urlopen = fake_urlopen
sys.argv = [script, output]
runpy.run_path(script, run_name="__main__")
"""
    subprocess.run(
        [
            sys.executable,
            "-c",
            code,
            ROOT / "project_cache/bench/generate_static.py",
            output,
        ],
        check=True,
        capture_output=True,
        text=True,
    )

    assert json.loads((output / "points.geojson").read_text()) == {
        "features": [{"id": 123}]
    }
    assert json.loads((output / "booths/123.json").read_text()) == {
        "id": 123,
        "name": "Example",
    }


def load_script(name, path, monkeypatch):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, name, module)
    spec.loader.exec_module(module)
    return module


def test_sa_scraper_reports_malformed_polling_place_data_as_value_error(monkeypatch):
    scraper = load_script(
        "sa_2025_scraper_test", ROOT / "scrapers/sa_2025/scraper.py", monkeypatch
    )

    assert scraper.extract_polling_places("App.pollingPlaces = [];") == []
    with pytest.raises(ValueError, match="Expected App.pollingPlaces to be a list"):
        scraper.extract_polling_places("App.pollingPlaces = {};")


@pytest.mark.parametrize(
    ("name", "args"),
    [
        ("_require_str", ({"field": 1}, "field", "record")),
        ("_require_int", ({"field": True}, "field", "record")),
        ("_require_float", ({"field": None}, "field", "record")),
        ("_require_number", (True, "record")),
        ("clean_cell", (True,)),
        ("_optional_text", ({"field": 1}, "field")),
    ],
)
def test_vic_scraper_keeps_value_error_for_invalid_source_data(monkeypatch, name, args):
    monkeypatch.setitem(sys.modules, "openpyxl", ModuleType("openpyxl"))
    common = load_script(
        "vic_2026_common_test", ROOT / "scrapers/vic_2026/common.py", monkeypatch
    )

    with pytest.raises(ValueError):
        getattr(common, name)(*args)
