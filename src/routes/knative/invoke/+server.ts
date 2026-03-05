import type { RequestHandler } from './$types';
import { config } from '$lib/server/config.js';
import { log } from '$lib/server/logger.js';

export const GET: RequestHandler = async ({ url }) => {
	if (!config.knative.enabled) {
		return new Response(
			JSON.stringify({ success: false, error: 'Knative not configured (KNATIVE_FIBONACCI_URL not set)' }),
			{ status: 503, headers: { 'Content-Type': 'application/json' } }
		);
	}

	const n = parseInt(url.searchParams.get('n') || '10');
	if (isNaN(n) || n < 0 || n > 50) {
		return new Response(
			JSON.stringify({ success: false, error: 'n must be between 0 and 50' }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}

	const startTime = performance.now();

	try {
		const resp = await fetch(`${config.knative.fibonacciUrl}/?n=${n}`);

		const elapsed = performance.now() - startTime;
		const body = await resp.text();

		log('info', 'Knative fibonacci invoked', { n, elapsed_ms: elapsed.toFixed(0) });

		return new Response(
			JSON.stringify({
				success: resp.ok,
				n,
				result: body.trim(),
				latency_ms: Math.round(elapsed),
				cold_start: elapsed > 2000,
				timestamp: new Date().toISOString()
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (err) {
		const elapsed = performance.now() - startTime;
		return new Response(
			JSON.stringify({
				success: false,
				error: String(err),
				latency_ms: Math.round(elapsed),
				timestamp: new Date().toISOString()
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
