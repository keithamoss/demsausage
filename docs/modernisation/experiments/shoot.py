import collections
import csv
import logging
import sys
import time
import warnings

sys.path.insert(0, "/tmp")
warnings.filterwarnings("ignore")
logging.disable(logging.CRITICAL)
import numpy as np
import tune
import within
from key_experiment import dist_m, n
from rapidfuzz import fuzz
from scipy.optimize import linear_sum_assignment
from within import tracker_link

W = (0.28, 0.11, 0.14, 0.18, 0.28)
THR = 0.65
GEO = 5000


def rf_ratio(a, b):
    if a == b:
        return 1.0
    if not a or not b:
        return 0.0
    return (fuzz.ratio(a, b) + fuzz.token_sort_ratio(a, b)) / 200


def rf_score(a, b):
    d = dist_m(a, b)
    geo = 1.0 if d <= 50 else max(0.0, 1 - (d - 50) / (GEO - 50))
    dv = (
        (len(a["_d"] & b["_d"]) / len(a["_d"] | b["_d"]))
        if (a["_d"] or b["_d"])
        else 0.5
    )
    p = rf_ratio(a["_p"], b["_p"]) if (a["_p"] and b["_p"]) else 0.5
    return (
        W[0] * rf_ratio(a["_n"], b["_n"])
        + W[1] * p
        + W[2] * rf_ratio(a["_a"], b["_a"])
        + W[3] * geo
        + W[4] * dv
    )


def cand_pairs(A, B):
    idx = collections.defaultdict(list)
    for j, b in enumerate(B):
        for k in (
            ("n", b["_n"]),
            ("p", b["_p"]),
            ("a", b["_a"]),
            ("g", round(b["lat"], 2), round(b["lon"], 2)),
        ):
            idx[k].append(j)
    out = []
    for i, a in enumerate(A):
        js = set()
        for k in (("n", a["_n"]), ("p", a["_p"]), ("a", a["_a"])):
            js.update(idx.get(k, ()))
        for dy in (-0.01, 0, 0.01):
            for dx in (-0.01, 0, 0.01):
                js.update(
                    idx.get(("g", round(a["lat"] + dy, 2), round(a["lon"] + dx, 2)), ())
                )
        out += [(i, j) for j in js]
    return out


def lsa(cands, thr):
    """cands: list of (score,i,j). Optimal 1:1 per connected component."""
    cands = [c for c in cands if c[0] >= thr]
    par = {}

    def f(x):
        while par.setdefault(x, x) != x:
            par[x] = par[par[x]]
            x = par[x]
        return x

    for s, i, j in cands:
        par[f(("a", i))] = f(("b", j))
    comp = collections.defaultdict(list)
    for c in cands:
        comp[f(("a", c[1]))].append(c)
    links = {}
    for cs in comp.values():
        ai = sorted({c[1] for c in cs})
        bj = sorted({c[2] for c in cs})
        ia = {v: k for k, v in enumerate(ai)}
        ib = {v: k for k, v in enumerate(bj)}
        M = np.zeros((len(ai), len(bj)))
        for s, i, j in cs:
            M[ia[i], ib[j]] = s
        r, c = linear_sum_assignment(-M)
        for x, y in zip(r, c):
            if M[x, y] > 0:
                links[ai[x]] = (bj[y], M[x, y])
    return links


def greedy(cands, thr):
    ua, ub, links = set(), set(), {}
    for s, i, j in sorted(cands, reverse=True):
        if s >= thr and i not in ua and j not in ub:
            ua.add(i)
            ub.add(j)
            links[i] = (j, s)
    return links


def m_baseline(A, B):
    within.score = tune.make_score(W, GEO)
    return tracker_link(A, B, THR)


def m_rf_greedy(A, B):
    return greedy([(rf_score(A[i], B[j]), i, j) for i, j in cand_pairs(A, B)], THR)


def m_rf_lsa(A, B):
    return lsa([(rf_score(A[i], B[j]), i, j) for i, j in cand_pairs(A, B)], THR)


import splink.comparison_library as cl
from splink import DuckDBAPI, Linker, SettingsCreator, block_on


