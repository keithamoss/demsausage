"""Loading polling place files into a common record shape.

Every scraper and commission names its columns differently, so a ColumnMap says
which source columns hold each field. ColumnMap.detect() covers the formats in
this repo (our loader CSVs, AEC files, SA/VIC/TAS scraper outputs); anything else
can be mapped explicitly.
"""

from __future__ import annotations

import csv
import math
import re
from collections import Counter
from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass, field
from pathlib import Path

from .normalise import norm, norm_address, norm_name

# Candidate source columns for each field, in order of preference.
_NAME_COLUMNS = (
    "name",
    "PPName",
    "Polling_Place_Name",
    "Polling Place Name",
    "polling_place_name",
)
_PREMISES_COLUMNS = (
    "premises",
    "PremisesName",
    "Premise_Name",
    "Premise Name",
    "premises_name",
)
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
_LAT_COLUMNS = (
    "lat",
    "Lat",
    "latitude",
    "Latitude",
    "Premise_Latitude",
    "Premise Latitude",
)
_LON_COLUMNS = (
    "lon",
    "Long",
    "lng",
    "longitude",
    "Longitude",
    "Premise_Longitude",
    "Premise Longitude",
)
_DIVISION_COLUMNS = ("divisions", "DivName", "Division", "division", "district")
_ID_COLUMNS = ("ec_id", "PPId", "vec_venue_id", "id")
_HOURS_COLUMNS = ("opening_hours", "OpeningHours", "hours", "election_day_hours")


@dataclass(frozen=True)
class ColumnMap:
    """Describe which source CSV columns hold each polling-place field.

    Attributes:
        name: Column containing the place name.
        premises: Optional column containing the premises name.
        address: Address columns to join in source-file order.
        lat: Optional latitude column.
        lon: Optional longitude column.
        divisions: Optional division or district column.
        id: Optional stable source identifier column.
        hours: Optional opening-hours column used outside matching.
    """

    name: str
    premises: str | None = None
    address: tuple[str, ...] = ()
    lat: str | None = None
    lon: str | None = None
    divisions: str | None = None
    id: str | None = None
    #: Not used for matching; lets other tools compare hours with norm_hours.
    hours: str | None = None

    def kind_of(self, column: str) -> str:
        """Identify the normalisation kind used for a source column.

        Args:
            column: Header name to classify.

        Returns:
            ``name``, ``premises``, ``address``, ``hours``, or ``text``.
        """
        if column == self.name:
            return "name"
        if column == self.premises:
            return "premises"
        if column in self.address:
            return "address"
        if column == self.hours:
            return "hours"
        return "text"

    @classmethod
    def detect(cls, header: Sequence[str], id_column: str | None = None) -> ColumnMap:
        """Detect common Australian election CSV column names.

        Args:
            header: Column names present in the source CSV.
            id_column: Optional explicitly named stable ID column.

        Returns:
            A column map using the detected source headers.

        Raises:
            ValueError: If the name column or requested ID column is missing.
        """

        def first(options: Iterable[str]) -> str | None:
            """Select the first candidate header present in the file.

            Args:
                options: Header names in preference order.

            Returns:
                The first matching header, or ``None``.
            """
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
            hours=first(_HOURS_COLUMNS),
        )


@dataclass(frozen=True)
class Record:
    """One polling place, with raw and normalised identity fields.

    Attributes:
        index: Zero-based row position after filtering the source file.
        source_index: Zero-based CSV data-row position before filtering, excluding
            the header. Stable for this source file, even if the filter changes.
        name: Source polling-place name.
        premises: Source venue name.
        address: Joined source address fields.
        lat: Parsed latitude, or ``None`` when missing or invalid.
        lon: Parsed longitude, or ``None`` when missing or invalid.
        divisions: Normalised divisions served by the place.
        source_id: Source identifier carried through for evaluation, not matching.
        raw: Original CSV row.
        n_name: Normalised name without its own division suffix.
        n_premises: Normalised venue name.
        n_address: Normalised address without a repeated leading venue name.
    """

    index: int
    source_index: int
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
        """Compute stable normalised fields after the dataclass is initialized.

        Returns:
            None. Normalised identity fields are stored on this record.
        """
        object.__setattr__(
            self, "n_name", norm_name(_strip_own_division(self.name, self.divisions))
        )
        object.__setattr__(self, "n_premises", norm(self.premises))
        object.__setattr__(
            self,
            "n_address",
            norm_address(
                _strip_leading_place_name(self.address, self.name, self.premises)
            ),
        )

    @property
    def has_coords(self) -> bool:
        """Return whether both coordinate values are available.

        Returns:
            ``True`` when latitude and longitude are both present.
        """
        return self.lat is not None and self.lon is not None

    def label(self) -> str:
        """Describe the place briefly for reports.

        Returns:
            The name, followed by the premises in parentheses when present.
        """
        return f"{self.name} ({self.premises})" if self.premises else self.name


_TRAILING_PARENS = re.compile(r"\s*\(([^()]*)\)\s*$")


