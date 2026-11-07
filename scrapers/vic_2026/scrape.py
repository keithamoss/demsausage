#!/usr/bin/env python3
"""
Scrape step for the VIC 2026 state election (network access, cached).

1. Find and download the VEC venues spreadsheet (the source of truth for which
   election day voting centres exist).
2. Query the VEC map API for coordinates. Each query returns only the 100
   election day venues nearest a point, so we keep choosing query points near
   spreadsheet venues that haven't been found yet until all are matched.

Writes data/cache/<stamp> scrape.json (+ <stamp> venues.xlsx). The cache is
saved after every request, and a recent incomplete cache is resumed on the next run.

Usage: python scrape.py [--fresh]
"""

import argparse
import hashlib
import html
import math
import re
import sys
import time
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests

from common import (
    CACHE_DIR,
    CACHE_VERSION,
    ApiVenue,
    ELECTION_DAY_TYPE_ID,
    ElectionSummary,
    ScrapeCache,
    Venue,
    VenueKey,
    cache_paths,
    describe_api_record,
    index_api_voting_centres,
    load_cache,
    load_vc_venues,
    match_venues,
    norm,
    parse_api_address_line_3,
    parse_api_venues,
    parse_election_summaries,
    read_information_date,
    write_json_atomic,
)

ELECTION_NAME = "State Election 2026"
RESOURCES_PAGE_URL = "https://www.vec.vic.gov.au/candidates-and-parties/become-a-state-election-candidate/state-election-candidate-resources"
API_BASE_URL = "https://maps.vec.vic.gov.au/api"
USER_AGENT = "DemocracySausageScraper/1.0 (+https://democracysausage.org; ausdemocracysausage@gmail.com)"

REQUEST_INTERVAL_SECONDS = 2
REQUEST_TIMEOUT_SECONDS = 30
MAX_CONSECUTIVE_FAILURES = 3
MAX_REQUESTS = 500  # Safety net only; a normal run should need far fewer
MAX_RESUME_AGE = timedelta(hours=24)

SEED_POINT = (144.9631, -37.8136)  # Melbourne CBD (lon, lat)

Point = tuple[float, float]


class PoliteClient:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers["User-Agent"] = USER_AGENT
        self.last_request_at = 0.0
        self.request_count = 0

    def request(
        self,
        method: str,
        url: str,
        *,
        params: dict[str, float] | None = None,
        json: dict[str, int] | None = None,
    ) -> requests.Response:
        failures = 0
        while True:
            wait = self.last_request_at + REQUEST_INTERVAL_SECONDS - time.monotonic()
            if wait > 0:
                time.sleep(wait)

            self.request_count += 1
            if self.request_count > MAX_REQUESTS:
                raise RuntimeError(f"Exceeded MAX_REQUESTS ({MAX_REQUESTS}); stopping.")

            self.last_request_at = time.monotonic()
            retry_after = None
            try:
                response = self.session.request(
                    method,
                    url,
                    timeout=REQUEST_TIMEOUT_SECONDS,
                    params=params,
                    json=json,
                )
                if response.status_code != 429 and response.status_code < 500:
                    response.raise_for_status()
                    return response
                retry_after = response.headers.get("Retry-After")
                error = f"HTTP {response.status_code}"
            except (requests.ConnectionError, requests.Timeout) as exc:
                error = repr(exc)

            failures += 1
            if failures >= MAX_CONSECUTIVE_FAILURES:
                raise RuntimeError(
                    f"{method} {url} failed {failures} times in a row ({error}); stopping."
                )

            backoff = REQUEST_INTERVAL_SECONDS * 2**failures
            if retry_after is not None and retry_after.isdigit():
                backoff = max(backoff, int(retry_after))
            print(f"  {error} for {url}; retrying in {backoff}s")
            time.sleep(backoff)

    def request_json(
        self,
        method: str,
        url: str,
        *,
        params: dict[str, float] | None = None,
        json: dict[str, int] | None = None,
    ) -> object:
        response = self.request(method, url, params=params, json=json)
        content_type = response.headers.get("Content-Type", "")
        # Unknown paths on maps.vec.vic.gov.au return the map's HTML shell with a 200
        if "json" not in content_type:
            raise RuntimeError(
                f"Expected JSON from {url} but got {content_type!r} (has the API changed?): {response.text[:200]!r}"
            )
        payload: object = response.json()
        return payload


