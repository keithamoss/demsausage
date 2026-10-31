import sys, random, time, collections, warnings, logging, math
sys.path.insert(0, "/tmp"); warnings.filterwarnings("ignore"); logging.disable(logging.CRITICAL)
import shoot, tune, within
from shoot import lsa, rf_score, cand_pairs
from splink import DuckDBAPI, Linker, SettingsCreator, block_on
import splink.comparison_library as cl

def sp_run(A, B, h1, variant):
    def rec(R, off):
        out = []
        for i, r in enumerate(R):
            out.append({"unique_id": off + i, "name": r["_n"] or None, "premises": r["_p"] or None, "address": r["_a"] or None, "lat": r["lat"], "lon": r["lon"],
                        "divisions": sorted(r["_d"]) or None, "g1": f'{round(r["lat"],2)}|{round(r["lon"],2)}', "g2": f'{round(r["lat"]+.005,2)}|{round(r["lon"]+.005,2)}',
                        "g3": f'{round(r["lat"]/0.05)}|{round(r["lon"]/0.05)}', "g4": f'{round(r["lat"]/0.05+.5)}|{round(r["lon"]/0.05+.5)}',
                        "truth": i if i in h1 else None})
        return out
    comps = [cl.NameComparison("name"), cl.JaroWinklerAtThresholds("premises", [0.92, 0.8]), cl.JaroWinklerAtThresholds("address", [0.92, 0.8]),
             cl.DistanceInKMAtThresholds("lat", "lon", [0.05, 1, 5]), cl.ArrayIntersectAtSizes("divisions", [2, 1])]
    if variant == "noaddr": comps = [c for k, c in enumerate(comps) if k != 2]
    st = SettingsCreator(link_type="link_only", unique_id_column_name="unique_id", comparisons=comps,
        blocking_rules_to_generate_predictions=[block_on("name"), block_on("premises"), block_on("address"), block_on("g1"), block_on("g2"), block_on("g3"), block_on("g4")])
    db = DuckDBAPI(); db.duckdb_con.execute("SET memory_limit='2GB'")
    lk = Linker([db.register(rec(A, 0), table_name="A"), db.register(rec(B, 10**6), table_name="B")], st, log_level=50)
    frac = len(h1) / len(A)
    lk.training.estimate_probability_two_random_records_match([block_on("truth")], recall=frac)
    lk.training.estimate_u_using_random_sampling(max_pairs=2e6)
    lk.training.estimate_m_from_label_column("truth")
    recs = lk.inference.predict(threshold_match_probability=0.001).as_record_list()
    c = []
    for r in recs:
        l, rr = r["unique_id_l"], r["unique_id_r"]
        if l >= 10**6: l, rr = rr, l
        c.append((r["match_weight"], l, rr - 10**6, r["match_probability"]))
    return c

def review_curve(links, truth_ok):
    """links: {i:(j,score)}; returns (#links, #wrong, frac of links to review (lowest score first) to catch all wrong, ... 90%)"""
    items = sorted(links.items(), key=lambda kv: kv[1][1])
    wrong_pos = [k for k, (i, (j, s)) in enumerate(items) if not truth_ok(i, j)]
    if not wrong_pos: return len(items), 0, 0.0, 0.0
    need = lambda q: (wrong_pos[:max(1, math.ceil(q * len(wrong_pos)))][-1] + 1)  # lowest-score-first
    # reviewing lowest k links catches wrong ones within first k; need k covering q of wrong
    k100 = wrong_pos[-1] + 1; k90 = wrong_pos[math.ceil(0.9 * len(wrong_pos)) - 1] + 1
    return len(items), len(wrong_pos), k90 / len(items), k100 / len(items)

def run(sets, label, h_seed=5):
    rows = collections.defaultdict(lambda: collections.Counter())
    for nm, A, B, kind_of in sets:
        rng = random.Random(h_seed); idx = list(range(len(A))); rng.shuffle(idx)
        h1 = set(idx[:len(idx) // 2]); h2 = set(idx[len(idx) // 2:])
        methods = {}
        methods["hand: rapidfuzz+LSA"] = lsa([(rf_score(A[i], B[j]), i, j) for i, j in cand_pairs(A, B)], 0.25)
        for variant in ("full", "noaddr"):
            c = sp_run(A, B, h1, variant)
            methods[f"splink supervised ({variant})"] = lsa([(mw - (-20) + 1, i, j) for mw, i, j, p in c if p >= 0.05], 1.0) if False else None
            # LSA on match weight (shifted positive); ranking score = match weight
            pos = [(mw + 30, i, j) for mw, i, j, p in c]
            l = lsa(pos, 0.0 + 30 - 15)  # keep pairs with match_weight >= -15 (prob ~ 3e-5)... filtered below by p
            keep = {(i, j) for mw, i, j, p in c if p >= 0.001}
            methods[f"splink supervised ({variant})"] = {i: (j, s - 30) for i, (j, s) in l.items() if (i, j) in keep}
        for m, links in methods.items():
            links2 = {i: v for i, v in links.items() if i in h2}
            r = rows[m]
            for i in h2:
                got = links2.get(i, (None,))[0]
                if i in kind_of:
                    r["pert"] += 1; r["ok"] += (got == i); r["wrong"] += (got is not None and got != i)
            q = review_curve(links2, lambda i, j: i == j)
            r["links"] += q[0]; r["wrong_all"] += q[1]; r["k90"] += q[2] * q[1]; r["k100"] += q[3] * q[1]
    print(f"\n== {label}: H2 only (Splink trained on H1 labels). ok / wrong on perturbed rows; wrong links at low threshold; review % (lowest-scored) to catch 90% / 100% of those wrong")
    for m, r in rows.items():
        w = r["wrong_all"]
        print(f"  {m:30s} ok {r['ok']/r['pert']:.3f} wrong {r['wrong']/r['pert']:.4f} | wrong links {w} of {r['links']} | review {100*r['k90']/max(w,1):.1f}% / {100*r['k100']/max(w,1):.1f}%")

if __name__ == "__main__":
    TRAIN = ["nsw_lg_2024 (2.1k)", "qld_2024 (1.3k)", "wa_2025 (no premises)", "tas_2025", "act_2024 (55 rows)"]
    HOLD = ["federal_2025 (7k, PPIds)", "vic_2022", "overseas_2025", "qld_2020 (no divs)", "wa_2021 (no divs/prem)", "tas_2021"]
    run(tune.build(HOLD if sys.argv[1] == "hold" else TRAIN, 1), sys.argv[1])
