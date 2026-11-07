// Browser-side timing of the public data flows: current API vs static objects.
// Usage: node browser_bench.mjs [--runs 7] [--latency 50] [--mbps 20] [--api URL] [--static URL]
import { chromium } from 'playwright-core';

const arg = (n, d) => {
	const i = process.argv.indexOf(`--${n}`);
	return i > -1 ? process.argv[i + 1] : d;
};
const RUNS = Number(arg('runs', 7));
const LATENCY = Number(arg('latency', 50)); // ms RTT added by CDP throttling
const MBPS = Number(arg('mbps', 20));
const API = arg('api', 'https://public.test.democracysausage.org/api/0.1');
const STATIC = arg('static', 'https://localhost:9443');
const ELECTION = 1;
const WARM = arg('warm', '0') === '1';

const browser = await chromium.launch({
	executablePath: '/usr/bin/google-chrome',
	args: [
		'--no-sandbox',
		'--ignore-certificate-errors',
		'--host-resolver-rules=MAP public.test.democracysausage.org 127.0.0.1',
	],
});

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const p95 = (a) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.ceil(a.length * 0.95) - 1)];

const flows = {
	points: {
		current: (api) => `${api}/map/?election_id=${ELECTION}&s=${Math.random()}`,
		static: (st) => `${st}/points.geojson?s=${Math.random()}`,
	},
};

async function measure(label, runFn, argObj) {
	const times = [];
	for (let i = 0; i < RUNS; i++) {
		// Fresh page context each run so each run pays connection setup, like a first visit.
		const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
		const p = await ctx.newPage();
		await p.goto('about:blank');
		const cdp = await ctx.newCDPSession(p);
		await cdp.send('Network.enable');
		await cdp.send('Network.emulateNetworkConditions', {
			offline: false,
			latency: LATENCY,
			downloadThroughput: (MBPS * 1024 * 1024) / 8,
			uploadThroughput: (MBPS * 1024 * 1024) / 8,
		});
		// Navigate to an origin so fetches are same-site-ish and CORS is exercised.
		await p.goto('https://public.test.democracysausage.org/', { waitUntil: 'commit' }).catch(() => {});
		if (WARM) {
			// Open a connection to the static origin first, as <link rel=preconnect> would.
			await p.evaluate((u) => fetch(u + '/booths/0.json', { cache: 'no-store' }).catch(() => {}), STATIC);
		}
		times.push(await p.evaluate(runFn, argObj));
		await ctx.close();
	}
	return { label, median: Math.round(median(times)), p95: Math.round(p95(times)), runs: times.map(Math.round) };
}

const boothIds = await (async () => {
	const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
	const r = await ctx.request.get(`${STATIC}/points.geojson`);
	const j = await r.json();
	await ctx.close();
	return j.features.filter((f) => f.properties.noms !== null).slice(0, 15).map((f) => f.id);
})();

const fetchAll = async (urls) => {
	const t0 = performance.now();
	await Promise.all(urls.map((u) => fetch(u, { cache: 'no-store' }).then((r) => r.arrayBuffer())));
	return performance.now() - t0;
};

const results = [];

results.push(
	await measure('points: current API', async (u) => {
		const t0 = performance.now();
		const r = await fetch(u, { cache: 'no-store' });
		await r.json();
		return performance.now() - t0;
	}, flows.points.current(API)),
);
results.push(
	await measure('points: static', async (u) => {
		const t0 = performance.now();
		const r = await fetch(u, { cache: 'no-store' });
		await r.json();
		return performance.now() - t0;
	}, flows.points.static(STATIC)),
);
results.push(
	await measure('15 cards: current API (1 request)', fetchAll,
		[`${API}/polling_places/search/?election_id=${ELECTION}&ids=${boothIds.join(',')}`]),
);
results.push(
	await measure('15 cards: static (15 requests)', fetchAll, boothIds.map((i) => `${STATIC}/booths/${i}.json`)),
);

await browser.close();
console.log(`\nLatency +${LATENCY} ms RTT, ${MBPS} Mbps, ${RUNS} runs, fresh connection each run (ms)\n`);
console.table(results.map(({ label, median: m, p95: p, runs }) => ({ flow: label, median: m, p95: p, runs: runs.join(' ') })));
