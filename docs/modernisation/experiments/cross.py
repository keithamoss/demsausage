"""Cross-election identity test: how well do candidate keys link the same booth/venue between elections?"""
import sys, csv, re, glob, os, collections, difflib, json, math
sys.path.insert(0, "/tmp")
from key_experiment import n, n2, dist_m, fnum, snapshots, ROOT, load as load_std

FIX = "/workspaces/demsausage/keithamoss/demsausage/django/tests/fixtures/elections"


def pc_of(a):
    m = re.findall(r"\b(\d{4})\b", a or "")
    return m[-1] if m else ""


def load_any(path):
    raw = open(path, "rb").read()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = raw.decode("cp1252")
    import io
    rd = csv.DictReader(io.StringIO(text, newline=""))
    hdr = rd.fieldnames
    rows = list(rd)
    out = []
    for r in rows:
        if "PPId" in hdr:  # AEC raw (federal + overseas)
            pid = (r["PPId"] or "").strip()
            if pid in ("", "0") and r.get("StateAb") != "Overseas":
                continue
            addr = ", ".join(x.strip() for x in (r["Address1"], r["Address2"], r["Address3"], r["Locality"]) if x and x.strip())
            out.append(dict(id=pid or None, name=r["PPName"].strip(), premises=r["PremisesName"].strip(), address=addr,
                            lat=fnum(r["Lat"]), lon=fnum(r["Long"]), div=r["DivName"].strip(), pc=r["Postcode"].strip(), status=r.get("Status")))
        elif "di_name" in hdr:  # SA 2022
            out.append(dict(id=None, name=r["pplace"], premises=r["Address"], address=r["FormatAddress"], lat=fnum(r["Latitude"]),
                            lon=fnum(r["Longitude"]), div=r["di_name"], pc=pc_of(r["FormatAddress"])))
        elif "Polling Place Name" in hdr and "Premise Name" in hdr and "Division" in hdr and "Address" not in hdr:  # TAS 2024
            out.append(dict(id=None, name=r["Polling Place Name"], premises=r["Premise Name"], address=r["Premise_Address_Line_1"],
                            lat=fnum(r["Premise Latitude"]), lon=fnum(r["Premise Longitude"]), div=r["Division"], pc=r["Premise_Postcode"]))
        else:
            out.extend(load_std(path) if False else [])
    if out:
        return out
    return load_std(path)


def latest(pattern):
    files = sorted(glob.glob(os.path.join(ROOT, pattern)), key=lambda p: re.sub(r"\D", "", os.path.basename(p)))
    return load_any(files[-1]), os.path.basename(files[-1])


def sdiv(r):
    return ",".join(sorted(x for x in (n(p) for p in r["div"].split(",")) if x))


def strip_div_suffix(name, div):
    return re.sub(r"\s*\([^)]*\)\s*$", "", name) if "(" in name else name


STRATS = {
    "name": lambda r: n2(r["name"]),
    "name+sdiv": lambda r: f'{n2(r["name"])}|{sdiv(r)}',
    "name(no paren)+sdiv": lambda r: f'{n2(strip_div_suffix(r["name"], r["div"]))}|{sdiv(r)}',
    "premises+sdiv": lambda r: f'{n(r["premises"])}|{sdiv(r)}',
    "name+premises+sdiv": lambda r: f'{n2(r["name"])}|{n(r["premises"])}|{sdiv(r)}',
}


def sim(a, b):
    return difflib.SequenceMatcher(None, n(a), n(b)).ratio()


def venue_cmp(a, b):
    """Classify a matched pair as same venue / moved / different (corroboration check)."""
    d = dist_m(a, b)
    pa, pb = a["premises"] or a["address"], b["premises"] or b["address"]
    s = sim(pa, pb)
    if d <= 150:
        return "same venue (<=150m)"
    if d <= 1000:
        return "same venue? 150m-1km" if s >= 0.6 else "moved 150m-1km"
    return "MOVED >1km" if d < 1e8 else "no coords"


def dupe_stat(R, tag):
    g = collections.defaultdict(list)
    for r in R: g[n2(r["name"])].append(r)
    multi = [v for v in g.values() if len(v) > 1]
    same = sum(1 for v in multi if all(dist_m(v[0], x) <= 150 for x in v))
    print(f"  dup-name groups in {tag}: {len(multi)} ({sum(len(v) for v in multi)} rows); same venue (all within 150m): {same}; name reused for different places: {len(multi) - same}")


