// Browser checks for the diff report and the diffs index.
//
// Builds a report from a known pair of files (make_fixture.py), serves it over http, and checks
// the accessibility and browser-behaviour features in a real Chromium, at desktop and iPhone 13
// sizes, with no preference, reduced motion, and a dark colour scheme. Then runs axe-core on
// the report, the index and the reports committed in the repo. See README.md.
//
//   cd diff && node --test tests/browser/

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, readFileSync, existsSync, mkdirSync, rmSync, globSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");

const HERE = dirname(fileURLToPath(import.meta.url));
const DIFF = resolve(HERE, "../..");
const REPO = resolve(DIFF, "..");
const SHOTS = process.env.PPDIFF_SCREENSHOTS || null;  // folder for screenshots, if wanted
const AXE = "https://cdn.jsdelivr.net/npm/axe-core@4.14.0/axe.min.js";
const CDN = /cdn\.jsdelivr\.net\/npm\/(ol|ol-mapbox-style)@/;

// ---------- the fixture, served over http ----------
let fixtureDir, server, base, browser, reportPath, indexPath;
let ownFixture = false;

// Serves /fixture/... from the fixture folder and /repo/... from the repository, nothing else.
function serve(mounts) {
  const types = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".csv": "text/csv" };
  return new Promise((ok) => {
    const s = createServer((req, res) => {
      const [, mount, ...rest] = decodeURIComponent(new URL(req.url, "http://x").pathname).split("/");
      const root = mounts[mount];
      const path = root && resolve(root, rest.join("/"));
      if (!path || !path.startsWith(root + "/") || !existsSync(path)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { "content-type": types[extname(path)] || "application/octet-stream" });
      res.end(readFileSync(path));
    });
    s.listen(0, "127.0.0.1", () => ok(s));
  });
}

before(async () => {
  fixtureDir = process.env.PPDIFF_FIXTURE_DIR;
  if (!fixtureDir) {
    fixtureDir = mkdtempSync(join(tmpdir(), "ppdiff-browser-"));
    ownFixture = true;
    execFileSync("uv", ["run", "python", "tests/browser/make_fixture.py", fixtureDir], { cwd: DIFF, stdio: "ignore" });
  }
  fixtureDir = resolve(fixtureDir);
  server = await serve({ fixture: fixtureDir, repo: REPO });
  base = `http://127.0.0.1:${server.address().port}`;
  const report = globSync("diffs/*/report.html", { cwd: fixtureDir })[0];
  reportPath = `${base}/fixture/${encodeURI(report)}`;
  indexPath = `${base}/fixture/diffs/index.html`;
  // Behind a proxy (as in CI sandboxes), Chromium needs to be told about it.
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  browser = await chromium.launch(proxy ? { proxy: { server: proxy, bypass: "127.0.0.1,localhost" } } : {});
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
});

after(async () => {
  await browser?.close();
  server?.close();
  if (ownFixture) rmSync(fixtureDir, { recursive: true, force: true });
});

// ---------- configurations ----------
const DESKTOP = { viewport: { width: 1280, height: 900 }, deviceScaleFactor: SHOTS ? 2 : 1 };
const IPHONE = { ...devices["iPhone 13"], defaultBrowserType: undefined };
const CONFIGS = [
  { name: "desktop", device: DESKTOP, phone: false, colorScheme: "light", reducedMotion: "no-preference" },
  { name: "desktop, reduced motion", device: DESKTOP, phone: false, colorScheme: "light", reducedMotion: "reduce" },
  { name: "desktop, dark", device: DESKTOP, phone: false, colorScheme: "dark", reducedMotion: "no-preference" },
  { name: "iPhone 13", device: IPHONE, phone: true, colorScheme: "light", reducedMotion: "no-preference" },
  { name: "iPhone 13, reduced motion", device: IPHONE, phone: true, colorScheme: "light", reducedMotion: "reduce" },
  { name: "iPhone 13, dark", device: IPHONE, phone: true, colorScheme: "dark", reducedMotion: "no-preference" },
];

