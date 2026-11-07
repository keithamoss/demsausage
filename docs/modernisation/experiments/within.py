"""Within-election stability: field drift, key retention, and a tracker alternative (SA stress test)."""
import sys, random, collections, difflib, functools, math, re
sys.path.insert(0, "/tmp")
from key_experiment import n, n2, dist_m, snapshots, link_proxy, link_ids, STRATS, xy

STRATS = dict(STRATS)


def sdiv(r):
    return ",".join(sorted(x for x in (n(p) for p in r["div"].split(",")) if x))


STRATS["name_aggr+sdiv"] = lambda r: f'{n2(r["name"])}|{sdiv(r)}'
STRATS["premises+sdiv"] = lambda r: f'{n(r["premises"])}|{sdiv(r)}'
SHOW = ["name_aggr", "name_aggr+sdiv", "premises+sdiv", "name+postcode", "addr", "xy4 (~11m)", "xy3 (~110m)", "name_aggr+xy3"]

SETS = {
    "sa_2025 (IDs)": "sa_2025/data/*.csv", "wa_2025": "wa_2025/data/*.csv", "wa_2021": "wa_2021/data/*.csv",
    "qld_2024": "qld_2024/data/*.csv", "qld_2020": "qld_2020/data/*.csv", "nsw_lg_2024": "nsw_lg_2024/*.csv",
    "tas_2025": "tas_2025/data/*.csv", "tas_2021": "tas_2021/data/*.csv", "act_2024": "act_2024/data/*.csv",
}


def field_changes(A, B, links):
    c = collections.Counter()
    for i, j in links.items():
        a, b = A[i], B[j]
        if n(a["name"]) != n(b["name"]): c["name"] += 1
        if n(a["premises"]) != n(b["premises"]): c["premises"] += 1
        if n(a["address"]) != n(b["address"]): c["address"] += 1
        if a["div"].strip() and b["div"].strip() and sdiv(a) != sdiv(b): c["divisions"] += 1
        d = dist_m(a, b)
        if d > 11: c["moved >11m"] += 1
        if d > 110: c["moved >110m"] += 1
        if d > 1000: c["moved >1km"] += 1
    return c


def part1():
    print("PART 1: first snapshot -> last snapshot, within one election")
    for label, pat in SETS.items():
        s = snapshots(pat)
        if len(s) < 2: continue
        (fa, A), (fb, B) = s[0], s[-1]
        truth = A[0]["id"] is not None
        links = link_ids(A, B) if truth else link_proxy(A, B)
        L = max(1, len(links))
        fc = field_changes(A, B, links)
        print("-" * 100)
        print(f"{label}: {len(s)} snapshots, A={len(A)} B={len(B)} linked={len(links)} dropped={len(A) - len(links)} added={len(B) - len(links)}")
        print("  field changed (% of linked rows): " + ", ".join(f"{k} {100 * v / L:.1f}%" for k, v in sorted(fc.items(), key=lambda x: -x[1])) if fc else "  field changed: none")
        out = []
        for k in SHOW:
            f = STRATS[k]
            split = sum(1 for i, j in links.items() if f(A[i]) != f(B[j]))
            dupB = sum(v for v in collections.Counter(f(r) for r in B).values() if v > 1)
            out.append(f"{k}: kept {100 * (1 - split / L):.1f}%" + (f" (dup rows {dupB})" if dupB else ""))
        print("  key retained among linked rows:\n    " + "\n    ".join(out))


# ---------------- tracker ----------------
@functools.lru_cache(maxsize=None)
def ratio(a, b):
    return 1.0 if a == b else difflib.SequenceMatcher(None, a, b).ratio()


def prep(R):
    for r in R:
        r["_n"], r["_p"], r["_a"], r["_d"] = n2(r["name"]), n(r["premises"]), n(r["address"]), set(sdiv(r).split(",")) - {""}
    return R


def score(a, b):
    d = dist_m(a, b)
    geo = 1.0 if d <= 50 else max(0.0, 1 - (d - 50) / 950)
    dv = (len(a["_d"] & b["_d"]) / len(a["_d"] | b["_d"])) if (a["_d"] or b["_d"]) else 0.5
    p = ratio(a["_p"], b["_p"]) if (a["_p"] and b["_p"]) else 0.5
    return 0.30 * ratio(a["_n"], b["_n"]) + 0.20 * p + 0.15 * ratio(a["_a"], b["_a"]) + 0.20 * geo + 0.15 * dv


def tracker_link(A, B, thr=0.6):
    idx = collections.defaultdict(list)
    for j, b in enumerate(B):
        for k in (("n", b["_n"]), ("p", b["_p"]), ("a", b["_a"]), ("g", round(b["lat"], 2), round(b["lon"], 2))):
            idx[k].append(j)
    cands = []
    for i, a in enumerate(A):
        js = set()
        for k in (("n", a["_n"]), ("p", a["_p"]), ("a", a["_a"])): js.update(idx.get(k, ()))
        for dy in (-.01, 0, .01):
            for dx in (-.01, 0, .01):
                js.update(idx.get(("g", round(a["lat"] + dy, 2), round(a["lon"] + dx, 2)), ()))
        for j in js:
            s = score(a, B[j])
            if s >= thr: cands.append((s, i, j))
    cands.sort(reverse=True)
    ua, ub, links = set(), set(), {}
    for s, i, j in cands:
        if i not in ua and j not in ub:
            ua.add(i); ub.add(j); links[i] = (j, s)
    return links


