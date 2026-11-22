"""loader_rules: the loader's file rules without Django (also used by the scraper diff)."""

import subprocess
import sys
from pathlib import Path

import pytest
from django.db.models import Field

from demsausage.app.models import PollingPlaces
from demsausage.app.sausage import loader_rules
from demsausage.numbers import convert_string_to_number, is_float, is_int, is_numeric


def test_required_fields_match_the_model():
    # The loader derives these from the model in check_file_header_validity.
    derived = [
        f.name
        for f in PollingPlaces._meta.get_fields()
        if isinstance(f, Field)
        and f.blank is False
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
    config: loader_rules.SchemaConfig = {
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


def test_number_helpers_treat_none_and_objects_as_non_numeric():
    """Verify that number checks return a false result for values that cannot be numbers."""
    assert is_numeric(None) is False
    assert is_numeric([]) is False
    assert is_float("12.5") is True
    assert is_int("12") is True
    assert convert_string_to_number("12") == 12
    assert convert_string_to_number("12.5") == 12.5

    with pytest.raises(ValueError):
        convert_string_to_number("not-a-number")


@pytest.mark.parametrize(
    ("field", "rows", "columns", "expected"),
    [
        (
            "rename",
            [{"old": "value"}],
            {"old": "new"},
            [{"new": "value"}],
        ),
        (
            "add",
            [{"name": "A"}],
            {"state": "NSW"},
            [{"name": "A", "state": "NSW"}],
        ),
        (
            "exclude",
            [{"name": "A", "junk": "x"}],
            ["junk"],
            [{"name": "A"}],
        ),
    ],
)
def test_individual_schema_steps(field, rows, columns, expected):
    """Verify that the individual conversion helpers perform one focused transform.

    Args:
        field: Name of the conversion step under test.
        rows: Source rows to transform.
        columns: Rename or column configuration for the step.
        expected: Expected rows after the transformation.
    """
    transform = {
        "rename": loader_rules.rename_columns,
        "add": loader_rules.add_columns,
        "exclude": loader_rules.exclude_columns,
    }[field]
    assert transform(rows, columns) == expected


def test_apply_fixes_matches_on_string_value_and_overwrites_existing_fields_only():
    rows = [{"ec_id": 7, "lat": "1"}, {"ec_id": 8, "lat": "2"}]
    fixes: list[loader_rules.FixRule] = [
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
    assert loader_rules.row_problems({**good, "lat": "", "lon": "  "}) == []


@pytest.mark.parametrize("field", ["lat", "lon"])
def test_row_problems_rejects_null_coordinate(field):
    """Report a null coordinate rather than treating it as a geocodable blank.

    Args:
        field: Coordinate field to set to None.
    """
    row = {
        "name": "A",
        "address": "1 St",
        "state": "NSW",
        "wheelchair_access": "Full",
        "lat": "-33.1",
        "lon": "151.2",
        field: None,
    }

    assert loader_rules.row_problems(row) == [f"{field} None isn't a valid coordinate"]
    del row[field]
    assert loader_rules.row_problems(row) == [f"missing field {field!r}"]


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("lat", -90),
        ("lat", 90),
        ("lon", -180),
        ("lon", 180),
    ],
)
def test_row_problems_accepts_coordinate_endpoints(field, value):
    """Verify that the minimum and maximum accepted coordinates are valid.

    Args:
        field: Coordinate field to test, either ``lat`` or ``lon``.
        value: Boundary value to assign to the coordinate field.
    """
    row = {
        "name": "A",
        "address": "1 St",
        "state": "NSW",
        "wheelchair_access": "Full",
        "lat": "-33.1",
        "lon": "151.2",
        field: value,
    }

    assert loader_rules.row_problems(row) == []


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("lat", -90.0001),
        ("lat", 90.0001),
        ("lon", -180.0001),
        ("lon", 180.0001),
        ("lat", float("nan")),
        ("lon", float("inf")),
        ("lon", float("-inf")),
        pytest.param("lat", 10**400, id="oversized-latitude"),
        pytest.param("lon", -(10**400), id="oversized-longitude"),
    ],
)
def test_row_problems_rejects_out_of_range_and_non_finite_coordinates(field, value):
    """Verify that invalid or non-finite coordinate values are reported.

    Args:
        field: Coordinate field to test, either ``lat`` or ``lon``.
        value: Out-of-range or non-finite value to assign to the field.
    """
    row = {
        "name": "A",
        "address": "1 St",
        "state": "NSW",
        "wheelchair_access": "Full",
        "lat": "-33.1",
        "lon": "151.2",
        field: value,
    }

    problems = loader_rules.row_problems(row)

    assert any(
        problem.startswith(f"{field} {value!r} isn't a valid coordinate")
        for problem in problems
    )


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


@pytest.mark.parametrize(
    ("row", "error"),
    [
        ({"postcode": "5000"}, "Missing address field 'street'"),
        ({"street": None, "postcode": "5000"}, "Address field 'street' is None"),
    ],
)
def test_merge_address_rejects_missing_or_null_fields(row, error):
    """Reject missing or null address fields instead of creating a partial address.

    Args:
        row: Address components with a missing or null street.
        error: Expected error message explaining the problem.
    """
    with pytest.raises(ValueError, match=error):
        loader_rules.merge_address(row, ["street", "postcode"], "{street}, {postcode}")


def test_merge_divisions():
    assert loader_rules.merge_divisions({"divisions": "A, B"}, None) == {
        "divisions": ["A", "B"]
    }
    assert loader_rules.merge_divisions({"d1": "A", "d2": " "}, ["d1", "d2"]) == {
        "divisions": ["A"]
    }
    row = loader_rules.merge_divisions(
        {"name": "A", "d1": "North", "d2": " "},
        ["d1", "d2"],
    )
    assert row == {"name": "A", "divisions": ["North"]}


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (None, []),
        ("", []),
        ("A, , B", ["A", "B"]),
    ],
)
def test_merge_divisions_ignores_blank_values(value, expected):
    """Treat null and empty divisions as absent, including empty list entries.

    Args:
        value: Source divisions value.
        expected: Expected list of division names.
    """
    assert loader_rules.merge_divisions({"divisions": value}, None) == {
        "divisions": expected
    }
