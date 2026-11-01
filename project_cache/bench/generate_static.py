"""Snapshot the local API into a static layout: points.geojson + booths/{id}.json."""
import json, os, ssl, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = "https://public.test.democracysausage.org/api/0.1"
HOST = "127.0.0.1"
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/static/e1"
EID = 1
ctx = ssl._create_unverified_context()


def get(path):
    # Connect to the local nginx while keeping the vhost name.
    req = urllib.request.Request(BASE + path, headers={"Host": "public.test.democracysausage.org"})
    req.full_url = BASE.replace("public.test.democracysausage.org", HOST) + path
    return json.load(urllib.request.urlopen(req, context=ctx))


os.makedirs(f"{OUT}/booths", exist_ok=True)
points = get(f"/map/?election_id={EID}")
json.dump(points, open(f"{OUT}/points.geojson", "w"), separators=(",", ":"))
ids = [f["id"] for f in points["features"]]


def one(i):
    data = get(f"/polling_places/search/?election_id={EID}&ids={i}")
    json.dump(data[0] if isinstance(data, list) else data, open(f"{OUT}/booths/{i}.json", "w"), separators=(",", ":"))


with ThreadPoolExecutor(8) as ex:
    list(ex.map(one, ids))
print(len(ids), "booths written to", OUT)
