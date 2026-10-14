# Scrapers: be a polite, above-board visitor to electoral commission websites

Electoral commission sites are public infrastructure that voters rely on, especially in the weeks around an election. Nothing we do while exploring or scraping them should add noticeable load, look hostile, or be construable as hacking.

When exploring a site or writing/running a scraper:

- **Keep request volume small.** Fetch what you need once and save it locally (e.g. under the scraper's gitignored `data/` dir) to work from, instead of re-requesting while you iterate on parsing.
- **One request at a time.** No parallel or concurrent requests. Pause between requests (at least 1–2 seconds; longer for bulk runs like one call per district).
- **Prefer a single bulk source** (one JSON endpoint, one embedded blob, one file) over per-item enumeration. If enumeration is unavoidable, keep it to the smallest natural set (e.g. districts, not addresses or grid points).
- **Read-only.** GETs, plus read-only POST lookups the site's own app makes. Never submit forms, guess or fuzz URLs and parameters, or try to bypass rate limits, caching, authentication or `robots.txt`.
- **Nothing that could be construed as hacking.** Only use data the site deliberately makes public to ordinary visitors: published pages and files, and the API calls the site's own public app makes for a voter. Don't probe for or exploit weaknesses or misconfigurations; don't hunt for hidden, admin, debug or staging endpoints, directory listings, exposed files or credentials; don't send injection or malformed input; don't tweak IDs or parameters to reach data the app wouldn't show a visitor; and don't use anything behind a login or an access agreement (e.g. media results feeds) unless the user has that access and asks. If something looks unintentionally exposed, leave it alone and tell the user.
- **Back off on trouble.** On HTTP 429, a 403 from the site itself, 5xx errors, timeouts or a slow response, stop and don't retry in a loop. Report it to the user instead.
- **Identify honestly.** Use a plain, descriptive user agent (e.g. `DemocracySausage-scraper/1.0 (+https://democracysausage.org)`). Never spoof a browser to get around blocks.
- **Headless browsers sparingly.** Use one only to discover how a map or app loads its data, load the page once, and then call the underlying endpoint directly from the scraper.
- **Never contact the electoral commission** on the user's behalf.

Scrapers committed here should build these in: a delay between requests, a descriptive user agent, and failing loudly (not retrying) on errors.