// PPDIFF_CONFIGS="desktop,iPhone 13" runs only those configurations (names as above).
const ONLY = process.env.PPDIFF_CONFIGS ? process.env.PPDIFF_CONFIGS.split(",").map((x) => x.trim()) : null;

// Records how the page scrolls and animates maps, so reduced motion can be checked.
function instrument() {
  window.__scrolls = [];
  const orig = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (arg) { window.__scrolls.push(arg && typeof arg === "object" ? arg.behavior || "auto" : "auto"); return orig.call(this, arg); };
  window.__mapDurations = [];
  window.addEventListener("DOMContentLoaded", () => {
    if (!window.ol) return;
    for (const m of ["animate", "fit"]) {
      const f = window.ol.View.prototype[m];
      window.ol.View.prototype[m] = function (...args) {
        const opts = m === "fit" ? args[1] : args[0];
        window.__mapDurations.push(opts && "duration" in opts ? opts.duration : "none");
        return f.apply(this, args);
      };
    }
  });
}

async function open(cfg, url = reportPath, opts = {}) {
  const context = await browser.newContext({ ...cfg.device, colorScheme: cfg.colorScheme, reducedMotion: cfg.reducedMotion });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base });
  await context.addInitScript(instrument);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  if (opts.route) await opts.route(page);
  await page.goto(url, { waitUntil: opts.waitUntil || "load" });
  return { context, page, errors };
}
const mapsLoaded = (page) => page.evaluate(() => Boolean(window.ol && window.olms));

