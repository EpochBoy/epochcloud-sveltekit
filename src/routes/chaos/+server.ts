import type { RequestHandler } from './$types';
import { errorsTotal } from '$lib/server/metrics.js';

export const GET: RequestHandler = async ({ url }) => {
	const action = url.searchParams.get('action');

	if (action === 'error') {
		errorsTotal.inc({ type: 'chaos_test' });
		return new Response(
			JSON.stringify({
				error: 'Chaos test error',
				action: 'error',
				timestamp: new Date().toISOString()
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}

	if (action === 'slow') {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		return new Response(
			JSON.stringify({
				message: 'Slow response completed',
				action: 'slow',
				delay_ms: 2000,
				timestamp: new Date().toISOString()
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}

	if (action === 'load') {
		const count = Math.min(parseInt(url.searchParams.get('count') || '10'), 100);
		const start = performance.now();

		// Simulate concurrent load
		const promises = Array.from({ length: count }, async (_, i) => {
			// CPU-bound work simulation
			let sum = 0;
			for (let j = 0; j < 1_000_000; j++) sum += Math.sqrt(j);
			return { worker: i, result: sum };
		});

		await Promise.all(promises);
		const durationMs = performance.now() - start;

		return new Response(
			JSON.stringify({
				message: `Load test completed: ${count} concurrent operations`,
				action: 'load',
				count,
				duration_ms: Math.round(durationMs),
				timestamp: new Date().toISOString()
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}

	return new Response(
		JSON.stringify({
			error: 'Unknown action. Use ?action=error|slow|load&count=N',
			timestamp: new Date().toISOString()
		}),
		{ status: 400, headers: { 'Content-Type': 'application/json' } }
	);
};
