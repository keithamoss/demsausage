import csv
import random
import sys

sys.path.insert(0, "/tmp")
import within
from deeper import DATASETS, kinds_for
from key_experiment import dist_m, n
from within import perturb, prep, ratio, tracker_link

W0 = (0.30, 0.20, 0.15, 0.20, 0.15)


def make_score(w, thr_geo=1000):
    def score(a, b):
        d = dist_m(a, b)
        geo = 1.0 if d <= 50 else max(0.0, 1 - (d - 50) / (thr_geo - 50))
        dv = (
            (len(a["_d"] & b["_d"]) / len(a["_d"] | b["_d"]))
            if (a["_d"] or b["_d"])
            else 0.5
        )
        p = ratio(a["_p"], b["_p"]) if (a["_p"] and b["_p"]) else 0.5
        return (
            w[0] * ratio(a["_n"], b["_n"])
            + w[1] * p
            + w[2] * ratio(a["_a"], b["_a"])
            + w[3] * geo
            + w[4] * dv
        )

    return score


def build(names, trials, cap=1200):
    out = []
    for nm in names:
        rows = DATASETS[nm]()
        rng0 = random.Random(99)
        if len(rows) > cap:
            rows = rng0.sample(rows, cap)
        within.KINDS = kinds_for(rows)
        A0 = [dict(r) for r in rows]
        A = prep([dict(r) for r in rows])
        for t in range(trials):
            B, kind_of = perturb([dict(r) for r in A0], random.Random(100 + t))
            prep(B)
            out.append((nm, A, B, kind_of))
    return out


def evaluate(sets, w, thr, geo=1000):
    within.score = make_score(w, geo)
    ok = wr = pert = allwr = tot = 0
    for nm, A, B, kind_of in sets:
        links = tracker_link(A, B, thr)
        for i in range(len(A)):
            got = links.get(i, (None,))[0]
            tot += 1
            if got is not None and got != i:
                allwr += 1
            if i in kind_of:
                pert += 1
                if got == i:
                    ok += 1
                elif got is not None:
                    wr += 1
    return ok / pert, wr / pert, allwr / tot


def real_fed(w, thr, geo=1000):
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
            wtr = csv.DictWriter(f, fieldnames=hdr)
            wtr.writeheader()
            wtr.writerows(rr)
    A = prep(load_usable("/tmp/_fed_a.csv"))
    B = prep(load_usable("/tmp/_fed_b.csv"))
    ia = {r["id"]: i for i, r in enumerate(A)}
    ib = {r["id"]: j for j, r in enumerate(B)}
    truth = {ia[k]: ib[k] for k in ia if k in ib}
    chg = [
        i
        for i, j in truth.items()
        if n(A[i]["name"]) != n(B[j]["name"])
        or n(A[i]["premises"]) != n(B[j]["premises"])
        or n(A[i]["address"]) != n(B[j]["address"])
        or dist_m(A[i], B[j]) > 11
    ]
    within.score = make_score(w, geo)
    links = tracker_link(A, B, thr)
    ok = sum(1 for i in chg if links.get(i, (None,))[0] == truth[i])
    wr = sum(1 for i, j in truth.items() if i in links and links[i][0] != j)
    return ok, len(chg), wr, len(truth)


if __name__ == "__main__":
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
    tr = build(TRAIN, 2)
    ho = build(HOLD, 2)
    print("built", len(tr), len(ho), flush=True)
    rng = random.Random(7)
    cands = [(W0, 0.6, 1000)]
    for _ in range(40):
        raw = [rng.uniform(0.02, 1) for _ in range(5)]
        s = sum(raw)
        cands.append(
            (
                tuple(x / s for x in raw),
                rng.choice([0.5, 0.55, 0.6, 0.65, 0.7]),
                rng.choice([1000, 2000, 5000]),
            )
        )
    res = []
    for w, thr, geo in cands:
        o, wrg, aw = evaluate(tr, w, thr, geo)
        res.append((o - 10 * wrg - 10 * aw, o, wrg, aw, w, thr, geo))
    res.sort(reverse=True)
    print("TRAIN default:", next(r for r in res if r[4] == W0)[1:4])
    print("top 5 train:")
    for r in res[:5]:
        print(
            f"  score {r[0]:.3f} ok {r[1]:.3f} wrong {r[2]:.4f} allwrong {r[3]:.4f} w={tuple(round(x, 2) for x in r[4])} thr={r[5]} geo={r[6]}"
        )
    best = res[0]
    for label, (w, thr, geo) in (("default", (W0, 0.6, 1000)), ("tuned", best[4:])):
        o, wrg, aw = evaluate(ho, w, thr, geo)
        print(
            f"HELD-OUT synthetic [{label}] ok {o:.3f} wrong(pert) {wrg:.4f} wrong(all) {aw:.4f}"
        )
        print(
            f"REAL federal 2025 [{label}] changed-booths ok/total, total wrong, n:",
            real_fed(w, thr, geo),
            flush=True,
        )
