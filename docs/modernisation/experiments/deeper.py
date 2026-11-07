import sys, random, collections, time, os
sys.path.insert(0, "/tmp")
import within
from within import STRATS, prep, tracker_link, perturb, KINDS, HARD
from cross import load_any, latest, FIX
from key_experiment import snapshots, ROOT

ALL = KINDS + HARD


def usable(rows):
    return [r for r in rows if r["lat"] is not None and r["lon"] is not None]


DATASETS = {
    "federal_2025 (7k, PPIds)": lambda: usable(load_any(f"{FIX}/federal_2025/polling_places.csv")),
    "overseas_2025": lambda: usable(load_any(f"{ROOT}/federal_overseas_polling_places/overseas_polling_places_2025.csv")),
    "nsw_lg_2024 (2.1k)": lambda: usable(latest("nsw_lg_2024/*.csv")[0]),
    "qld_2024 (1.3k)": lambda: usable(latest("qld_2024/data/*.csv")[0]),
    "qld_2020 (no divs)": lambda: usable(latest("qld_2020/data/*.csv")[0]),
    "wa_2025 (no premises)": lambda: usable(latest("wa_2025/data/*.csv")[0]),
    "wa_2021 (no divs/prem)": lambda: usable(latest("wa_2021/data/*.csv")[0]),
    "tas_2025": lambda: usable(latest("tas_2025/data/*.csv")[0]),
    "tas_2021": lambda: usable(latest("tas_2021/data/*.csv")[0]),
    "act_2024 (55 rows)": lambda: usable(latest("act_2024/data/*.csv")[0]),
    "vic_2022": lambda: usable(load_any(f"{FIX}/vic_2022/polling_places.csv")),
}


def kinds_for(rows):
    ks = list(ALL)
    if len({r["div"] for r in rows}) < 2: ks = [k for k in ks if k != "division change"]
    if not any(r["premises"] for r in rows): ks = [k for k in ks if "premises" not in k]
    return ks


def stress(rows, trials=4):
    A0 = [dict(r) for r in rows]
    A = prep([dict(r) for r in rows])
    ks = kinds_for(rows)
    within.KINDS = ks
    res = collections.defaultdict(collections.Counter)
    for t in range(trials):
        B, kind_of = perturb([dict(r) for r in A0], random.Random(t)); prep(B)
        methods = {}
        for key in ("name_aggr+sdiv", "premises+sdiv"):
            f = STRATS[key]; ka = collections.defaultdict(list); kb = collections.defaultdict(list)
            for i, r in enumerate(A): ka[f(r)].append(i)
            for j, r in enumerate(B): kb[f(r)].append(j)
            methods[key] = {v[0]: kb[k][0] for k, v in ka.items() if k in kb and len(v) == 1 and len(kb[k]) == 1}
        methods["tracker"] = {i: j for i, (j, s) in tracker_link(A, B).items()}
        base = dict(methods["name_aggr+sdiv"]); used = set(base.values())
        rA = [i for i in range(len(A)) if i not in base]; rB = [j for j in range(len(B)) if j not in used]
        hl = tracker_link([A[i] for i in rA], [B[j] for j in rB])
        base.update({rA[i]: rB[j] for i, (j, s) in hl.items()})
        methods["hybrid"] = base
        for m, links in methods.items():
            for i in range(len(A)):
                kind = kind_of.get(i, "unchanged"); got = links.get(i)
                res[m][("all", "ok" if got == i else "wrong" if got is not None else "missed")] += 1
                if kind != "unchanged":
                    res[m][("pert", "ok" if got == i else "wrong" if got is not None else "missed")] += 1
                if kind == "rename+move+premises+address":
                    res[m][("hardest", "ok" if got == i else "wrong" if got is not None else "missed")] += 1
    return res


def pct(c, scope, what):
    tot = sum(c[(scope, x)] for x in ("ok", "wrong", "missed")) or 1
    return 100 * c[(scope, what)] / tot