// ---------- the 13 features, per configuration ----------
for (const cfg of CONFIGS) {
  test(cfg.name, { skip: Boolean(ONLY && !ONLY.includes(cfg.name)) }, async (t) => {
    const { context, page, errors } = await open(cfg);
    const online = await mapsLoaded(page);
    if (!online) t.diagnostic("OpenLayers didn't load (offline?): map checks are skipped");
    if (SHOTS) await page.screenshot({ path: join(SHOTS, `${cfg.name.replace(/[ ,]+/g, "-")}.png`) });
    // Each check starts from a fresh page on the first tab, with nothing ticked.
    const reload = async () => { await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForSelector(".card"); };

    await t.test("1. scroll-padding-top follows the sticky tab bar's height", async () => {
      const m = await page.evaluate(() => {
        const tabs = document.getElementById("tabs").getBoundingClientRect().height;
        return { tabs, var: getComputedStyle(document.documentElement).getPropertyValue("--tabs-h"), pad: getComputedStyle(document.documentElement).scrollPaddingTop };
      });
      assert.equal(m.var, `${Math.ceil(m.tabs)}px`);
      assert.equal(m.pad, `${Math.ceil(m.tabs) + 12}px`);
      // A jump to a card lands below the bar.
      await page.locator("button.fixbadge").first().click();
      await page.waitForTimeout(cfg.reducedMotion === "reduce" ? 100 : 900);
      const pos = await page.evaluate(() => ({
        card: document.activeElement.getBoundingClientRect().top,
        bar: document.getElementById("tabs").getBoundingClientRect().bottom,
        id: document.activeElement.id,
      }));
      assert.match(pos.id, /-fix-/, "focus moved to the fix card");
      assert.ok(pos.card >= pos.bar - 1, `card top ${pos.card} is below the tab bar ${pos.bar}`);
    });

    await t.test("2. ARIA tabs: roving tabindex, arrows, Home/End, labelled panel", async () => {
      await reload();
      const tabs = page.getByRole("tab");
      const n = await tabs.count();
      assert.equal(n, 3);
      assert.equal(await page.getByRole("tablist", { name: "Report views" }).count(), 1);
      const state = () => page.evaluate(() => [...document.querySelectorAll("[role=tab]")].map((t) => [t.id, t.getAttribute("aria-selected"), t.tabIndex, document.activeElement === t]));
      let s = await state();
      assert.deepEqual(s.map((x) => x[1]), ["true", "false", "false"]);
      assert.deepEqual(s.map((x) => x[2]), [0, -1, -1]);
      assert.equal(await page.getByRole("tabpanel").getAttribute("aria-labelledby"), s[0][0]);
      assert.ok(await page.getByRole("tabpanel", { name: "rapidfuzz diff" }).isVisible());
      await tabs.first().focus();
      await page.keyboard.press("ArrowRight");
      s = await state();
      assert.deepEqual(s[1].slice(1), ["true", 0, true], "ArrowRight selects and focuses the next tab");
      await page.keyboard.press("End");
      s = await state();
      assert.deepEqual(s[2].slice(1), ["true", 0, true], "End goes to the last tab");
      await page.keyboard.press("ArrowRight");
      assert.deepEqual((await state())[0].slice(1), ["true", 0, true], "ArrowRight wraps to the first");
      await page.keyboard.press("ArrowLeft");
      assert.deepEqual((await state())[2].slice(1), ["true", 0, true], "ArrowLeft wraps to the last");
      await page.keyboard.press("Home");
      assert.deepEqual((await state())[0].slice(1), ["true", 0, true], "Home goes to the first tab");
      assert.equal(await page.getByRole("tabpanel").getAttribute("aria-labelledby"), (await state())[0][0]);
      // Tab from the tablist goes into the panel, not to the other tabs.
      await page.keyboard.press("Tab");
      assert.ok(await page.evaluate(() => document.getElementById("view").contains(document.activeElement)));
    });

    await t.test("3. color-scheme and accent-color", async () => {
      const m = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        const probe = document.createElement("div"); probe.style.color = "var(--accent)"; document.body.append(probe);
        const accent = getComputedStyle(probe).color; probe.remove();
        return { scheme: cs.colorScheme, accent: cs.accentColor, accentVar: accent, bg: getComputedStyle(document.body).backgroundColor, meta: document.querySelector("meta[name=color-scheme]")?.content };
      });
      assert.equal(m.scheme, "light dark");
      assert.equal(m.meta, "light dark");
      assert.equal(m.accent, m.accentVar, "accent-color is the theme's accent");
      assert.equal(m.bg, cfg.colorScheme === "dark" ? "rgb(22, 22, 21)" : "rgb(247, 247, 245)");
    });

    await t.test("4. copy success and failure are announced in a live region", async () => {
      await reload();
      const live = page.locator("#live");
      assert.equal(await live.getAttribute("role"), "status");
      // A handle, not a locator: the button's name changes to "Copied".
      const copy = await page.getByRole("button", { name: "Copy summary" }).elementHandle();
      await copy.click();
      await page.waitForFunction(() => /^Copied/.test(document.getElementById("live").textContent), null, { timeout: 2000 });
      assert.match(await copy.textContent(), /^Copied/);
      assert.match(await page.evaluate(() => navigator.clipboard.readText()), /places: \d+ changed/);
      // A second copy must differ from the first, or VoiceOver won't read it again.
      const first = await live.textContent();
      await copy.click();
      await page.waitForFunction((prev) => document.getElementById("live").textContent && document.getElementById("live").textContent !== prev, first);
      // The message is cleared afterwards, so it isn't left for browse mode.
      await page.waitForFunction(() => document.getElementById("live").textContent === "", null, { timeout: 4000 });
      // Failure: no clipboard API and no execCommand fallback.
      await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) } });
        document.execCommand = () => false;
      });
      await copy.click();
      await page.waitForFunction(() => /^Copy failed/.test(document.getElementById("live").textContent), null, { timeout: 2000 });
    });

    await t.test("5. search inputs are labelled", async () => {
      await reload();
      for (const tab of ["rapidfuzz diff", "Splink diff", /Disagreements/]) {
        await page.getByRole("tab", { name: tab }).click();
        assert.equal(await page.getByRole("searchbox", { name: "Filter places by name" }).count(), 1, `on ${tab}`);
      }
    });

    await t.test("6. reduced motion: smooth scrolling, flash and map animations", async () => {
      await reload();
      const reduce = cfg.reducedMotion === "reduce";
      const m = await page.evaluate(() => {
        const toggle = document.querySelector(".section-toggle");
        const card = document.querySelector(".card"); card.classList.add("flash");
        const r = { arrow: getComputedStyle(toggle, "::before").transitionDuration, flash: getComputedStyle(card).transitionDuration };
        card.classList.remove("flash");
        return r;
      });
      assert.equal(m.arrow, reduce ? "0s" : "0.15s");
      assert.equal(m.flash, reduce ? "0s" : "1s");
      await page.evaluate(() => (window.__scrolls.length = 0));
      await page.locator("button.fixbadge").first().click();
      await page.keyboard.press("j");
      const scrolls = await page.evaluate(() => window.__scrolls);
      assert.ok(scrolls.length >= 2);
      assert.ok(scrolls.every((b) => b === (reduce ? "auto" : "smooth")), `scroll behaviours: ${scrolls}`);
      if (!online) return;
      await page.evaluate(() => (window.__mapDurations.length = 0));
      // By id, not by the button: its name changes to "Hide map".
      const id = await page.locator(".card", { has: page.getByRole("button", { name: "Check on map" }) }).first().getAttribute("id");
      const card = page.locator(`[id="${id}"]`);
      await card.getByRole("button", { name: "Check on map" }).click();
      await card.locator(".placemap canvas").first().waitFor();
      await card.getByRole("button", { name: /^Zoom to / }).first().click();
      const durations = await page.evaluate(() => window.__mapDurations);
      assert.ok(durations.length >= 2, `map animations seen: ${durations}`);
      assert.ok(durations.every((d) => d === (reduce ? 0 : 300)), `map animation durations: ${durations}`);
    });

    await t.test("7. sections: heading > button[aria-expanded], body hidden until found", async () => {
      await reload();
      const sections = await page.evaluate(() => [...document.querySelectorAll("#view section.section")].map((s) => {
        const h2 = s.querySelector(":scope > h2"), b = h2 && h2.querySelector(":scope > button.section-toggle");
        const body = b && document.getElementById(b.getAttribute("aria-controls"));
        return { title: b && b.textContent, expanded: b && b.getAttribute("aria-expanded"), hidden: body && body.getAttribute("hidden"), sibling: body && body.parentElement === s };
      }));
      assert.ok(sections.length >= 8);
      for (const s of sections) {
        assert.ok(s.title && s.sibling, `section ${s.title} has h2 > button controlling its body`);
        assert.equal(s.hidden, s.expanded === "true" ? null : "until-found", s.title);
      }
      const folded = page.getByRole("button", { name: /^Cosmetic changes only/ });
      assert.equal(await folded.getAttribute("aria-expanded"), "false");
      await folded.focus();
      await page.keyboard.press("Enter");
      assert.equal(await folded.getAttribute("aria-expanded"), "true");
      const body = page.locator(`#${await folded.getAttribute("aria-controls")}`);
      assert.equal(await body.getAttribute("hidden"), null);
      await folded.click();
      assert.equal(await body.getAttribute("hidden"), "until-found");
      assert.equal(await page.getByRole("heading", { level: 2, name: /^Changed/ }).count(), 1, "screen readers can move by section heading");
      const dupes = await page.evaluate(() => {
        const seen = {};
        for (const el of document.querySelectorAll("[id]")) seen[el.id] = (seen[el.id] || 0) + 1;
        return Object.keys(seen).filter((id) => seen[id] > 1);
      });
      assert.deepEqual(dupes, [], "ids are unique");
    });

    await t.test("8. content-visibility: auto from the fifth card in each section", async () => {
      await reload();
      const cv = await page.evaluate(() => [...document.querySelectorAll("#view .section-body")].map((b) =>
        [...b.children].filter((c) => c.classList.contains("card")).map((c) => [getComputedStyle(c).contentVisibility, getComputedStyle(c).containIntrinsicHeight])).filter((x) => x.length > 4));
      assert.ok(cv.length >= 1, "a section has more than four cards");
      for (const cards of cv) {
        cards.forEach(([v, size], i) => {
          // Cards with an element child (not a text node) are what nth-child counts; extra intro nodes can shift it by one.
          if (i < 3) assert.equal(v, "visible");
          if (i >= 5) { assert.equal(v, "auto"); assert.match(size, /auto 180px/); }
        });
      }
      // Off-screen cards stay reachable by keyboard: Tab from the fourth card's checkbox through the rest.
      const changed = page.locator("section", { has: page.getByRole("heading", { name: /^Changed/ }) });
      const boxes = changed.getByRole("checkbox", { name: /^Reviewed/ });
      const count = await boxes.count();
      assert.ok(count > 5);
      await boxes.nth(3).focus();
      let reached = 3;
      for (let i = 0; i < 60 && reached < count - 1; i++) {
        await page.keyboard.press("Tab");
        const idx = await boxes.evaluateAll((els) => els.indexOf(document.activeElement));
        if (idx > reached) reached = idx;
      }
      assert.equal(reached, count - 1, "Tab reached the last card in the section");
    });

    await t.test("9. OpenLayers is deferred: the report renders first", async () => {
      const slow = await open(cfg, reportPath, {
        waitUntil: "commit",
        route: (p) => p.route(CDN, async (route) => { await new Promise((r) => setTimeout(r, 2500)); await route.continue(); }),
      });
      try {
        await slow.page.waitForSelector(".card");
        assert.equal(await slow.page.evaluate(() => typeof window.ol), "undefined", "cards render before OpenLayers arrives");
        assert.ok(await slow.page.locator(".olmap").count(), "the map box is there, waiting");
        for (const s of await slow.page.locator("script[src]").all()) assert.equal(await s.getAttribute("defer"), "");
        if (online) await slow.page.locator(".olmap canvas").first().waitFor({ timeout: 15000 });
      } finally { await slow.context.close(); }
      // Offline: no errors, and the map says why it's empty.
      const offline = await open(cfg, reportPath, { route: (p) => p.route(/^https:/, (route) => route.abort()) });
      try {
        await offline.page.waitForTimeout(300);
        assert.deepEqual(offline.errors.filter((e) => !/net::ERR|Failed to load resource/.test(e)), [], "no script errors when the CDN can't be reached");
        assert.ok(await offline.page.locator(".card").count());
        assert.match(await offline.page.locator(".mapbox").first().textContent(), /Map unavailable/);
      } finally { await offline.context.close(); }
    });

    await t.test("10. CDN tags have SRI, crossorigin and referrerpolicy", async () => {
      // The report's own tags. (ol-mapbox-style also adds unpinned @fontsource stylesheets for map labels.)
      const tags = await page.evaluate(() => [...document.querySelectorAll("script[src], link[rel=stylesheet]")].filter((e) => !/@fontsource\//.test(e.src || e.href)).map((e) => ({
        url: e.src || e.href, integrity: e.integrity, crossorigin: e.getAttribute("crossorigin"), referrerpolicy: e.getAttribute("referrerpolicy") })));
      assert.equal(tags.length, 3);
      for (const tag of tags) {
        assert.match(tag.url, /^https:\/\/cdn\.jsdelivr\.net\/npm\/[a-z-]+@\d+\.\d+\.\d+\//, "version-pinned");
        assert.match(tag.integrity, /^sha384-[A-Za-z0-9+/]{64}$/);
        assert.equal(tag.crossorigin, "anonymous");
        assert.equal(tag.referrerpolicy, "no-referrer");
      }
      if (online) {
        // The hashes are right: the browser ran the scripts and applied the stylesheet.
        assert.ok(await page.evaluate(() => [...document.styleSheets].some((s) => s.href && s.href.includes("ol.css") && s.cssRules.length)));
        assert.deepEqual(errors.filter((e) => /integrity/i.test(e)), []);
      }
    });

    await t.test("11. the review bar is compact on phones and doesn't hide focused controls", async () => {
      await reload();
      await page.getByRole("tab", { name: /Disagreements/ }).click();
      const bar = page.locator("#bar");
      assert.ok(await bar.isVisible());
      const box = await bar.boundingBox();
      const note = await page.locator("#bar .note").isVisible();
      if (cfg.phone) {
        assert.equal(note, false, "the import hint is hidden on phones");
        assert.ok(box.height <= 52, `bar is ${box.height}px tall`);
      } else assert.equal(note, true);
      // Focus a control near the bottom of the page: it must not end up under the bar.
      const radios = page.getByRole("radio");
      await radios.last().focus();
      await page.waitForTimeout(100);
      const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingBottom));
      assert.ok(pad >= box.height, `scroll-padding-bottom ${pad} covers the ${box.height}px bar`);
      const focused = await page.evaluate(() => document.activeElement.closest("label").getBoundingClientRect().bottom);
      assert.ok(focused <= box.y + 1, `focused control (bottom ${focused}) is above the bar (top ${box.y})`);
    });

    await t.test("12. each map has a text summary for screen readers", async () => {
      await reload();
      const summary = page.locator(".mapbox > p.sr-only");
      assert.equal(await summary.count(), 1);
      const text = await summary.textContent();
      const s = await page.evaluate(() => DATA.diffs[0].summary);
      assert.match(text, new RegExp(`${s.added} added, ${s.removed} removed, ${s.likely_replacements} likely replacements`));
      assert.match(text, /^Map of changes: \d+ moved \(\d+ likely coordinate typos?\)/);
      const box = await summary.boundingBox();
      assert.ok(box.width <= 1 && box.height <= 1, "visually hidden");
      const inTree = await page.locator(".mapbox").ariaSnapshot();
      assert.match(inTree, /Map of changes/, "exposed to assistive technology");
    });

    await t.test("13. zero-count tiles are hidden except Changed, Added and Removed", async () => {
      for (const tab of ["rapidfuzz diff", "Splink diff"]) {
        await page.getByRole("tab", { name: tab }).click();
        const { tiles, summary } = await page.evaluate((m) => ({
          tiles: [...document.querySelectorAll(".tile")].map((t) => [t.querySelector("span").textContent, Number(t.querySelector("b").textContent)]),
          summary: DATA.diffs.find((d) => d.matcher === m).summary,
        }), tab.startsWith("Splink") ? "splink" : "rapidfuzz");
        const labels = tiles.map(([l]) => l);
        for (const always of ["Changed", "Added", "Removed"]) assert.ok(labels.includes(always), `${always} shown on ${tab}`);
        for (const [l, n] of tiles) if (!["Changed", "Added", "Removed"].includes(l)) assert.ok(n > 0, `${l} tile is ${n} on ${tab}`);
        assert.equal(labels.includes("Possible matches"), summary.possible_matches > 0, tab);
        assert.equal(labels.includes("Load problems"), false, "no load problems in the fixture");
      }
    });

    assert.deepEqual(errors.filter((e) => !/net::ERR|Failed to load resource/.test(e)), [], "no script errors");
    await context.close();
  });
}

