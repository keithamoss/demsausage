"""Summarise API usage from nginx access logs to find third-party consumers.

    docker compose logs nginx --no-log-prefix > nginx.log   # or a production log file
    python analyse_api_usage.py nginx.log

Expects the default combined-style format seen in this repo's nginx:
  IP - - [time] "METHOD path HTTP/x" status bytes "referer" "user-agent" "xff"
Requests whose Referer is one of our own sites are treated as first-party.
"""
import collections, re, sys
from urllib.parse import urlsplit

FIRST_PARTY = re.compile(r"democracysausage\.org|localhost")
LINE = re.compile(r'(\S+) \S+ \S+ \[[^\]]+\] "(\S+) (\S+) [^"]*" (\d+) \S+ "([^"]*)" "([^"]*)"')


def pattern(path):
    p = urlsplit(path).path
    return re.sub(r"/\d+(?=/|$)", "/{id}", p)


counts = collections.defaultdict(lambda: collections.Counter())
agents = collections.defaultdict(collections.Counter)
for line in open(sys.argv[1], errors="replace"):
    m = LINE.match(line)
    if not m or "/api/" not in m.group(3):
        continue
    ip, method, path, status, ref, ua = m.groups()
    party = "first-party" if FIRST_PARTY.search(ref) else "other"
    key = (method, pattern(path))
    counts[key][party] += 1
    if party == "other":
        agents[key][ua[:60]] += 1

print(f"{'endpoint':55} {'first-party':>11} {'other':>8}  top non-first-party user agents")
for key, c in sorted(counts.items(), key=lambda kv: -sum(kv[1].values())):
    top = ", ".join(f"{a} ({n})" for a, n in agents[key].most_common(3))
    print(f"{key[0] + ' ' + key[1]:55} {c['first-party']:>11} {c['other']:>8}  {top}")
