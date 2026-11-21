"""Loading polling place files into a common record shape.

Every scraper and commission names its columns differently, so a ColumnMap says
which source columns hold each field. ColumnMap.detect() covers the formats in
this repo (our loader CSVs, AEC files, SA/VIC/TAS scraper outputs); anything else
can be mapped explicitly.
"""

from __future__ import annotations

import csv
import re
from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass, field
from pathlib import Path

from .normalise import norm, norm_address, norm_name

# Candidate source columns for each field, in order of preference.
_NAME_COLUMNS = ("name", "PPName", "Polling_Place_Name", "Polling Place Name", "polling_place_name")
_PREMISES_COLUMNS = ("premises", "PremisesName", "Premise_Name", "Premise Name", "premises_name")
# Every present column is joined, so put these in reading order.
_ADDRESS_COLUMNS = (
    "address",
    "address_partial",
    "Address1",
    "Address2",
    "Address3",
    "Premise_Address_Line_1",
    "Premise_Address_Line_2",
    "Address",
    "suburb",
    "Locality",
    "locality",
    "Premise_Locality",
    "City",
    "postcode",
    "Postcode",
    "Premise_Postcode",
)
_LAT_COLUMNS = ("lat", "Lat", "latitude", "Latitude", "Premise_Latitude", "Premise Latitude")
_LON_COLUMNS = ("lon", "Long", "lng", "longitude", "Longitude", "Premise_Longitude", "Premise Longitude")
_DIVISION_COLUMNS = ("divisions", "DivName", "Division", "division", "district")
_ID_COLUMNS = ("ec_id", "PPId", "vec_venue_id", "id")


@dataclass(frozen=True)
class ColumnMap:
    """Which source columns hold each field. Address columns are joined with ', '."""

    name: str
    premises: str | None = None
    address: tuple[str, ...] = ()
    lat: str | None = None
    lon: str | None = None
    divisions: str | None = None
    id: str | None = None

    @classmethod
    def detect(cls, header: Sequence[str], id_column: str | None = None) -> ColumnMap:
        def first(options: Iterable[str]) -> str | None:
            return next((c for c in options if c in header), None)

        name = first(_NAME_COLUMNS)
        if name is None:
            raise ValueError(
                f"No name column found in header {list(header)}; pass a ColumnMap explicitly"
            )
        if id_column is not None and id_column not in header:
            raise ValueError(f"ID column {id_column!r} is not in the header")
        return cls(
            name=name,
            premises=first(_PREMISES_COLUMNS),
            address=tuple(c for c in _ADDRESS_COLUMNS if c in header),
            lat=first(_LAT_COLUMNS),
            lon=first(_LON_COLUMNS),
            divisions=first(_DIVISION_COLUMNS),
            id=id_column if id_column is not None else first(_ID_COLUMNS),
        )


@dataclass(frozen=True)
class Record:
    """One polling place. `index` is its row position in the source file (0-based)."""

    index: int
    name: str
    premises: str
    address: str
    lat: float | None
    lon: float | None
    divisions: frozenset[str]
    source_id: str | None
    raw: dict[str, str] = field(compare=False, repr=False)

    # Normalised forms, computed once.
    n_name: str = field(init=False, compare=False, repr=False)
    n_premises: str = field(init=False, compare=False, repr=False)
    n_address: str = field(init=False, compare=False, repr=False)

    def __post_init__(self) -> None:
        object.__setattr__(self, "n_name", norm_name(_strip_own_division(self.name, self.divisions)))
        object.__setattr__(self, "n_premises", norm(self.premises))
        object.__setattr__(
            self, "n_address", norm_address(_strip_leading_place_name(self.address, self.name, self.premises))
        )

    @property
    def has_coords(self) -> bool:
        return self.lat is not None and self.lon is not None

    def label(self) -> str:
        """Short human description for reports."""
        return f"{self.name} ({self.premises})" if self.premises else self.name


_TRAILING_PARENS = re.compile(r"\s*\(([^()]*)\)\s*$")


def _strip_own_division(name: str, divisions: frozenset[str]) -> str:
    """Drop a trailing "(Division)" when it names one of the record's own divisions.

    Commissions label booths serving another division this way (AEC: "Allawah
    (Barton)"); it says which division the booth serves, not which place it is.
    """
    match = _TRAILING_PARENS.search(name)
    if match and norm(match.group(1)) in divisions:
        return name[: match.start()]
    return name


def _strip_leading_place_name(address: str, name: str, premises: str) -> str:
    """Drop a first comma-separated part that just repeats the place's name or premises.

    Some files write "Northam Town Hall, Cnr Wellington & Gordon Streets" where
    others write "Corner Wellington & Gordon Streets".
    """
    first, sep, rest = address.partition(",")
    if sep and rest.strip() and norm(first) in {norm(name), norm(premises)} - {""}:
        return rest.strip()
    return address


def _to_float(value: str | None) -> float | None:
    try:
        number = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
    # 0,0 is a "no coordinates" placeholder in some commission files.
    return None if number == 0 else number


def _split_divisions(value: str | None) -> frozenset[str]:
    return frozenset(norm(part) for part in (value or "").split(",") if norm(part))


def records_from_rows(
    rows: Sequence[dict[str, str]], columns: ColumnMap
) -> list[Record]:
    records = []
    for index, row in enumerate(rows):

        def get(column: str | None) -> str:
            return (row.get(column) or "").strip() if column else ""

        source_id = get(columns.id) or None
        records.append(
            Record(
                index=index,
                name=get(columns.name),
                premises=get(columns.premises),
                address=", ".join(get(c) for c in columns.address if get(c)),
                lat=_to_float(get(columns.lat)),
                lon=_to_float(get(columns.lon)),
                divisions=_split_divisions(get(columns.divisions)),
                source_id=source_id,
                raw=dict(row),
            )
        )
    return records


@dataclass
class Dataset:
    """A loaded file: its records, the column map used and where it came from."""

    path: str
    columns: ColumnMap
    records: list[Record]

    def fields_present(self) -> set[str]:
        """Fields with a value in at least one record."""
        present = set()
        for r in self.records:
            if r.n_name:
                present.add("name")
            if r.n_premises:
                present.add("premises")
            if r.n_address:
                present.add("address")
            if r.has_coords:
                present.add("geo")
            if r.divisions:
                present.add("divisions")
        return present


def load_csv(
    path: str | Path,
    columns: ColumnMap | None = None,
    id_column: str | None = None,
    row_filter: Callable[[dict[str, str]], bool] | None = None,
) -> Dataset:
    """Load a CSV. Rows failing `row_filter` are dropped before indexing."""
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames or []
        rows = [row for row in reader if row_filter is None or row_filter(row)]
    columns = columns or ColumnMap.detect(header, id_column=id_column)
    return Dataset(path=str(path), columns=columns, records=records_from_rows(rows, columns))
