import type { RequestHandler } from './$types';
import client from 'prom-client';
import { registry, httpRequestsTotal, activeRequests } from '$lib/server/metrics.js';

// Demo counter — users can increment this to see Prometheus metrics in action
const demoCounter = new client.Counter({
	name: 'epochcloud_demo_counter_total',
	help: 'Demo counter incremented by users from the dashboard',
	registers: [registry]
});

export const GET: RequestHandler = async ({ url }) => {
	const action = url.searchParams.get('action') || 'status';

	if (action === 'increment') {
		demoCounter.inc();
	}

	// Gather our app metrics summary
	const demoCount = (await demoCounter.get()).values[0]?.value ?? 0;
	const httpTotal = (await httpRequestsTotal.get()).values.reduce((sum, v) => sum + v.value, 0);
	const active = (await activeRequests.get()).values[0]?.value ?? 0;

	return new Response(
		JSON.stringify({
			success: true,
			demo_counter: demoCount,
			http_requests_total: Math.round(httpTotal),
			active_requests: active,
			timestamp: new Date().toISOString()
		}),
		{ headers: { 'Content-Type': 'application/json' } }
	);
};