def partA():
    print("PART A: synthetic-truth stress test (identity known by construction); ~20% rows perturbed with 10 drift kinds")
    print(f"{'dataset':26s}{'rows':>6s}  {'method':15s}{'all: ok%':>9s}{'wrong%':>8s}{'miss%':>7s}  | {'perturbed ok%':>13s}{'wrong%':>8s}  | {'hardest ok%':>11s}{'wrong%':>8s}")
    for name, fn in DATASETS.items():
        try:
            rows = fn()
        except Exception as e:
            print(name, "LOAD FAIL", e); continue
        t = time.time(); res = stress(rows)
        for m in ("name_aggr+sdiv", "premises+sdiv", "tracker", "hybrid"):
            c = res[m]
            print(f"{name if m == 'name_aggr+sdiv' else '':26s}{len(rows) if m == 'name_aggr+sdiv' else '':>6}  {m:15s}{pct(c, 'all', 'ok'):9.1f}{pct(c, 'all', 'wrong'):8.2f}{pct(c, 'all', 'missed'):7.1f}  | {pct(c, 'pert', 'ok'):13.1f}{pct(c, 'pert', 'wrong'):8.2f}  | {pct(c, 'hardest', 'ok'):11.1f}{pct(c, 'hardest', 'wrong'):8.2f}")
        print(f"{'':26s}   ({time.time() - t:.0f}s)")


def partB():
    print("\nPART B: REAL drift, first->last snapshot, tracker vs exact key (no truth; disagreements are suspects)")
    sets = {"wa_2025": "wa_2025/data/*.csv", "wa_2021": "wa_2021/data/*.csv", "qld_2024": "qld_2024/data/*.csv", "qld_2020": "qld_2020/data/*.csv",
            "nsw_lg_2024": "nsw_lg_2024/*.csv", "tas_2025": "tas_2025/data/*.csv", "tas_2021": "tas_2021/data/*.csv", "act_2024": "act_2024/data/*.csv",
            "sa_2025 (IDs)": "sa_2025/data/*.csv"}
    for name, pat in sets.items():
        s = snapshots(pat); A = prep(usable(s[0][1])); B = prep(usable(s[-1][1]))
        f = STRATS["name_aggr+sdiv"]
        ka = collections.defaultdict(list); kb = collections.defaultdict(list)
        for i, r in enumerate(A): ka[f(r)].append(i)
        for j, r in enumerate(B): kb[f(r)].append(j)
        key = {v[0]: kb[k][0] for k, v in ka.items() if k in kb and len(v) == 1 and len(kb[k]) == 1}
        tr = tracker_link(A, B)
        both = sum(1 for i, j in key.items() if i in tr and tr[i][0] == j)
        dis = [(i, j, tr[i]) for i, j in key.items() if i in tr and tr[i][0] != j]
        only_tr = [i for i in tr if i not in key]
        only_key = [i for i in key if i not in tr]
        lowc = sum(1 for i, (j, sc) in tr.items() if sc < 0.75)
        truth_note = ""
        if A and A[0]["id"]:
            ids = {r["id"]: j for j, r in enumerate(B)}
            wrong = sum(1 for i, (j, sc) in tr.items() if ids.get(A[i]["id"]) != j)
            truth_note = f" | vs official IDs: tracker wrong={wrong}"
        print(f"{name:14s} A={len(A)} B={len(B)} key-linked={len(key)} tracker-linked={len(tr)} agree={both} disagree={len(dis)} tracker-only={len(only_tr)} key-only={len(only_key)} low-confidence(<.75)={lowc}{truth_note}")
        for i, j, (tj, sc) in dis[:3]:
            print(f"     DISAGREE: A='{A[i]['name']}' key->'{B[j]['name']}' tracker->'{B[tj]['name']}' score={sc:.2f}")
        for i in only_tr[:3]:
            j, sc = tr[i]
            print(f"     tracker-only: '{A[i]['name']}' -> '{B[j]['name']}' score={sc:.2f}")


if __name__ == "__main__":
    w = sys.argv[1:] or ["A", "B"]
    if "A" in w: partA()
    if "B" in w: partB()
