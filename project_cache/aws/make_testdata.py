"""Build the upload tree from a snapshot made by ../bench/generate_static.py.

    python make_testdata.py /tmp/static/e1 ./testdata

Layout (E = election id):
    data/manifest.json                    pointer to the current version (short TTL)
    data/v1/eE/points.geojson             map points, uncompressed (CloudFront compresses)
    data/v1/eE/booths/{id}.json           one object per booth
    data/v1br/eE/points.geojson           same points, brotli-11 stored with Content-Encoding: br
    api/0.1/map/E.json                    legacy URL target for /api/0.1/map/?election_id=E
    api/0.1/elections/public.json         legacy URL target for /api/0.1/elections/public/
Needs: pip install brotli
"""
import json, os, shutil, sys

import brotli

src, out = sys.argv[1], sys.argv[2]
eid = 1
shutil.rmtree(out, ignore_errors=True)


def put(path, data):
    path = os.path.join(out, path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "wb").write(data)


points = open(f"{src}/points.geojson", "rb").read()
put(f"data/v1/e{eid}/points.geojson", points)
put(f"data/v1br/e{eid}/points.geojson.br", brotli.compress(points, quality=11))
put(f"api/0.1/map/{eid}.json", points)
shutil.copytree(f"{src}/booths", f"{out}/data/v1/e{eid}/booths")

put("data/manifest.json", json.dumps({"current": "v1", "elections": [eid]}).encode())
put(
    "api/0.1/elections/public.json",
    json.dumps([{"id": eid, "name": "Federal Election 2025", "short_name": "federal_2025", "is_primary": True}]).encode(),
)
print("points:", len(points), "bytes; brotli-11:", os.path.getsize(f"{out}/data/v1br/e{eid}/points.geojson.br"))
