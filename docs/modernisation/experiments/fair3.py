import sys, collections, time, json, warnings, logging
sys.path.insert(0, "/tmp"); warnings.filterwarnings("ignore"); logging.disable(logging.CRITICAL)
import within, fair, shoot
from shoot import lsa, rf_score, cand_pairs, n, dist_m
from key_experiment import snapshots
from cross import load_any, FIX
from splink import DuckDBAPI, Linker, SettingsCreator, block_on
import splink.comparison_library as cl

def usable(rows): return [r for r in rows if r["lat"] is not None and r["lon"] is not None and r.get("id") not in (None, "", "0", 0)]
def uniq(rows):
    c = collections.Counter(r["id"] for r in rows); return [r for r in rows if c[r["id"]] == 1]

def fed_real():
    ns = {}; exec(open("/tmp/historical.py").read().rsplit("\nmain()", 1)[0], ns)
    return uniq(usable(ns["load_usable"]("/tmp/_fed_a.csv"))), uniq(usable(ns["load_usable"]("/tmp/_fed_b.csv")))
def sa_real():
    s = snapshots("sa_2025/data/*.csv"); return uniq(usable(s[0][1])), uniq(usable(s[-1][1]))
def fed_cross():
    return uniq(usable(load_any(f"{FIX}/federal_2022/polling_places.csv"))), uniq(usable(load_any(f"{FIX}/federal_2025/polling_places.csv")))

def recs(R, off, label_ids=None):
    return [{"unique_id": off + i, "name": r["_n"] or None, "premises": r["_p"] or None, "address": r["_a"] or None, "lat": r["lat"], "lon": r["lon"],
             "divisions": sorted(r["_d"]) or None, "ndiv": ",".join(sorted(r["_d"])) or None,
             "g1": f'{round(r["lat"],2)}|{round(r["lon"],2)}', "g2": f'{round(r["lat"]+.005,2)}|{round(r["lon"]+.005,2)}',
             "g3": f'{round(r["lat"]/0.05)}|{round(r["lon"]/0.05)}', "g4": f'{round(r["lat"]/0.05+.5)}|{round(r["lon"]/0.05+.5)}',
             "truth": (r["id"] if label_ids is not None and r["id"] in label_ids else None)} for i, r in enumerate(R)]

def settings(variant):
    comps = [cl.NameComparison("name"), cl.JaroWinklerAtThresholds("premises", [0.92, 0.8]), cl.JaroWinklerAtThresholds("address", [0.92, 0.8]),
             cl.DistanceInKMAtThresholds("lat", "lon", [0.05, 1, 5]), cl.ArrayIntersectAtSizes("divisions", [2, 1])]
    if variant == "noaddr": comps = [c for k, c in enumerate(comps) if k != 2]
    return SettingsCreator(link_type="link_only", unique_id_column_name="unique_id", comparisons=comps,
        blocking_rules_to_generate_predictions=[block_on("name"), block_on("premises"), block_on("address"), block_on("g1"), block_on("g2"), block_on("g3"), block_on("g4")])

def train(A, B, variant, path):
    common = {r["id"] for r in A} & {r["id"] for r in B}
    db = DuckDBAPI(); db.duckdb_con.execute("SET memory_limit='2GB'")
    lk = Linker([db.register(recs(A, 0, common), table_name="A"), db.register(recs(B, 10**6, common), table_name="B")], settings(variant), log_level=50)
    lk.training.estimate_probability_two_random_records_match([block_on("truth")], recall=len(common) / max(1, len(A)))
    lk.training.estimate_u_using_random_sampling(max_pairs=2e6)
    lk.training.estimate_m_from_label_column("truth")
    lk.misc.save_model_to_json(path, overwrite=True)

def apply(A, B, path):
    db = DuckDBAPI(); db.duckdb_con.execute("SET memory_limit='2GB'")
    lk = Linker([db.register(recs(A, 0), table_name="A"), db.register(recs(B, 10**6), table_name="B")], path, log_level=50)
    lk.training.estimate_u_using_random_sampling(max_pairs=2e6)
    rs = lk.inference.predict(threshold_match_probability=0.001).as_record_list()
    c = []
    for r in rs:
        l, rr = r["unique_id_l"], r["unique_id_r"]
        if l >= 10**6: l, rr = rr, l
        c.append((r["match_weight"], l, rr - 10**6, r["match_probability"]))
    l = lsa([(mw + 40, i, j) for mw, i, j, p in c], 20); keep = {(i, j) for mw, i, j, p in c if p >= 0.001}
    return {i: (j, s - 40) for i, (j, s) in l.items() if (i, j) in keep}

def evaluate(name, A, B, methods):
    ib = {r["id"]: j for j, r in enumerate(B)}
    truth = {i: ib[r["id"]] for i, r in enumerate(A) if r["id"] in ib}
    chg = {i for i, j in truth.items() if n(A[i]["name"]) != n(B[j]["name"]) or n(A[i]["premises"]) != n(B[j]["premises"]) or n(A[i]["address"]) != n(B[j]["address"]) or dist_m(A[i], B[j]) > 11}
    print(f"\n-- TEST {name}: {len(A)}→{len(B)} rows, {len(truth)} true pairs, {len(chg)} changed")
    for m, links in methods.items():
        ok = sum(1 for i in chg if links.get(i, (None,))[0] == truth[i])
        wr = [i for i, (j, s) in links.items() if i in truth and truth[i] != j] + [i for i in links if i not in truth]
        miss = sum(1 for i in truth if i not in links)
        wrong_true = sum(1 for i in truth if i in links and links[i][0] != truth[i])
        q = fair.review_curve({i: v for i, v in links.items() if i in truth}, lambda i, j: truth[i] == j)
        print(f"   {m:34s} changed ok {ok}/{len(chg)}  mislinked {wrong_true}  missed {miss}  review% to catch all mislinks {100*q[3]:.1f}")

def main():
    sets = {"SA 2025 (real id drift)": sa_real(), "federal 2025 (28Apr→2May)": fed_real(), "federal 2022→2025 (PPId; cross-election)": fed_cross()}
    for k in sets: within.prep(sets[k][0]); within.prep(sets[k][1])
    for variant in ("full", "noaddr"):
        for tname in ("SA 2025 (real id drift)", "federal 2025 (28Apr→2May)"):
            path = f"/tmp/_model_{variant}.json"
            train(*sets[tname], variant, path)
            for ename, (A, B) in sets.items():
                if ename == tname: continue
                M = {"hand rapidfuzz+LSA": lsa([(rf_score(A[i], B[j]), i, j) for i, j in cand_pairs(A, B)], 0.25),
                     f"splink[{variant}] trained on {tname[:12]}": apply(A, B, path)}
                evaluate(ename, A, B, M)
main()