def _strip_own_division(name: str, divisions: frozenset[str]) -> str:
    """Drop a trailing "(Division)" when it names one of the record's own divisions.

    Args:
        name: Polling-place name that may end with a division in parentheses.
        divisions: Divisions associated with the record.

    Returns:
        The name with its own division suffix removed.

    Commissions label booths serving another division this way (AEC: "Allawah
    (Barton)"); it says which division the booth serves, not which place it is.
    """
    match = _TRAILING_PARENS.search(name)
    if match and norm(match.group(1)) in divisions:
        return name[: match.start()]
    return name


def _strip_leading_place_name(address: str, name: str, premises: str) -> str:
    """Drop a first comma-separated part that just repeats the place's name or premises.

    Args:
        address: Full address text.
        name: Normalisable place name.
        premises: Normalisable premises name.

    Returns:
        Address text with the repeated leading place name removed.

    Some files write "Northam Town Hall, Cnr Wellington & Gordon Streets" where
    others write "Corner Wellington & Gordon Streets".
    """
    first, sep, rest = address.partition(",")
    if sep and rest.strip() and norm(first) in {norm(name), norm(premises)} - {""}:
        return rest.strip()
    return address


def _to_float(value: str | None) -> float | None:
    """Parse a CSV coordinate while rejecting placeholders and invalid numbers.

    Args:
        value: Raw coordinate text.

    Returns:
        A finite, non-zero float, or ``None`` when the value is unusable.
    """
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError, OverflowError):
        return None
    # 0,0 is a "no coordinates" placeholder in some commission files.
    return None if number == 0 or not math.isfinite(number) else number


def _split_divisions(value: str | None) -> frozenset[str]:
    """Split and normalise a comma-separated division field.

    Args:
        value: Raw division text.

    Returns:
        A set of non-empty normalised division names.
    """
    normalised = (norm(part) for part in (value or "").split(","))
    return frozenset(part for part in normalised if part)


def records_from_rows(
    rows: Sequence[dict[str, str]], columns: ColumnMap
) -> list[Record]:
    """Convert CSV rows into normalised polling-place records.

    Args:
        rows: Row dictionaries in original source order. Use ``load_csv`` with
            ``row_filter`` when filtering a CSV while retaining source positions.
        columns: Mapping from source headers to polling-place fields.

    Returns:
        One :class:`Record` for each source row, in source order.
    """
    return [
        _record_from_row(index, row, columns, source_index=index)
        for index, row in enumerate(rows)
    ]


def _record_from_row(
    index: int, row: dict[str, str], columns: ColumnMap, source_index: int
) -> Record:
    """Parse one source row using its field mapping.

    Args:
        index: Row position after filtering the file.
        row: Source CSV fields.
        columns: Source headers mapped to place fields.
        source_index: CSV data-row position before filtering, excluding the header.

    Returns:
        A record with parsed coordinates and normalised identity fields.
    """

    def get(column: str | None) -> str:
        """Read a mapped source field.

        Args:
            column: Header to read, or ``None`` for an unmapped field.

        Returns:
            Stripped text, or empty text when absent.
        """
        return (row.get(column) or "").strip() if column else ""

    return Record(
        index=index,
        source_index=source_index,
        name=get(columns.name),
        premises=get(columns.premises),
        address=", ".join(part for part in map(get, columns.address) if part),
        lat=_to_float(get(columns.lat)),
        lon=_to_float(get(columns.lon)),
        divisions=_split_divisions(get(columns.divisions)),
        source_id=get(columns.id) or None,
        raw=dict(row),
    )


@dataclass
class Dataset:
    """A loaded file and the column map used to interpret it.

    Attributes:
        path: Source file path or synthetic dataset label.
        columns: Source headers mapped to place fields.
        records: Records in filtered source order.
    """

    path: str
    columns: ColumnMap
    records: list[Record]

    def unique_source_ids(self) -> dict[str, int]:
        """Index non-empty source IDs that occur exactly once.

        Returns:
            Mapping from usable source ID to record index.
        """
        counts = Counter(
            record.source_id for record in self.records if record.source_id
        )
        return {
            record.source_id: record.index
            for record in self.records
            if record.source_id and counts[record.source_id] == 1
        }

    def fields_present(self) -> set[str]:
        """Identify which identity fields are available for comparison.

        Returns:
            Names of fields with a value in at least one record.
        """
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
    """Load a CSV, filtering rows before assigning their indices.

    Args:
        path: UTF-8 CSV file to load.
        columns: Explicit field mapping, or ``None`` to detect source headers.
        id_column: Optional source ID column used when detecting headers.
        row_filter: Optional predicate selecting rows to retain.

    Returns:
        Parsed records with contiguous filtered indices and original source-row indices.
    """
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames or []
        rows = [
            (source_index, row)
            for source_index, row in enumerate(reader)
            if row_filter is None or row_filter(row)
        ]
    columns = columns or ColumnMap.detect(header, id_column=id_column)
    return Dataset(
        path=str(path),
        columns=columns,
        records=[
            _record_from_row(index, row, columns, source_index)
            for index, (source_index, row) in enumerate(rows)
        ],
    )
