"""loader_rules: the loader's file rules without Django (also used by the scraper diff)."""

import subprocess
import sys
from pathlib import Path

from demsausage.app.models import PollingPlaces
from demsausage.app.sausage import loader_rules


def test_required_fields_match_the_model():
    # The loader derives these from the model in check_file_header_validity.
    derived = [
        f.name
        for f in PollingPlaces._meta.get_fields()
        if hasattr(f, "blank")
        and f.blank is False
        and hasattr(f, "null")
        and f.null is False
        and f.name not in ("geom", "election", "status")
    ] + ["lat", "lon"]
    assert tuple(derived) == loader_rules.REQUIRED_FIELDS


def test_imports_without_django():
    django_dir = Path(__file__).resolve().parents[2]
    code = (
        "import sys; import demsausage.app.sausage.loader_rules; "
        "assert 'django' not in sys.modules, sorted(m for m in sys.modules if 'django' in m)"
    )
    result = subprocess.run(
        [sys.executable, "-c", code], cwd=django_dir, capture_output=True, text=True
    )
    assert result.returncode == 0, result.stderr


def test_to_schema_runs_steps_in_the_loaders_order():
    rows = [
        {"PPName": "Alpha (Central)", "Status": "Current", "Votes": "12", "Junk": "x"},
        {"PPName": "Beta", "Status": "Abolition", "Votes": "3", "Junk": "y"},
    ]
    config = {
        "filters": [{"type": "is_exactly", "column": "Status", "matches": ["Current"]}],
        "rename_columns": {"PPName": "name"},
        "add_columns": {"state": "NSW"},
        "extras": {"fields": ["Votes"]},
        "exclude_columns": ["Junk", "Status"],
        "cleaning_regexes": [{"field": "name", "regex": r"^(?P<main>[^(]+)"}],
    }
    out, errors = loader_rules.to_schema(rows, config)
    assert errors == []
    assert out == [{"name": "Alpha", "state": "NSW", "extras": {"Votes": 12}}]


def test_regex_mismatch_is_reported():
    out, errors = loader_rules.run_regexes(
        [{"name": "Beta"}], [{"field": "name", "regex": r"^(?P<main>\d+)"}]
    )
    assert out == [{"name": "Beta"}]
    assert errors == [
        "Cleaning regex '^(?P<main>\\d+)' did not match field value 'Beta'"
    ]


def test_apply_fixes_matches_on_string_value_and_overwrites_existing_fields_only():
    rows = [{"ec_id": 7, "lat": "1"}, {"ec_id": 8, "lat": "2"}]
    fixes = [
        {
            "field": "ec_id",
            "value": "7",
            "overwrite": [{"field": "lat", "value": 9}, {"field": "nope", "value": 0}],
        }
    ]
    assert loader_rules.apply_fixes(rows, fixes) == [
        {"ec_id": 7, "lat": 9},
        {"ec_id": 8, "lat": "2"},
    ]


def test_row_problems():
    good = {
        "name": "A",
        "address": "1 St",
        "state": "NSW",
        "wheelchair_access": "Full",
        "lat": "-33.1",
        "lon": "151.2",
    }
    assert loader_rules.row_problems(good) == []
    bad = {**good, "name": " ", "wheelchair_access": "Yes", "state": "XX", "lat": "abc"}
    del bad["address"]
    problems = loader_rules.row_problems(bad)
    assert "missing field 'address'" in problems
    assert "name is blank" in problems
    assert any(p.startswith("wheelchair_access 'Yes'") for p in problems)
    assert any(p.startswith("state 'XX'") for p in problems)
    assert "lat 'abc' isn't a valid coordinate" in problems
    # Blank coordinates are left to the loader's geocoding step.
    assert loader_rules.row_problems({**good, "lat": "", "lon": ""}) == []


def test_merge_address_from_fields_and_tidies_missing_parts():
    row = {
        "name": "A",
        "address_partial": "1 Main St",
        "suburb": " ",
        "postcode": "5000",
    }
    row, ok = loader_rules.merge_address(
        row,
        ["address_partial", "suburb", "postcode"],
        "{address_partial}, {suburb}, {postcode}",
    )
    assert ok and row == {"name": "A", "address": "1 Main St, 5000"}
    kept, ok = loader_rules.merge_address({"address": "x"}, None, None)
    assert ok and kept == {"address": "x"}
    _, ok = loader_rules.merge_address({"name": "B"}, None, None)
    assert not ok


def test_merge_divisions():
    assert loader_rules.merge_divisions({"divisions": "A, B"}, None) == {
        "divisions": ["A", "B"]
    }
    assert loader_rules.merge_divisions({"d1": "A", "d2": " "}, ["d1", "d2"]) == {
        "divisions": ["A"]
    }
