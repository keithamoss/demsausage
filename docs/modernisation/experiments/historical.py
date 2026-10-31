import sys, re, csv, collections, io
sys.path.insert(0, "/tmp")
import within
from within import STRATS, prep, tracker_link
from cross import load_any, FIX
from key_experiment import dist_m, n

FED = "/workspaces/demsausage/keithamoss/demsausage/scrapers/federal_2025"
PAT_HDR = re.compile(r"^PPId (\d+) \((.*)\): Mismatch ->$")
PAT_F = re.compile(r"^(\w+): '(.*)' != '(.*)'$")


def parse(path):
    out = collections.OrderedDict(); cur = None
    for line in open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        m = PAT_HDR.match(line)
        if m: cur = m.group(1); out[cur] = {}; continue
        m = PAT_F.match(line)
        if m and cur: out[cur][m.group(1)] = (m.group(2), m.group(3))
    return out


def read_raw(path):
    text = open(path, "rb").read().decode("utf-8-sig", errors="replace")
    rd = csv.DictReader(io.StringIO(text, newline=""))
    return rd.fieldnames, list(rd)


def main():
    d1, d2 = parse(f"{FED}/diff-250428-250501.txt"), parse(f"{FED}/diff-250501-250502.txt")
    hdr, rows = read_raw(f"{FIX}/federal_2025/polling_places.csv")
    byid = {r["PPId"]: r for r in rows}
    # sanity: are the 'new' values of the newest diff equal to the fixture?
    ok = tot = 0
    for d in (d2, d1):
        for pid, fl in d.items():
            for f, (old, new) in fl.items():
                if pid in byid and f in byid[pid]:
                    tot += 1; ok += (byid[pid][f].strip() == new.strip())
    print(f"fixture vs diff 'new' values: {ok}/{tot} equal  (fixture = newest snapshot if ~all equal; diff1 values overwritten by diff2 are expected mismatches)")
    print(f"diff1 touches {len(d1)} PPIds, diff2 touches {len(d2)}; fields: {dict(collections.Counter(f for fl in list(d1.values()) + list(d2.values()) for f in fl))}")

    def revert(diffs):
        out = [dict(r) for r in rows]; ix = {r["PPId"]: r for r in out}
        for d in diffs:  # newest diff first
            for pid, fl in d.items():
                if pid not in ix: continue
                for f, (old, new) in fl.items():
                    if f in ix[pid]: ix[pid][f] = old
        return out

    snaps = {"0502 (newest)": rows, "0501": revert([d2]), "0428": revert([d2, d1])}
    paths = {}
    for k, rs in snaps.items():
        p = f"/tmp/fed2025_{k[:4]}.csv"
        with open(p, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=hdr); w.writeheader(); w.writerows(rs)
        paths[k] = p
    A = prep(load_usable(paths["0428"])); B = prep(load_usable(paths["0502 (newest)"]))
    print(f"\nReconstructed 0428 ({len(A)} rows) -> 0502 ({len(B)} rows), truth = official PPId; identity fields changed on:")
    ia = {r["id"]: i for i, r in enumerate(A)}; ib = {r["id"]: j for j, r in enumerate(B)}
    truth = {ia[k]: ib[k] for k in ia if k in ib}
    changed = []
    for i, j in truth.items():
        a, b = A[i], B[j]
        dd = dist_m(a, b)
        flags = [x for x, c in (("name", n(a["name"]) != n(b["name"])), ("premises", n(a["premises"]) != n(b["premises"])), ("address", n(a["address"]) != n(b["address"])), ("div", a["div"] != b["div"])) if c]
        if dd > 11: flags.append(f"moved {dd:.0f}m")
        if flags: changed.append((i, j, flags, dd))
    print(f"  {len(changed)} of {len(truth)} booths changed an identity field")
    kinds = collections.Counter(tuple(f.split()[0] for f in fl) for _, _, fl, _ in changed)
    for k, v in kinds.most_common(): print(f"    {v:4d}  {'+'.join(k)}")

    methods = {}
    for key in ("name_aggr", "name_aggr+sdiv", "premises+sdiv", "xy4 (~11m)", "addr"):
        f = STRATS[key]; ka = collections.defaultdict(list); kb = collections.defaultdict(list)
        for i, r in enumerate(A): ka[f(r)].append(i)
        for j, r in enumerate(B): kb[f(r)].append(j)
        methods[key] = {v[0]: kb[k][0] for k, v in ka.items() if k in kb and len(v) == 1 and len(kb[k]) == 1}
    tl = tracker_link(A, B)
    methods["TRACKER"] = {i: j for i, (j, s) in tl.items()}
    base = dict(methods["name_aggr+sdiv"]); used = set(base.values())
    rA = [i for i in range(len(A)) if i not in base]; rB = [j for j in range(len(B)) if j not in used]
    hl = tracker_link([A[i] for i in rA], [B[j] for j in rB]); base.update({rA[i]: rB[j] for i, (j, s) in hl.items()})
    methods["HYBRID"] = base
    print(f"\n{'method':16s}{'all ok%':>9s}{'wrong':>7s}{'missed':>8s}   | on the {len(changed)} changed booths: ok / wrong / missed")
    chg = {i for i, _, _, _ in changed}
    for m, links in methods.items():
        ok = sum(1 for i, j in truth.items() if links.get(i) == j); wr = sum(1 for i, j in truth.items() if i in links and links[i] != j)
        cok = sum(1 for i in chg if links.get(i) == truth[i]); cwr = sum(1 for i in chg if i in links and links[i] != truth[i])
        print(f"{m:16s}{100 * ok / len(truth):9.2f}{wr:7d}{len(truth) - ok - wr:8d}   | {cok} / {cwr} / {len(chg) - cok - cwr}")
    print("\nBig venue swaps (premises+address+coords changed together) and how each method did:")
    for i, j, fl, dd in changed:
        if "premises" in "".join(fl) and ("address" in "".join(fl) or dd > 150):
            res = {m: ("ok" if methods[m].get(i) == j else "WRONG" if i in methods[m] else "missed") for m in ("name_aggr+sdiv", "premises+sdiv", "xy4 (~11m)", "TRACKER")}
            sc = tl[i][1] if i in tl else None
            print(f"  PPId {A[i]['id']:>6s} '{A[i]['name'][:28]}' {A[i]['premises'][:26]!r}->{B[j]['premises'][:26]!r} {fl} {res} tracker score={sc if sc is None else round(sc,2)}")


def load_usable(p):
    return [r for r in load_any(p) if r["lat"] is not None and r["lon"] is not None]


main()
