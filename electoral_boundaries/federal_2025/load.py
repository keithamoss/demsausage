import os

import django

# IMPORTANT: This must come before we try and load from demsausage.* or we'll get "Apps aren't loaded yet" from Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

from demsausage.app.models import ElectoralBoundaries

from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry, MultiPolygon, Polygon, WKTWriter
from django.db import transaction


def _force_2d(geom):
    """https://groups.google.com/d/msg/django-users/7c1NZ76UwRU/xEAir0dUCQAJ"""

    wkt_w = WKTWriter()
    wkt_w.outdim = 2
    geom_3d = GEOSGeometry(geom.wkt)
    temp = wkt_w.write(geom_3d)
    geom_2d = GEOSGeometry(temp)

    if geom_2d and isinstance(geom_2d, Polygon) is True:
        geom_2d = MultiPolygon(geom_2d)
    return geom_2d


loader_id = "federal_election_2025"
election_id = 58

boundaries_shp = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "data", "AUS_ELB_region.shp"
)
ds = DataSource(boundaries_shp)
lyr = ds[0]

with transaction.atomic():
    for feat in lyr:
        print(feat.get("Elect_div"))

        record = ElectoralBoundaries(
            loader_id=loader_id,
            geom=_force_2d(feat.geom),
            election_ids=[election_id],
            division_name=feat.get("Elect_div"),
            # The "State" column wasn't included in 2022 ro 2025, but I don't think we use it?
            # state=feat.get("State"),
            state="",
            extras={
                "num_ccds": feat.get("Numccds"),
                "total_pop": feat.get("Total_Popu"),
            },
        )
        record.save()