def find_spreadsheet_url(client: PoliteClient) -> str:
    page = client.request("GET", RESOURCES_PAGE_URL).text
    urls = {
        urljoin(RESOURCES_PAGE_URL, html.unescape(href))
        for href, text in re.findall(
            r'<a[^>]+href="([^"]+\.xlsx[^"]*)"[^>]*>(.*?)</a>', page, flags=re.S | re.I
        )
        if "venues spreadsheet" in norm(re.sub(r"<[^>]+>", "", text))
    }
    if len(urls) != 1:
        raise ValueError(
            f"Expected exactly one 'venues spreadsheet' link on {RESOURCES_PAGE_URL}, found {sorted(urls)}"
        )
    url = urls.pop()
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    if parsed.scheme != "https" or not (
        hostname == "vec.vic.gov.au" or hostname.endswith(".vec.vic.gov.au")
    ):
        raise ValueError(
            f"Venues spreadsheet link {url!r} is not an https vec.vic.gov.au URL"
        )
    return url


def fetch_election(client: PoliteClient) -> ElectionSummary:
    election_payload = client.request_json(
        "POST",
        f"{API_BASE_URL}/elections/current/summary",
        json={"electionType": 1, "electionCategory": 1},
    )
    elections = parse_election_summaries(election_payload)
    matches = [e for e in elections if e.get("electionName") == ELECTION_NAME]
    if len(matches) != 1:
        raise ValueError(
            f"Expected one election named {ELECTION_NAME!r}, got {[e.get('electionName') for e in elections]}"
        )
    return matches[0]


def distance_km(a: Point, b: Point) -> float:
    lat = math.radians((a[1] + b[1]) / 2)
    return math.hypot(a[1] - b[1], (a[0] - b[0]) * math.cos(lat)) * 111.32


def point_of(record: ApiVenue) -> Point:
    return (round(record["longitude"], 5), round(record["latitude"], 5))


def choose_query_point(
    group: list[Venue], cache: ScrapeCache, queried: set[Point]
) -> Point | None:
    """Pick an unqueried known point near an unmatched postcode group, preferring ones far from earlier queries."""
    postcode = group[0].postcode
    suburbs = {norm(v.suburb) for v in group}
    districts = {d for v in group for d in v.districts}
    voting_centres = list(cache["voting_centres"].values())
    other_centres = list(cache["other_centres"].values())

    tiers = [
        [r for r in voting_centres if parse_api_address_line_3(r)[1] == postcode],
        [r for r in other_centres if parse_api_address_line_3(r)[1] == postcode],
        [
            r
            for r in voting_centres + other_centres
            if norm(parse_api_address_line_3(r)[0]) in suburbs
        ],
        [
            r
            for r in voting_centres + other_centres
            if r.get("hostElectorateName") in districts
        ],
    ]
    for tier in tiers:
        candidates = {
            point_of(r) for r in tier if r.get("latitude") and r.get("longitude")
        } - queried
        if candidates:
            return max(
                sorted(candidates),
                key=lambda p: min((distance_km(p, q) for q in queried), default=0),
            )
    return None


def next_target(
    venues: dict[VenueKey, Venue], cache: ScrapeCache, queried: set[Point]
) -> tuple[str, int, Point] | None:
    """Return the busiest unmatched postcode that has an unqueried candidate point."""
    matched_keys = index_api_voting_centres(cache["voting_centres"]).keys()
    groups: dict[str, list[Venue]] = defaultdict(list)
    for key, venue in venues.items():
        if key not in matched_keys:
            groups[venue.postcode].append(venue)

    for postcode in sorted(groups, key=lambda p: (-len(groups[p]), p)):
        point = choose_query_point(groups[postcode], cache, queried)
        if point is not None:
            return postcode, len(groups[postcode]), point
    return None


def run_query(
    client: PoliteClient, cache: ScrapeCache, point: Point, target_postcode: str | None
) -> None:
    lon, lat = point
    response_payload = client.request_json(
        "GET",
        f"{API_BASE_URL}/votingcentres/{cache['election']['electionId']}/",
        params={"longitude": lon, "latitude": lat},
    )
    records: list[ApiVenue] = parse_api_venues(response_payload)

    election_day = [
        r for r in records if r["votingCentreTypeId"] == ELECTION_DAY_TYPE_ID
    ]
    for record in records:
        if record["votingCentreTypeId"] == ELECTION_DAY_TYPE_ID:
            cache["voting_centres"][record["venueId"]] = record
        else:
            cache["other_centres"][record["venueId"]] = record

    cache["queries"].append(
        {
            "longitude": lon,
            "latitude": lat,
            "target_postcode": target_postcode,
            "requested_at": datetime.now().isoformat(timespec="seconds"),
            "election_day_venue_ids": [r["venueId"] for r in election_day],
            "radius_km": round(
                max((distance_km(point, point_of(r)) for r in election_day), default=0),
                3,
            ),
        }
    )