def pair(label, A, B, truth=False, show=True):
    print("=" * 110)
    print("  has divisions: A=%d%% B=%d%%" % (100 * sum(1 for r in A if r["div"].strip()) // max(1, len(A)), 100 * sum(1 for r in B if r["div"].strip()) // max(1, len(B))))
    dupe_stat(A, "A"); dupe_stat(B, "B")
    print(f"{label}: A={len(A)} rows, B={len(B)} rows" + ("  [truth = official PPId]" if truth else ""))
    if truth:
        ia = collections.defaultdict(list); ib = collections.defaultdict(list)
        for i, r in enumerate(A): ia[r["id"]].append(i)
        for j, r in enumerate(B): ib[r["id"]].append(j)
        both = [k for k in ia if k in ib and len(ia[k]) == 1 and len(ib[k]) == 1]
        print(f"  official ids in both: {len(both)}; only A: {len([k for k in ia if k not in ib])}; only B: {len([k for k in ib if k not in ia])}")
        print("  same official ID, venue comparison:", dict(collections.Counter(venue_cmp(A[ia[k][0]], B[ib[k][0]]) for k in both)))
    print(f"  {'key strategy':22s} {'dupKeyRows A/B':>15s} {'hit':>6s} {'hit%':>6s}  venue check of hits" + ("   | vs official ID: split / wrong-link" if truth else ""))
    for s, f in STRATS.items():
        ka, kb = collections.defaultdict(list), collections.defaultdict(list)
        for i, r in enumerate(A): ka[f(r)].append(i)
        for j, r in enumerate(B): kb[f(r)].append(j)
        dupA = sum(len(v) for v in ka.values() if len(v) > 1); dupB = sum(len(v) for v in kb.values() if len(v) > 1)
        hits = [(v[0], kb[k][0]) for k, v in ka.items() if k in kb and len(v) == 1 and len(kb[k]) == 1]
        cls = collections.Counter(venue_cmp(A[i], B[j]) for i, j in hits)
        line = f"  {s:22s} {dupA:>7d}/{dupB:<7d} {len(hits):6d} {100 * len(hits) / max(1, min(len(A), len(B))):5.1f}%  " + ", ".join(f"{k}:{v}" for k, v in sorted(cls.items()))
        if truth:
            ida = {A[i]["id"]: j for i, j in hits if False}
            wrong = sum(1 for i, j in hits if A[i]["id"] != B[j]["id"])
            split = sum(1 for k in both if f(A[ia[k][0]]) != f(B[ib[k][0]]))
            line += f"   | split {split} ({100 * split / max(1, len(both)):.1f}%), wrong-link {wrong} ({100 * wrong / max(1, len(hits)):.1f}% of hits)"
        print(line)


def fallback_report(label, A, B, strat):
    f = STRATS[strat]
    ka = {f(r): i for i, r in enumerate(A)}; kb = {f(r): j for j, r in enumerate(B)}
    Aun = [(i, A[i]) for k, i in ka.items() if k not in kb]
    Bun = [(j, B[j]) for k, j in kb.items() if k not in ka]
    amb = auto = 0
    ex = []
    for j, b in Bun:
        c = []
        for i, a in Aun:
            d = dist_m(a, b)
            if d > 3000: continue
            r = sim(a["name"], b["name"])
            if (d <= 150 and r >= .5) or d <= 25:
                c.append((r + max(0, 1 - d / 150), i, d))
        c.sort(reverse=True)
        if not c: continue
        if len(c) == 1 or c[0][0] - c[1][0] > .3:
            auto += 1
            if len(ex) < 3: ex.append((A[c[0][1]]["name"], b["name"], round(c[0][2])))
        else: amb += 1
    print(f"  fallback after '{strat}': unmatched A={len(Aun)} B={len(Bun)} -> geo/name candidate auto={auto} ambiguous={amb}; no candidate (new/dropped)={len(Bun) - auto - amb}  e.g. {ex}")


def series(label, pats, truth=False, fb="name+sdiv"):
    loaded = [latest(p) for p in pats]
    for (A, fa), (B, fb_) in zip(loaded, loaded[1:]):
        pair(f"{label}: {fa[:30]} -> {fb_[:30]}", A, B, truth=truth)
        fallback_report(label, A, B, fb)


if __name__ == "__main__":
    which = sys.argv[1:] or ["sa", "qld", "wa", "tas", "act", "overseas", "federal", "fixes"]
    if "sa" in which: series("SA", ["sa_2022/data/*.csv", "sa_2025/data/*.csv"])
    if "qld" in which: series("QLD", ["qld_2020/data/*.csv", "qld_2024/data/*.csv"])
    if "wa" in which: series("WA", ["wa_2021/data/*.csv", "wa_2025/data/*.csv"])
    if "tas" in which: series("TAS", ["tas_2021/data/*.csv", "tas_2024/data/*.csv", "tas_2025/data/*.csv"])
    if "act" in which: series("ACT", ["act_2020/data/*.csv", "act_2024/data/*.csv"])
    if "overseas" in which:
        o = "federal_overseas_polling_places/overseas_polling_places_%s.csv"
        L = [(load_any(os.path.join(ROOT, o % y)), y) for y in ("2013", "2019", "2022", "2025")]
        for (A, ya), (B, yb) in zip(L, L[1:]):
            pair(f"Overseas {ya}->{yb}", A, B); fallback_report("ov", A, B, "name+premises+sdiv")
    if "federal" in which:
        A, B = load_any(f"{FIX}/federal_2022/polling_places.csv"), load_any(f"{FIX}/federal_2025/polling_places.csv")
        pair("Federal 2022->2025", A, B, truth=True)
    if "fixes" in which:
        A = {r["id"]: r for r in load_any(f"{FIX}/federal_2022/polling_places.csv")}
        B = {r["id"]: r for r in load_any(f"{FIX}/federal_2025/polling_places.csv")}
        for src, tgt, tn in (("federal_2019", A, "2022"), ("federal_2022", B, "2025")):
            fx = [x for x in json.load(open(f"{ROOT}/{src}/config.json"))["fix_data_issues"] if x["field"] == "ec_id"]
            cnt = collections.Counter()
            for x in fx:
                lat = next((o["value"] for o in x["overwrite"] if o["field"] == "lat"), None)
                lon = next((o["value"] for o in x["overwrite"] if o["field"] == "lon"), None)
                t = tgt.get(str(x["value"]))
                if t is None: cnt["ID gone in " + tn] += 1; continue
                if lat is None: cnt["non-coordinate fix"] += 1; continue
                d = dist_m(dict(lat=float(lat), lon=float(lon)), t)
                cnt["fix within 100m of next-election raw coords" if d <= 100 else "fix 100m-1km from next raw" if d <= 1000 else "fix >1km from next raw (place moved or source still wrong)"] += 1
            print(f"\nFixes in {src} ({len(fx)}) vs {tn} raw data:", dict(cnt))
