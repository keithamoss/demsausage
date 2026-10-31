import sys, random, collections, math
sys.path.insert(0, "/tmp")
import fair, tune, within, shoot
from shoot import lsa, rf_score, cand_pairs
from deeper import DATASETS, kinds_for

def build_hard(names, rate, cap=1200):
    out = []
    for nm in names:
        rows = DATASETS[nm]()
        if len(rows) > cap: rows = random.Random(99).sample(rows, cap)
        within.KINDS = kinds_for(rows)
        A0 = [dict(r) for r in rows]; A = within.prep([dict(r) for r in rows])
        B, kind_of = within.perturb([dict(r) for r in A0], random.Random(321), rate=rate); within.prep(B)
        out.append((nm, A, B, kind_of))
    return out

def coverage(links, prec):
    items = sorted(links.items(), key=lambda kv: -kv[1][1]); ok = 0; best = 0
    for k, (i, (j, s)) in enumerate(items, 1):
        ok += (i == j)
        if ok / k >= prec: best = k
    return best

def main(rate):
    names = ["nsw_lg_2024 (2.1k)", "qld_2024 (1.3k)", "tas_2025", "vic_2022", "qld_2020 (no divs)", "wa_2025 (no premises)", "tas_2021", "overseas_2025"]
    agg = collections.defaultdict(collections.Counter); tot = 0
    for nm, A, B, kind_of in build_hard(names, rate):
        rng = random.Random(5); idx = list(range(len(A))); rng.shuffle(idx); h1 = set(idx[:len(idx)//2]); h2 = set(idx[len(idx)//2:])
        M = {"hand: rapidfuzz+LSA": lsa([(rf_score(A[i], B[j]), i, j) for i, j in cand_pairs(A, B)], 0.25)}
        for v in ("full", "noaddr"):
            c = fair.sp_run(A, B, h1, v); l = lsa([(mw + 30, i, j) for mw, i, j, p in c], 15); keep = {(i, j) for mw, i, j, p in c if p >= 0.001}
            M[f"splink supervised ({v})"] = {i: (j, s - 30) for i, (j, s) in l.items() if (i, j) in keep}
        tot += len(h2)
        for m, links in M.items():
            l2 = {i: v for i, v in links.items() if i in h2}; a = agg[m]
            a["ok"] += sum(1 for i, (j, s) in l2.items() if j == i); a["wrong"] += sum(1 for i, (j, s) in l2.items() if j != i)
            a["unl"] += len(h2) - len(l2)
            a["cov99"] += coverage(l2, 0.99); a["cov999"] += coverage(l2, 0.999); a["cov100"] += coverage(l2, 1.0)
            q = fair.review_curve(l2, lambda i, j: i == j); a["k100w"] += q[3] * q[1]; a["k90w"] += q[2] * q[1]
    print(f"\n== HARD drift (rate {rate}/kind, ~{int(100*min(1,rate*10))}% rows perturbed), {tot} test rows")
    print("  method                          correct  wrong  unlinked | auto-accept coverage at precision 100% / 99.9% / 99%  | review % to catch all wrong")
    for m, a in agg.items():
        print(f"  {m:30s} {a['ok']/tot:7.3f} {a['wrong']:6d} {a['unl']:8d} | {a['cov100']/tot:.3f} / {a['cov999']/tot:.3f} / {a['cov99']/tot:.3f} | {100*a['k100w']/max(a['wrong'],1):.1f}% (90%: {100*a['k90w']/max(a['wrong'],1):.1f}%)")

main(float(sys.argv[1]))