// ---------- find-in-page opens a folded section ----------
test("scroll-to-text fragment opens a folded section (beforematch)", async (t) => {
  const { context, page } = await open(CONFIGS[0]);
  // Text that only appears inside the folded "Cosmetic changes only" section.
  const target = await page.evaluate(() => {
    const toggle = [...document.querySelectorAll(".section-toggle")].find((b) => b.textContent.startsWith("Cosmetic"));
    const body = document.getElementById(toggle.getAttribute("aria-controls"));
    return { text: body.querySelector(".card h3").textContent, id: body.id, expanded: toggle.getAttribute("aria-expanded") };
  });
  assert.equal(target.expanded, "false", "the cosmetic section starts folded");
  await context.close();
  for (const cfg of [CONFIGS[0], CONFIGS[3]]) {
    const { context: c, page: p } = await open(cfg, `${reportPath}#:~:text=${encodeURIComponent(target.text)}`);
    await p.waitForTimeout(500);
    const state = await p.evaluate(({ id, text }) => {
      const heading = [...document.getElementById(id).querySelectorAll(".card h3")].find((x) => x.textContent === text).getBoundingClientRect();
      return {
        hidden: document.getElementById(id).getAttribute("hidden"),
        expanded: document.querySelector(`[aria-controls="${id}"]`).getAttribute("aria-expanded"),
        inView: heading.top >= document.getElementById("tabs").getBoundingClientRect().bottom && heading.bottom <= innerHeight,
        top: Math.round(heading.top), bottom: Math.round(heading.bottom), innerHeight, bar: Math.round(document.getElementById("tabs").getBoundingClientRect().bottom),
        scrollY,
      };
    }, target);
    t.diagnostic(`${cfg.name}: ${JSON.stringify(state)}`);
    assert.equal(state.hidden, null, `${cfg.name}: the browser revealed the section`);
    assert.equal(state.expanded, "true", `${cfg.name}: beforematch kept aria-expanded in sync`);
    assert.ok(state.inView, `${cfg.name}: scrolled to the match`);
    if (SHOTS) await p.screenshot({ path: join(SHOTS, `find-in-page-${cfg.phone ? "iphone" : "desktop"}.png`) });
    await c.close();
  }
});

