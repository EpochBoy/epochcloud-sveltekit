import type { RequestHandler } from './$types';
import client from 'prom-client';
import { env } from '$env/dynamic/private';
import { registry, httpRequestsTotal, activeRequests } from '$lib/server/metrics.js';
import os from 'node:os';

// Demo counter — users can increment this to see Prometheus metrics in action
const demoCounter = new client.Counter({
	name: 'epochcloud_demo_counter_total',
	help: 'Demo counter incremented by users from the dashboard',
	registers: [registry]
});

const PROMETHEUS_URL = env.PROMETHEUS_URL;
const hostname = os.hostname();

/** Query Prometheus for a single instant value */
async function queryPrometheus(promql: string): Promise<number> {
	if (!PROMETHEUS_URL) return NaN;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 3000);
	try {
		const resp = await fetch(
			`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(promql)}`,
			{ signal: controller.signal }
		);
		if (!resp.ok) return NaN;
		const data = await resp.json();
		const value = data?.data?.result?.[0]?.value?.[1];
		return value !== undefined ? parseFloat(value) : NaN;
	} catch {
		return NaN;
	} finally {
		clearTimeout(timer);
	}
}

export const GET: RequestHandler = async ({ url }) => {
	const action = url.searchParams.get('action') || 'status';

	if (action === 'increment') {
		demoCounter.inc();
	}

	// Try aggregated Prometheus query first, fall back to local prom-client
	let demoCount: number;
	let httpTotal: number;
	let active: number;
	let source: 'prometheus' | 'local';

	try {
		const [d, h, a] = await Promise.all([
			queryPrometheus('sum(epochcloud_demo_counter_total)'),
			queryPrometheus('sum(epochcloud_http_requests_total)'),
			queryPrometheus('sum(epochcloud_active_requests)')
		]);

		if (!isNaN(d) && !isNaN(h)) {
			demoCount = d;
			httpTotal = Math.round(h);
			active = isNaN(a) ? 0 : a;
			source = 'prometheus';
		} else {
			throw new Error('NaN result');
		}
	} catch {
		// Fallback: local prom-client values (per-pod, not aggregated)
		demoCount = (await demoCounter.get()).values[0]?.value ?? 0;
		httpTotal = (await httpRequestsTotal.get()).values.reduce((sum, v) => sum + v.value, 0);
		active = (await activeRequests.get()).values[0]?.value ?? 0;
		source = 'local';
	}

	return new Response(
		JSON.stringify({
			success: true,
			demo_counter: demoCount,
			http_requests_total: Math.round(httpTotal),
			active_requests: active,
			source,
			pod: hostname,
			timestamp: new Date().toISOString()
		}),
		{ headers: { 'Content-Type': 'application/json' } }
	);
};
