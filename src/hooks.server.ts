import type { Handle } from '@sveltejs/kit';
import { config } from '$lib/server/config.js';
import { log } from '$lib/server/logger.js';
import {
	appInfo,
	httpRequestsTotal,
	httpRequestDuration,
	activeRequests
} from '$lib/server/metrics.js';
import { initRabbitMQ, startConsumer } from '$lib/server/rabbitmq.js';
import { initValkey } from '$lib/server/valkey.js';
import { initDefectDojo } from '$lib/server/defectdojo.js';
import { initSmtp } from '$lib/server/smtp.js';

// --- Initialization (runs once on server start) ---

let initialized = false;

async function init() {
	if (initialized) return;
	initialized = true;

	log('info', 'EpochCloud SvelteKit starting', {
		version: config.version,
		commit: config.commit,
		environment: config.environment,
		hostname: config.hostname,
		consumerMode: config.consumerMode
	});

	// Set app info gauge
	appInfo.set(
		{
			version: config.version,
			commit: config.commit,
			build_time: config.buildTime,
			environment: config.environment
		},
		1
	);

	// Initialize service connections
	await initRabbitMQ();
	await initValkey();
	await initDefectDojo();
	initSmtp();

	// Start RabbitMQ consumer if in consumer mode
	if (config.consumerMode) {
		await startConsumer();
		log('info', 'Consumer mode active — only /health and /metrics routes available');
	}
}

// Normalize route paths for metrics labels
function metricPath(pathname: string): string {
	// Group dynamic segments to avoid cardinality explosion
	if (pathname === '/') return '/';
	if (pathname.startsWith('/health')) return '/health';
	if (pathname.startsWith('/metrics')) return '/metrics';
	if (pathname.startsWith('/version')) return '/version';
	if (pathname.startsWith('/chaos')) return '/chaos';
	if (pathname.startsWith('/rabbitmq/status')) return '/rabbitmq/status';
	if (pathname.startsWith('/rabbitmq/publish')) return '/rabbitmq/publish';
	if (pathname.startsWith('/cache/status')) return '/cache/status';
	if (pathname.startsWith('/cache/set')) return '/cache/set';
	if (pathname.startsWith('/cache/get')) return '/cache/get';
	if (pathname.startsWith('/defectdojo/status')) return '/defectdojo/status';
	if (pathname.startsWith('/email/send')) return '/email/send';
	return pathname;
}

// Routes allowed in consumer mode
const consumerAllowedPaths = new Set(['/health', '/metrics']);

export const handle: Handle = async ({ event, resolve }) => {
	await init();

	const { pathname } = event.url;

	// Skip metrics tracking for the /metrics endpoint itself
	if (pathname === '/metrics') {
		return resolve(event);
	}

	// Consumer mode: block all routes except /health and /metrics
	if (config.consumerMode && !consumerAllowedPaths.has(pathname)) {
		return new Response('Consumer mode — only /health and /metrics available', { status: 404 });
	}

	const start = performance.now();
	const path = metricPath(pathname);
	const method = event.request.method;

	activeRequests.inc();

	try {
		const response = await resolve(event);
		const durationMs = performance.now() - start;
		const durationS = durationMs / 1000;

		httpRequestsTotal.inc({ method, path, status: String(response.status) });
		httpRequestDuration.observe({ method, path }, durationS);
		activeRequests.dec();

		log('info', 'request', {
			method,
			path: pathname,
			status: response.status,
			duration_seconds: Math.round(durationS * 1000) / 1000
		});

		return response;
	} catch (err) {
		activeRequests.dec();
		httpRequestsTotal.inc({ method, path, status: '500' });
		log('error', 'request error', { method, path: pathname, error: String(err) });
		throw err;
	}
};