// ---------- the index ----------
test("index: labelled search, matcher buttons, links to reports", async () => {
  for (const cfg of [CONFIGS[0], CONFIGS[5]]) {
    const { context, page, errors } = await open(cfg, indexPath);
    assert.equal(await page.getByRole("searchbox", { name: "Filter places by name" }).count(), 1);
    const buttons = page.locator("#matchers button");
    assert.equal(await buttons.count(), 2);
    assert.equal(await buttons.nth(0).getAttribute("aria-pressed"), "true");
    await buttons.nth(1).click();
    assert.equal(await page.locator("#matchers button").nth(1).getAttribute("aria-pressed"), "true");
    assert.ok(await page.getByRole("link", { name: /→/ }).count());
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 0, `no sideways scrolling (${overflow}px)`);
    if (SHOTS) await page.screenshot({ path: join(SHOTS, `index-${cfg.name.replace(/[ ,]+/g, "-")}.png`), fullPage: true });
    assert.deepEqual(errors, []);
    await context.close();
  }
});

// ---------- axe-core ----------
async function axe(page) {
  await page.addScriptTag({ url: AXE });
  return page.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ["violations"] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")), count: v.nodes.length }));
  });
}
const fmt = (vs) => vs.map((v) => `${v.id} (${v.impact}, ${v.count}): ${v.help} e.g. ${v.nodes.join(" | ")}`).join("\n");