KINDS = ["rename", "move 150m-2km", "lat typo (1 deg)", "premises edit", "address edit", "division change", "rename+move"]
HARD = ["rename+move+premises", "rename+move+address", "rename+move+premises+address"]
NOPREM = False


def perturb(B, rng, rate=0.02):
    B2 = [dict(r) for r in B]
    idx = list(range(len(B2))); rng.shuffle(idx)
    k = max(2, int(len(B2) * rate)); kind_of = {}
    divs = sorted({r["div"] for r in B2})
    for ki, kind in enumerate(KINDS):
        for i in idx[ki * k:(ki + 1) * k]:
            r = B2[i]; kind_of[i] = kind
            if "rename" in kind: r["name"] = rng.choice([r["name"] + " Community Hall", "District - " + r["name"], re.sub(r"\s\w+$", "", r["name"]) or r["name"] + " X"])
            if "premises" in kind and kind != "premises edit": r["premises"] = (r["premises"] + " - Main Hall") if r["premises"] else "Main Hall"
            if "address" in kind and kind != "address edit": r["address"] = re.sub(r"\d+", lambda m: str(int(m.group()) + 7), r["address"]) or "1 New St"
            if "move" in kind:
                dm, th = rng.uniform(150, 2000), rng.uniform(0, 6.28)
                r["lat"] += dm * math.cos(th) / 111000; r["lon"] += dm * math.sin(th) / 91000
            if kind.startswith("lat typo"): r["lat"] += 1.0
            if kind == "premises edit": r["premises"] = (r["premises"] + " - Main Hall") if r["premises"] else "Main Hall"
            if kind == "address edit": r["address"] = re.sub(r"\d+", lambda m: str(int(m.group()) + 7), r["address"]) or "1 New St"
            if kind == "division change": r["div"] = rng.choice([d for d in divs if d != r["div"]])
    return B2, kind_of


def part2(trials=15, kinds=None, noprem=False):
    global KINDS
    KINDS = kinds or KINDS
    print("\n" + "=" * 100)
    print(f"PART 2: SA 2025 first->last with real IDs as truth, injected drift ({len(KINDS)} kinds x 2% each, ~{14}% of rows perturbed), {trials} trials")
    s = snapshots("sa_2025/data/*.csv")
    A = [dict(r) for r in s[0][1]]; B0 = s[-1][1]
    if noprem:
        for r in A: r["premises"] = ""
        B0 = [dict(r, premises="") for r in B0]
    A = prep(A)
    idsA = {r["id"]: i for i, r in enumerate(A)}
    res = collections.defaultdict(lambda: collections.Counter())
    for t in range(trials):
        rng = random.Random(t)
        B, kind_of = perturb(B0, rng); prep(B)
        truth = {idsA[r["id"]]: j for j, r in enumerate(B) if r["id"] in idsA}
        inv = {j: i for i, j in truth.items()}
        methods = {}
        # key methods: unique-key matching only
        for k in ("name_aggr", "name_aggr+sdiv", "premises+sdiv", "xy4 (~11m)", "name_aggr+xy3"):
            f = STRATS[k]; ka = collections.defaultdict(list); kb = collections.defaultdict(list)
            for i, r in enumerate(A): ka[f(r)].append(i)
            for j, r in enumerate(B): kb[f(r)].append(j)
            methods[k] = {v[0]: kb[key][0] for key, v in ka.items() if key in kb and len(v) == 1 and len(kb[key]) == 1}
        tl = tracker_link(A, B)
        methods["TRACKER (multi-signal)"] = {i: j for i, (j, s) in tl.items()}
        # hybrid: exact key first, tracker on leftovers
        f = STRATS["name_aggr+sdiv"]
        base = dict(methods["name_aggr+sdiv"])
        usedB = set(base.values()); restA = [i for i in range(len(A)) if i not in base]
        restB = [j for j in range(len(B)) if j not in usedB]
        subA = [A[i] for i in restA]; subB = [B[j] for j in restB]
        hl = tracker_link(subA, subB)
        base.update({restA[i]: restB[j] for i, (j, s) in hl.items()})
        methods["HYBRID key+tracker"] = base
        for m, links in methods.items():
            for i, j in truth.items():
                kind = kind_of.get(j, "unchanged")
                got = links.get(i)
                res[m][(kind, "ok" if got == j else "wrong" if got is not None else "missed")] += 1
    kinds = ["unchanged"] + KINDS
    print(f"{'method':26s}" + "".join(f"{k[:13]:>15s}" for k in kinds) + "   (cell = % correct / % wrong-link)")
    for m, c in res.items():
        row = f"{m:26s}"
        for k in kinds:
            tot = sum(c[(k, x)] for x in ("ok", "wrong", "missed")) or 1
            row += f"{100 * c[(k, 'ok')] / tot:9.0f}/{100 * c[(k, 'wrong')] / tot:<4.1f} "
        print(row)
    print("\nTotals over all rows:")
    for m, c in res.items():
        tot = sum(c.values())
        ok = sum(v for (k, x), v in c.items() if x == "ok"); wr = sum(v for (k, x), v in c.items() if x == "wrong")
        print(f"  {m:26s} correct {100 * ok / tot:5.1f}%  wrong-link {100 * wr / tot:5.2f}%  missed {100 * (tot - ok - wr) / tot:5.1f}%")


if __name__ == "__main__":
    w = sys.argv[1:] or ["1", "2"]
    if "1" in w: part1()
    if "2" in w: part2()
    if "3" in w: part2(kinds=HARD, noprem=False)
    if "4" in w: part2(kinds=["rename", "rename+move", "move 150m-2km", "address edit"], noprem=True)
