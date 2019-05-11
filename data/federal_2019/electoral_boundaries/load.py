import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

from django.db import transaction
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import Polygon, MultiPolygon, GEOSGeometry, WKTWriter

from demsausage.app.models import ElectoralBoundaries


def _force_2d(geom):
    """ https://groups.google.com/d/msg/django-users/7c1NZ76UwRU/xEAir0dUCQAJ """

    wkt_w = WKTWriter()
    wkt_w.outdim = 2
    geom_3d = GEOSGeometry(geom.wkt)
    temp = wkt_w.write(geom_3d)
    geom_2d = GEOSGeometry(temp)

    if geom_2d and isinstance(geom_2d, Polygon) is True:
        geom_2d = MultiPolygon(geom_2d)
    return geom_2d


loader_id = "federal_election_2019"

boundaries_shp = os.path.join(os.path.dirname(os.path.realpath(__file__)), "data", "COM_ELB_region.shp")
ds = DataSource(boundaries_shp)
lyr = ds[0]

with transaction.atomic():
    for feat in lyr:
        print(feat.get("Elect_div"))

        record = ElectoralBoundaries(
            loader_id=loader_id,
            geom=_force_2d(feat.geom),
            election_ids=[27],
            division_name=feat.get("Elect_div"),
            state=feat.get("State"),
            extras={"num_ccds": feat.get("Numccds")}
        )
        record.save()