async function expandAll(page) {
  await page.evaluate(() => document.querySelectorAll('.section-toggle[aria-expanded="false"]').forEach((b) => b.click()));
  await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
}

test("axe: report, every tab, light and dark, desktop and phone", async (t) => {
  const failures = [];
  for (const cfg of [CONFIGS[0], CONFIGS[2], CONFIGS[3], CONFIGS[5]]) {
    const { context, page } = await open(cfg);
    for (const tab of ["rapidfuzz diff", "Splink diff", /Disagreements/]) {
      await page.getByRole("tab", { name: tab }).click();
      await expandAll(page);
      // Tick a card, so the reviewed style is checked too.
      if (!/Disagreements/.test(String(tab))) await page.getByRole("checkbox", { name: "Reviewed" }).first().check();
      const v = await axe(page);
      if (v.length) failures.push(`${cfg.name}, ${tab}:\n${fmt(v)}`);
    }
    await context.close();
  }
  assert.equal(failures.join("\n\n"), "");
});

test("axe: index, light and dark", async () => {
  const failures = [];
  for (const cfg of [CONFIGS[0], CONFIGS[2], CONFIGS[5]]) {
    const { context, page } = await open(cfg, indexPath);
    await expandAll(page);
    const v = await axe(page);
    if (v.length) failures.push(`${cfg.name}:\n${fmt(v)}`);
    await context.close();
  }
  assert.equal(failures.join("\n\n"), "");
});

test("axe: reports and indexes committed in the repo", async (t) => {
  const pages = [
    ...globSync("scrapers/vic_2026/diffs-linkage/{*/report.html,index.html}", { cwd: REPO }),
    ...globSync("scrapers/nsw_coffs_harbour_2026/diffs/{*/report.html,index.html}", { cwd: REPO }),
  ];
  if (!pages.length) { t.skip("no committed reports"); return; }
  const failures = [];
  for (const cfg of [CONFIGS[0], CONFIGS[2]]) {
    for (const rel of pages) {
      const { context, page } = await open(cfg, `${base}/repo/${encodeURI(rel)}`);
      await expandAll(page);
      const v = await axe(page);
      if (v.length) failures.push(`${cfg.name}, ${rel}:\n${fmt(v)}`);
      await context.close();
    }
  }
  assert.equal(failures.join("\n\n"), "");
});
