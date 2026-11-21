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
    return Dataset(path=path, columns=COLUMNS, records=records_from_rows(rows, COLUMNS))
