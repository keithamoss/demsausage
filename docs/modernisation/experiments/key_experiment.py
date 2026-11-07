"""Walk snapshot CSVs oldest->newest and test candidate source_key strategies."""

import collections
import csv
import difflib
import glob
import itertools
import math
import os
import re
import sys
import unicodedata

ROOT = "/workspaces/demsausage/keithamoss/demsausage/scrapers"
SETS = {
    "sa_2025 (has IDs)": "sa_2025/data/*.csv",
    "wa_2025": "wa_2025/data/*.csv",
    "wa_2021": "wa_2021/data/*.csv",
    "qld_2024": "qld_2024/data/*.csv",
    "qld_2020": "qld_2020/data/*.csv",
    "nsw_lg_2024": "nsw_lg_2024/*.csv",
    "tas_2025": "tas_2025/data/*.csv",
    "tas_2021": "tas_2021/data/*.csv",
}


def fnum(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def load(path):
    rows = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if "Polling_Place_Name" in r:  # TAS raw
                addr = ", ".join(
                    x
                    for x in (
                        r.get("Premise_Address_Line_1"),
                        r.get("Premise_Address_Line_2"),
                        r.get("Premise_Locality"),
                    )
                    if x
                )
                d = {
                    "id": None,
                    "name": r["Polling_Place_Name"],
                    "premises": r.get("Premise_Name", ""),
                    "address": addr,
                    "lat": fnum(r.get("Premise_Latitude")),
                    "lon": fnum(r.get("Premise_Longitude")),
                    "div": r.get("Division", ""),
                    "pc": r.get("Premise_Postcode", ""),
                }
            elif "Polling Place Name" in r:  # TAS 2021 raw
                d = {
                    "id": None,
                    "name": r["Polling Place Name"],
                    "premises": r.get("Premise Name", ""),
                    "address": f"{r.get('Address', '')} {r.get('City', '')}",
                    "lat": fnum(r.get("Premise Latitude")),
                    "lon": fnum(r.get("Premise Longitude")),
                    "div": r.get("Division", ""),
                    "pc": r.get("Postcode", ""),
                }
            elif "address_partial" in r:  # SA
                d = {
                    "id": r["id"],
                    "name": r["name"],
                    "premises": r.get("premises", ""),
                    "address": f"{r.get('address_partial', '')}, {r.get('suburb', '')}",
                    "lat": fnum(r.get("lat")),
                    "lon": fnum(r.get("lon")),
                    "div": r.get("divisions", ""),
                    "pc": r.get("postcode", ""),
                }
            else:
                a = r.get("address", "")
                m = re.findall(r"\b(\d{4})\b", a)
                d = {
                    "id": r.get("ec_id") or None,
                    "name": r.get("name", ""),
                    "premises": r.get("premises", ""),
                    "address": a,
                    "lat": fnum(r.get("lat")),
                    "lon": fnum(r.get("lon")),
                    "div": r.get("divisions", ""),
                    "pc": m[-1] if m else "",
                }
            rows.append(d)
    return rows


def snapshots(pattern):
    files = glob.glob(os.path.join(ROOT, pattern))
    files.sort(key=lambda p: re.sub(r"\D", "", os.path.basename(p)))
    return [(os.path.basename(p), load(p)) for p in files]


NOISE = {
    "polling",
    "place",
    "centre",
    "center",
    "election",
    "day",
    "early",
    "voting",
    "and",
    "the",
    "district",
    "pre",
    "poll",
}


def n(s):
    s = unicodedata.normalize("NFKD", s or "").lower().replace("&", " and ")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", s)).strip()


def n2(s):
    return " ".join(w for w in n(s).split() if w not in NOISE)


def xy(r, p):
    return (
        f"{round(r['lat'], p)}|{round(r['lon'], p)}"
        if r["lat"] is not None and r["lon"] is not None
        else "NOCOORD"
    )


STRATS = {
    "name": lambda r: n(r["name"]),
    "name_aggr": lambda r: n2(r["name"]),
    "name+postcode": lambda r: f"{n(r['name'])}|{r['pc']}",
    "name+div": lambda r: f"{n(r['name'])}|{n(r['div'])}",
    "name+premises+div": lambda r: f"{n(r['name'])}|{n(r['premises'])}|{n(r['div'])}",
    "name+addr": lambda r: f"{n(r['name'])}|{n(r['address'])}",
    "addr": lambda r: n(r["address"]),
    "xy4 (~11m)": lambda r: xy(r, 4),
    "xy3 (~110m)": lambda r: xy(r, 3),
    "name+xy4": lambda r: f"{n(r['name'])}|{xy(r, 4)}",
    "name_aggr+xy3": lambda r: f"{n2(r['name'])}|{xy(r, 3)}",
}


def dist_m(a, b):
    if None in (a["lat"], a["lon"], b["lat"], b["lon"]):
        return 1e9
    p1, p2 = math.radians(a["lat"]), math.radians(b["lat"])
    dl = math.radians(b["lon"] - a["lon"])
    dp = p2 - p1
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 6371000 * 2 * math.asin(math.sqrt(h))


def link_proxy(A, B):
    """Independent multi-signal one-to-one linker (proxy 'truth' when no IDs)."""
    cands = []
    for i, a in enumerate(A):
        for j, b in enumerate(B):
            d = dist_m(a, b)
            if d > 3000:
                continue
            ratio = difflib.SequenceMatcher(None, n(a["name"]), n(b["name"])).ratio()
            if (d <= 200 and ratio >= 0.5) or d <= 25 or (ratio >= 0.95 and d <= 3000):
                cands.append((ratio + max(0, 1 - d / 200), i, j))
    cands.sort(reverse=True)
    ua, ub, links = set(), set(), {}
    for _, i, j in cands:
        if i not in ua and j not in ub:
            ua.add(i)
            ub.add(j)
            links[i] = j
    return links


def link_ids(A, B):
    idx = {}
    for j, b in enumerate(B):
        idx.setdefault(b["id"], []).append(j)
    links = {}
    for i, a in enumerate(A):
        if a["id"] and len(idx.get(a["id"], [])) == 1:
            links[i] = idx[a["id"]][0]
    return links


def dup_rows(rows, f):
    c = collections.Counter(f(r) for r in rows)
    return sum(v for v in c.values() if v > 1), sum(1 for v in c.values() if v > 1)


def main(only=None):
    for label, pat in SETS.items():
        if only and not label.startswith(only):
            continue
        snaps = snapshots(pat)
        if len(snaps) < 2:
            continue
        truth = snaps[0][1][0]["id"] is not None
        print("=" * 100)
        print(
            f"{label}: {len(snaps)} snapshots; truth={'official id' if truth else 'proxy linker'}"
        )
        last = snaps[-1][1]
        print(
            "  hygiene (latest):",
            f"rows={len(last)}",
            f"no_coords={sum(1 for r in last if r['lat'] is None)}",
            f"blank_name={sum(1 for r in last if not r['name'].strip())}",
            f"same_xy_diff_name={sum(v - 1 for v in collections.Counter(xy(r, 5) for r in last).values() if v > 1)}",
        )
        agg = {
            s: {"dupmax": 0, "dupsets": 0, "linked": 0, "split": 0, "merge": 0}
            for s in STRATS
        }
        steps, examples, proxy_check = [], collections.defaultdict(list), None
        for (fa, A), (fb, B) in itertools.pairwise(snaps):
            links = link_ids(A, B) if truth else link_proxy(A, B)
            if truth:
                pl = link_proxy(A, B)
                tp = sum(1 for i, j in pl.items() if links.get(i) == j)
                proxy_check = proxy_check or [0, 0, 0]
                proxy_check[0] += tp
                proxy_check[1] += len(pl)
                proxy_check[2] += len(links)
            steps.append(
                f"{fa[:24]:24s}->{fb[:24]:24s} A={len(A)} B={len(B)} linked={len(links)} dropped={len(A) - len(links)} added={len(B) - len(links)}"
            )
            for s, f in STRATS.items():
                ka, kb = [f(r) for r in A], [f(r) for r in B]
                a = agg[s]
                a["dupmax"] = max(a["dupmax"], dup_rows(B, f)[0])
                a["dupsets"] = max(a["dupsets"], dup_rows(B, f)[1])
                a["linked"] += len(links)
                for i, j in links.items():
                    if ka[i] != kb[j]:
                        a["split"] += 1
                        if len(examples[s]) < 4:
                            examples[s].append(
                                (A[i]["name"], B[j]["name"], round(dist_m(A[i], B[j])))
                            )
                linked_b = set(links.values())
                bkeys = collections.defaultdict(list)
                for j, k in enumerate(kb):
                    bkeys[k].append(j)
                for i, k in enumerate(ka):
                    if links.get(i) is None and (
                        any(j not in linked_b for j in bkeys.get(k, [])) or k in bkeys
                    ):
                        a["merge"] += (
                            1  # key claims 'same' but truth says gone/different
                        )
        print("  steps:")
        for s in steps:
            print("   ", s)
        if proxy_check:
            print(
                f"  proxy-linker vs official ids: precision={proxy_check[0] / max(1, proxy_check[1]):.3f} recall={proxy_check[0] / max(1, proxy_check[2]):.3f}"
            )
        print(
            f"  {'strategy':20s} {'max rows in dup keys':>21s} {'dup sets':>9s} {'false-split %':>14s} {'false-merge (dropped rows matching a key)':>42s}"
        )
        for s, a in agg.items():
            print(
                f"  {s:20s} {a['dupmax']:21d} {a['dupsets']:9d} {100 * a['split'] / max(1, a['linked']):13.2f}% {a['merge']:42d}"
            )
        for s in ("name", "name+postcode", "name+premises+div"):
            if examples[s]:
                print(
                    f"  e.g. key breaks for '{s}' (old name -> new name, metres moved):"
                )
                for e in examples[s]:
                    print("     ", e)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