def resumable_cache() -> tuple[ScrapeCache, Path] | None:
    paths = cache_paths()
    if not paths:
        return None
    path = paths[0]
    cache = load_cache(path)
    if cache["complete"]:
        return None
    age = datetime.now() - datetime.fromisoformat(cache["started_at"])
    if age > MAX_RESUME_AGE:
        print(
            f"Not resuming {path.name}: started {age} ago, so its spreadsheet may be stale."
        )
        return None
    print(
        f"Resuming incomplete scrape {path.name} ({len(cache['queries'])} queries done)"
    )
    return cache, path


def start_cache(client: PoliteClient) -> tuple[ScrapeCache, Path]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    spreadsheet_url = find_spreadsheet_url(client)
    response = client.request("GET", spreadsheet_url)
    spreadsheet_path = CACHE_DIR / f"{stamp} venues.xlsx"
    spreadsheet_path.write_bytes(response.content)
    information_date = read_information_date(spreadsheet_path)
    print(
        f"Downloaded {spreadsheet_url} (Last-Modified: {response.headers.get('Last-Modified')}; {information_date})"
    )

    cache: ScrapeCache = {
        "version": CACHE_VERSION,
        "complete": False,
        "stamp": stamp,
        "started_at": datetime.now().isoformat(timespec="seconds"),
        "finished_at": None,
        "spreadsheet": {
            "page_url": RESOURCES_PAGE_URL,
            "url": spreadsheet_url,
            "last_modified": response.headers.get("Last-Modified"),
            "information_date": information_date,
            "sha256": hashlib.sha256(response.content).hexdigest(),
            "filename": spreadsheet_path.name,
        },
        "election": fetch_election(client),
        "queries": [],
        "voting_centres": {},
        "other_centres": {},
        "unmatched_spreadsheet_venues": [],
        "api_venues_not_in_spreadsheet": [],
    }
    path = CACHE_DIR / f"{stamp} scrape.json"
    write_json_atomic(path, cache)
    return cache, path


def main(fresh: bool = False) -> int:
    client = PoliteClient()
    resumed = None if fresh else resumable_cache()
    cache, cache_path = resumed or start_cache(client)
    venues = load_vc_venues(CACHE_DIR / cache["spreadsheet"]["filename"])
    print(f"Spreadsheet: {len(venues)} election day venues")

    queried = {(q["longitude"], q["latitude"]) for q in cache["queries"]}

    if not cache["queries"]:
        run_query(client, cache, SEED_POINT, None)
        queried.add(SEED_POINT)
        write_json_atomic(cache_path, cache)

    while target := next_target(venues, cache, queried):
        postcode, group_size, point = target
        unmatched = len(match_venues(venues, cache["voting_centres"]).unmatched_venues)
        print(
            f"Query {len(cache['queries']) + 1}: {unmatched} unmatched; targeting {group_size} in {postcode} from {point}"
        )
        run_query(client, cache, point, postcode)
        queried.add(point)
        write_json_atomic(cache_path, cache)

    result = match_venues(venues, cache["voting_centres"])
    cache["unmatched_spreadsheet_venues"] = [
        v.describe() for v in result.unmatched_venues
    ]
    cache["api_venues_not_in_spreadsheet"] = [
        describe_api_record(r) for r in result.unknown_api_records
    ]
    cache["complete"] = True
    cache["finished_at"] = datetime.now().isoformat(timespec="seconds")
    write_json_atomic(cache_path, cache)

    print(
        f"\nDone: {len(cache['queries'])} venue queries, {client.request_count} requests this run, "
        f"{len(cache['voting_centres'])} election day venues from the API.\nCache: {cache_path}"
    )
    for line in cache["unmatched_spreadsheet_venues"]:
        print(f"  NOT FOUND IN API: {line}")
    for line in cache["api_venues_not_in_spreadsheet"]:
        print(f"  NOT IN SPREADSHEET: {line}")
    return (
        1
        if cache["unmatched_spreadsheet_venues"]
        or cache["api_venues_not_in_spreadsheet"]
        else 0
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--fresh",
        action="store_true",
        help="start a new scrape instead of resuming an incomplete one",
    )
    sys.exit(main(fresh=parser.parse_args().fresh))
