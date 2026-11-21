# Browser tests for the diff report

These tests check `report.html` and `index.html` in a real Chromium. They cover the accessibility and browser-behaviour features listed in [`../../README.md`](../../README.md) under "The report", and they run axe-core over every page.

## Running them

You need Node 22+, `uv`, and Playwright with Chromium:

```bash
npm install --no-save playwright@1.63.0
```

```bash
npx playwright install chromium
```

Then, from `diff/`:

```bash
node --test tests/browser/report.test.mjs
```

The suite takes about two minutes. It needs internet access for jsDelivr (OpenLayers and axe-core) and OpenFreeMap. Without it, the map checks are skipped and the axe tests fail. If you're behind a proxy, it's read from `HTTPS_PROXY`.

## Options

| Environment variable | Effect |
|---|---|
| `PPDIFF_FIXTURE_DIR=DIR` | Uses a fixture already built with `make_fixture.py DIR`, instead of building one in a temp folder |
| `PPDIFF_CONFIGS="desktop,iPhone 13"` | Runs the per-configuration checks only for those configurations |
| `PPDIFF_SCREENSHOTS=DIR` | Saves screenshots of each configuration, the index and the find-in-page result |

Add `--test-name-pattern="^desktop$"` to run one configuration's test and skip the rest.

## What it does

**The fixture.** `make_fixture.py` takes Tasmania's 281 places from the federal 2025 test fixture as the old file, and writes a new file with known edits. The diff then has:
- real changes and cosmetic-only changes;
- a large move and a likely coordinate typo;
- added and removed places, and a likely replacement;
- quality issues, and a `fix_data_issues` entry that still applies;
- three places where the matchers disagree.

It then runs `ppdiff run` and `ppdiff index` on the pair. The test serves the result over http from 127.0.0.1.

**Configurations.** Desktop (1280×900) and iPhone 13, each with no preference, with `reducedMotion: 'reduce'`, and with `colorScheme: 'dark'`. Every configuration checks:

| # | Feature | How it's checked |
|---|---|---|
| 1 | `scroll-padding-top` follows the sticky tab bar | `--tabs-h` equals the bar's height, and a jump lands the card below the bar |
| 2 | ARIA tabs | Roles, roving `tabindex`, arrow keys (wrapping), Home and End; `aria-labelledby` on the panel; Tab goes into the panel |
| 3 | `color-scheme` and `accent-color` | Computed values, and the background colour for the scheme |
| 4 | Live region for copy | "Copied" is announced; a repeat is announced again; the region empties afterwards; "Copy failed" when the clipboard is refused |
| 5 | Labelled search inputs | A searchbox named "Filter places by name" on every tab |
| 6 | Reduced motion | Arrow and flash transitions; `scrollIntoView` behaviour; OpenLayers `fit` and `animate` durations (0 under reduce, 300 otherwise) |
| 7 | Folding sections | `h2 > button[aria-expanded][aria-controls]`; body `hidden="until-found"` exactly when folded; Enter and click toggle; ids are unique |
| 8 | `content-visibility: auto` | From the fifth card in each section, with `contain-intrinsic-size`; Tab still reaches the last card in a long section |
| 9 | Deferred OpenLayers | With the CDN slowed by 2.5 s, cards render before `window.ol` exists. With the CDN blocked, there are no script errors and the map says "Map unavailable" |
| 10 | SRI | The report's own CDN tags are version-pinned, with `sha384-` integrity, `crossorigin` and `referrerpolicy`; when online, the stylesheet applied |
| 11 | Review bar | On phones it's at most 52 px tall and drops the hint. `scroll-padding-bottom` covers it, and a focused control near the bottom ends up above it |
| 12 | Map text summary | A visually hidden summary whose counts match the diff, exposed in the accessibility tree |
| 13 | Tiles | Zero-count tiles are hidden, except Changed, Added and Removed |

**Other checks:**
- **Find-in-page:** opens `report.html#:~:text=<a place in the folded "Cosmetic changes only" section>`. In Chromium (headless too), a scroll-to-text fragment fires `beforematch` like find-in-page does. The test checks that the section opened, that `aria-expanded` followed, and that the match is in view below the tab bar.
- **Index:** a labelled search, matcher buttons with `aria-pressed`, and no sideways scrolling.
- **axe-core 4.14.0:**
  - the report's three tabs, with every section open and one card ticked, at desktop and phone sizes, light and dark;
  - the index;
  - the reports and indexes committed under `scrapers/`.

  Any violation fails the test.
