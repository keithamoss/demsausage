import sys, random, math
sys.path.insert(0,"/tmp")
import fair, shoot, within
from shoot import lsa, rf_score, cand_pairs, n, dist_m
ns={}; exec(open("/tmp/historical.py").read().rsplit("\nmain()",1)[0],ns)
A=within.prep(ns["load_usable"]("/tmp/_fed_a.csv")); B=within.prep(ns["load_usable"]("/tmp/_fed_b.csv"))
ia={r["id"]:i for i,r in enumerate(A)}; ib={r["id"]:j for j,r in enumerate(B)}
truth={ia[k]:ib[k] for k in ia if k in ib}
# reindex B so B[i] aligned with A[i] where possible is unnecessary: use truth map; label via truth_id on both
order=list(truth); random.Random(5).shuffle(order); h1=set(order[:len(order)//2]); h2=set(order[len(order)//2:])
chg={i for i,j in truth.items() if n(A[i]["name"])!=n(B[j]["name"]) or n(A[i]["premises"])!=n(B[j]["premises"]) or n(A[i]["address"])!=n(B[j]["address"]) or dist_m(A[i],B[j])>11}
# make truth identity: permute B to A's order
Bp=[B[truth[i]] for i in range(len(A)) if i in truth]; Ap=[A[i] for i in range(len(A)) if i in truth]
pos={i:k for k,i in enumerate(i for i in range(len(A)) if i in truth)}
h1p={pos[i] for i in h1}; h2p={pos[i] for i in h2}; chgp={pos[i] for i in chg}
res={"hand: rapidfuzz+LSA":lsa([(rf_score(Ap[i],Bp[j]),i,j) for i,j in cand_pairs(Ap,Bp)],0.25)}
for v in ("full","noaddr"):
    c=fair.sp_run(Ap,Bp,h1p,v); l=lsa([(mw+30,i,j) for mw,i,j,p in c],15); keep={(i,j) for mw,i,j,p in c if p>=0.001}
    res[f"splink supervised ({v})"]={i:(j,s-30) for i,(j,s) in l.items() if (i,j) in keep}
print(f"REAL federal, H2 half ({len(h2p)} booths, {len(chgp&h2p)} changed)")
for m,links in res.items():
    l2={i:v for i,v in links.items() if i in h2p}
    ok=sum(1 for i in chgp&h2p if l2.get(i,(None,))[0]==i); wr=sum(1 for i,(j,s) in l2.items() if j!=i)
    print(f"  {m:30s} changed ok {ok}/{len(chgp&h2p)}  wrong links {wr}  unlinked {len(h2p)-len(l2)}  review curve {fair.review_curve(l2,lambda i,j:i==j)}")
