# S3 + CloudFront test stack

Private S3 bucket (origin access control) behind CloudFront (HTTP/2 + HTTP/3). No Lambdas, no custom domain. Validated with `terraform validate` only; it has not been applied.

```
terraform init && terraform apply
./upload.sh "$(terraform output -raw bucket)"
D=$(terraform output -raw cloudfront_domain)
curl -sI --compressed https://$D/data/v1/e1/points.geojson          # Content-Encoding: br or gzip, X-Cache
curl -sI https://$D/api/0.1/map/?election_id=1                       # legacy URL rewritten by the CloudFront Function
terraform destroy
```

Test data (gitignored, regenerate with `python make_testdata.py /tmp/static/e1 testdata` using the `../bench/generate_static.py` snapshot; `pip install brotli`):

| Path | What | Compared |
|---|---|---|
| `data/v1/e1/points.geojson` | 1.5 MB uncompressed | CloudFront on-the-fly compression |
| `data/v1br/e1/points.geojson` | same, brotli-11 stored (186 KB) | pre-compressed, `Content-Encoding: br` |
| `data/v1/e1/booths/{id}.json` | 6,630 booth objects (~400 B gzipped) | 15-way parallel fan-out |
| `api/0.1/map/1.json`, `api/0.1/elections/public.json` | legacy API targets | CloudFront Function rewrite |
| `data/manifest.json` | `{"current":"v1"}`, 30 s TTL | version pointer |

Benchmark (points and booth fan-out; the script's `search/` flow has no static equivalent here and will fail, ignore it):

```
node ../bench/browser_bench.mjs --runs 15 --api https://$D/api/0.1 --static https://$D/data/v1/e1      # CloudFront-compressed
node ../bench/browser_bench.mjs --runs 15 --api https://$D/api/0.1 --static https://$D/data/v1br/e1     # pre-compressed (points.geojson only; booths are not uploaded there)
node ../bench/browser_bench.mjs --runs 15 --api https://public.democracysausage.org/api/0.1 --static https://$D/data/v1/e1   # production baseline vs CloudFront
```

`--api .../map/?election_id=1` exercises the rewritten legacy URL; `--static .../points.geojson` exercises the direct object.

Notes
- Content-Type is `application/json`, not `application/geo+json`, so CloudFront's edge compression applies (assumed; check the compressible-types list).
- `?s=Date.now()` cache-busting queries are ignored by the cache policy, so repeated calls will hit the cache. Use `X-Cache` to confirm hits and misses.
- The first request per edge is a miss. Warm it before measuring hits, and report both.
- Costs are small for a test, but run `terraform destroy` afterwards.