def sp_scores(A, B):
    def rec(R, off):
        return [
            {
                "unique_id": off + i,
                "name": r["_n"] or None,
                "premises": r["_p"] or None,
                "address": r["_a"] or None,
                "lat": r["lat"],
                "lon": r["lon"],
                "divisions": sorted(r["_d"]) or None,
                "ndiv": ",".join(sorted(r["_d"])) or None,
                "g1": f"{round(r['lat'], 2)}|{round(r['lon'], 2)}",
                "g2": f"{round(r['lat'] + 0.005, 2)}|{round(r['lon'] + 0.005, 2)}",
            }
            for i, r in enumerate(R)
        ]

    ra, rb = rec(A, 0), rec(B, 1000000)
    st = SettingsCreator(
        link_type="link_only",
        unique_id_column_name="unique_id",
        comparisons=[
            cl.NameComparison("name"),
            cl.JaroWinklerAtThresholds("premises", [0.92, 0.8]),
            cl.JaroWinklerAtThresholds("address", [0.92, 0.8]),
            cl.DistanceInKMAtThresholds("lat", "lon", [0.05, 1, 5]),
            cl.ArrayIntersectAtSizes("divisions", [2, 1]),
        ],
        blocking_rules_to_generate_predictions=[
            block_on("name"),
            block_on("premises"),
            block_on("address"),
            block_on("g1"),
            block_on("g2"),
        ],
        retain_intermediate_calculation_columns=False,
    )
    db = DuckDBAPI()
    db.duckdb_con.execute("SET memory_limit='2GB'")
    da = db.register(ra, table_name="A")
    dbb = db.register(rb, table_name="B")
    lk = Linker([da, dbb], st, log_level=50)
    for rules in (
        [block_on("name", "ndiv"), block_on("premises", "address")],
        [block_on("name")],
        [block_on("g1", "name")],
    ):
        try:
            lk.training.estimate_probability_two_random_records_match(rules, recall=0.8)
            p = lk._settings_obj._probability_two_random_records_match
            if 0 < p < 1:
                break
        except (ValueError, TypeError, RuntimeError, KeyError) as e:
            print("prior rule failed", repr(e)[:100])
    else:
        lk._settings_obj._probability_two_random_records_match = 1.0 / len(B)
    lk.training.estimate_u_using_random_sampling(max_pairs=2e6)
    lk.training.estimate_parameters_using_expectation_maximisation(block_on("name"))
    lk.training.estimate_parameters_using_expectation_maximisation(block_on("g1"))
    pred = lk.inference.predict(threshold_match_probability=0.2)
    recs = pred.as_record_list()
    return lk, pred, recs


def m_splink(A, B, thr=0.5):
    lk, pred, recs = sp_scores(A, B)
    c = []
    for r in recs:
        l, rr = r["unique_id_l"], r["unique_id_r"]
        if l >= 1000000:
            l, rr = rr, l
        c.append((r["match_probability"], l, rr - 1000000))
    out = {}
    out["sp_greedy"] = greedy(c, thr)
    out["sp_lsa"] = lsa(c, thr)
    try:
        cl_ = lk.clustering.cluster_using_single_best_links(
            pred, duplicate_free_datasets=["A", "B"], threshold_match_probability=thr
        )
        out["sp_native"] = native(cl_)
    except (ValueError, TypeError, RuntimeError, KeyError, AttributeError) as e:
        out["sp_native"] = {}
        print("native failed", repr(e)[:200])
    return out


def native(cl_):
    by = collections.defaultdict(list)
    for r in cl_.as_record_list():
        by[r["cluster_id"]].append(r["unique_id"])
    links = {}
    for ids in by.values():
        a = [x for x in ids if x < 1000000]
        b = [x - 1000000 for x in ids if x >= 1000000]
        if len(a) == 1 and len(b) == 1:
            links[a[0]] = (b[0], 1.0)
    return links


