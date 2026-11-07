import sys; sys.path.insert(0,'/tmp')
from key_experiment import *

def sdiv(r): return ",".join(sorted(x for x in (n(p) for p in r["div"].split(",")) if x))
KEYS = {
  "name+sorted_div": lambda r: f'{n2(r["name"])}|{sdiv(r)}',
  "name+sorted_div+pc": lambda r: f'{n2(r["name"])}|{sdiv(r)}|{r["pc"]}',
}
SETS2 = {"sa_2025":"sa_2025/data/*.csv","wa_2025":"wa_2025/data/*.csv","wa_2021":"wa_2021/data/*.csv","qld_2024":"qld_2024/data/*.csv","qld_2020":"qld_2020/data/*.csv","nsw_lg_2024":"nsw_lg_2024/*.csv","tas_2025":"tas_2025/data/*.csv","tas_2021":"tas_2021/data/*.csv"}

def fallback(Aun, Bun):
    """geo/name fallback among unmatched; returns (auto, ambiguous)"""
    cands = collections.defaultdict(list)
    for i,a in Aun:
        for j,b in Bun:
            d = dist_m(a,b)
            if d>3000: continue
            ratio = difflib.SequenceMatcher(None,n(a["name"]),n(b["name"])).ratio()
            if (d<=200 and ratio>=.5) or d<=25 or (ratio>=.95):
                cands[j].append((ratio+max(0,1-d/200),i))
    auto, amb = 0, 0
    for j,c in cands.items():
        c.sort(reverse=True)
        if len(c)==1 or c[0][0]-c[1][0]>0.3: auto+=1
        else: amb+=1
    return auto, amb, len(cands)

for label,pat in SETS2.items():
    s = snapshots(pat)
    print(f"== {label}")
    for kname,f in KEYS.items():
        for (fa,A),(fb,B) in zip(s,s[1:]):
            ca = collections.Counter(f(r) for r in A); cb = collections.Counter(f(r) for r in B)
            dupA = sum(v for v in ca.values() if v>1); dupB = sum(v for v in cb.values() if v>1)
            ka = {f(r):i for i,r in enumerate(A)}; kb={f(r):j for j,r in enumerate(B)}
            hit = len(set(ka)&set(kb))
            Aun = [(i,A[i]) for k,i in ka.items() if k not in kb]
            Bun = [(j,B[j]) for k,j in kb.items() if k not in ka]
            auto,amb,withc = fallback(Aun,Bun)
            print(f"  {kname:20s} {fb[:22]:22s} rows={len(B)} dupKeyRows(A/B)={dupA}/{dupB} keyHit={hit} unmatchedB={len(Bun)} -> fallback candidate={withc} (auto={auto}, ambiguous={amb}) truly-new/no-candidate={len(Bun)-withc} droppedA={len(Aun)}")
