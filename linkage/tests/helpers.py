from __future__ import annotations

from linkage.records import ColumnMap, Dataset, records_from_rows

COLUMNS = ColumnMap(
    name="name",
    premises="premises",
    address=("address",),
    lat="lat",
    lon="lon",
    divisions="divisions",
    id="id",
)


def place(id, name, premises="", address="", lat=None, lon=None, divisions=""):
    """Create a synthetic CSV row for linkage tests.

    Args:
        id: Stable source identifier.
        name: Polling-place name.
        premises: Optional premises name.
        address: Optional address.
        lat: Optional latitude.
        lon: Optional longitude.
        divisions: Optional comma-separated divisions.

    Returns:
        A dictionary shaped like a CSV row.
    """
    return {
        "id": str(id),
        "name": name,
        "premises": premises,
        "address": address,
        "lat": "" if lat is None else str(lat),
        "lon": "" if lon is None else str(lon),
        "divisions": divisions,
    }


def dataset(rows, path="test.csv") -> Dataset:
    """Create a linkage dataset from synthetic CSV-shaped rows.

    Args:
        rows: Dictionaries containing the test record fields.
        path: Optional label used to identify the synthetic dataset.

    Returns:
        A loaded dataset ready for matcher tests.
    """
    return Dataset(path=path, columns=COLUMNS, records=records_from_rows(rows, COLUMNS))