def score_sets(sets, label):
    agg = collections.defaultdict(lambda: [0, 0, 0, 0, 0, 0.0])
    for nm, A, B, kind_of in sets:
        res = {}
        t = time.time()
        res["baseline(difflib+greedy)"] = m_baseline(A, B)
        tb = time.time() - t
        t = time.time()
        res["rapidfuzz+greedy"] = m_rf_greedy(A, B)
        tg = time.time() - t
        t = time.time()
        res["rapidfuzz+LSA"] = m_rf_lsa(A, B)
        tl = time.time() - t
        t = time.time()
        sp = m_splink(A, B)
        ts = time.time() - t
        res.update(sp)
        times = {
            "baseline(difflib+greedy)": tb,
            "rapidfuzz+greedy": tg,
            "rapidfuzz+LSA": tl,
        }
        for m, links in res.items():
            a = agg[m]
            for i in range(len(A)):
                got = links.get(i, (None,))[0]
                a[4] += 1
                a[3] += got is not None and got != i
                if i in kind_of:
                    a[0] += 1
                    a[1] += got == i
                    a[2] += got is not None and got != i
            a[5] += times.get(m, ts)
    print(f"\n== {label}: perturbed-row recall, wrong(pert), wrong(all), seconds")
    for m, a in agg.items():
        print(
            f"  {m:26s} ok {a[1] / a[0]:.3f}  wrong {a[2] / a[0]:.4f}  wrong(all) {a[3] / a[4]:.4f}  {a[5]:.0f}s"
        )


def real():
    from historical import FED, FIX, load_usable, parse, read_raw

    d1, d2 = (
        parse(f"{FED}/diff-250428-250501.txt"),
        parse(f"{FED}/diff-250501-250502.txt"),
    )
    hdr, rows = read_raw(f"{FIX}/federal_2025/polling_places.csv")
    ix = [dict(r) for r in rows]
    m = {r["PPId"]: r for r in ix}
    for d in (d2, d1):
        for pid, fl in d.items():
            for f, (old, new) in fl.items():
                if pid in m and f in m[pid]:
                    m[pid][f] = old
    for nm, rr in (("a", ix), ("b", rows)):
        with open(f"/tmp/_fed_{nm}.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=hdr)
            w.writeheader()
            w.writerows(rr)
    A = within.prep(load_usable("/tmp/_fed_a.csv"))
    B = within.prep(load_usable("/tmp/_fed_b.csv"))
    ia = {r["id"]: i for i, r in enumerate(A)}
    ib = {r["id"]: j for j, r in enumerate(B)}
    truth = {ia[k]: ib[k] for k in ia if k in ib}
    chg = {
        i
        for i, j in truth.items()
        if n(A[i]["name"]) != n(B[j]["name"])
        or n(A[i]["premises"]) != n(B[j]["premises"])
        or n(A[i]["address"]) != n(B[j]["address"])
        or dist_m(A[i], B[j]) > 11
    }
    t = time.time()
    res = {
        "baseline": m_baseline(A, B),
        "rapidfuzz+greedy": m_rf_greedy(A, B),
        "rapidfuzz+LSA": m_rf_lsa(A, B),
    }
    res.update(m_splink(A, B))
    print(
        f"\n== REAL federal 2025 (7k rows, {len(chg)} changed booths; total {time.time() - t:.0f}s)"
    )
    for m, links in res.items():
        ok = sum(1 for i in chg if links.get(i, (None,))[0] == truth[i])
        wr = sum(1 for i, j in truth.items() if i in links and links[i][0] != j)
        miss = sum(1 for i in truth if i not in links)
        print(
            f"  {m:26s} changed ok {ok}/{len(chg)}  wrong(all) {wr}  unlinked(all) {miss}"
        )


if __name__ == "__main__":
    which = sys.argv[1]
    if which == "real":
        real()
    else:
        names = tune.__dict__.get("X")
        TRAIN = [
            "nsw_lg_2024 (2.1k)",
            "qld_2024 (1.3k)",
            "wa_2025 (no premises)",
            "tas_2025",
            "act_2024 (55 rows)",
        ]
        HOLD = [
            "federal_2025 (7k, PPIds)",
            "vic_2022",
            "overseas_2025",
            "qld_2020 (no divs)",
            "wa_2021 (no divs/prem)",
            "tas_2021",
        ]
        score_sets(tune.build(HOLD if which == "hold" else TRAIN, 1), which)
