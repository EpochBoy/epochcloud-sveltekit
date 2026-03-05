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
		const resp = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(promql)}`, {
			signal: controller.signal
		});
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

	// Demo counter: always local (immediate feedback for interactive demo)
	const demoCount = (await demoCounter.get()).values[0]?.value ?? 0;

	// Active requests: always local (point-in-time gauge only meaningful in real-time)
	const active = (await activeRequests.get()).values[0]?.value ?? 0;

	// HTTP total: try Prometheus for aggregated cross-pod view, fall back to local
	let httpTotal: number;
	let source: 'prometheus' | 'local';

	try {
		const h = await queryPrometheus('sum(epochcloud_http_requests_total)');
		if (!isNaN(h)) {
			httpTotal = Math.round(h);
			source = 'prometheus';
		} else {
			throw new Error('NaN result');
		}
	} catch {
		httpTotal = (await httpRequestsTotal.get()).values.reduce((sum, v) => sum + v.value, 0);
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
