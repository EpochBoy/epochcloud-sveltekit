import type { RequestHandler } from './$types';

interface DirectionStats {
	request_total: number;
	success_total: number;
	failure_total: number;
}

interface LinkerdStats {
	available: boolean;
	inbound: DirectionStats;
	outbound: DirectionStats;
	tcp_inbound: number;
	tcp_outbound: number;
	proxy_memory_bytes: number;
	error?: string;
}

function sumPrometheusMetric(lines: string[], prefix: string): number {
	let total = 0;
	for (const line of lines) {
		if (line.startsWith(prefix) && !line.startsWith('#')) {
			const parts = line.split(' ');
			total += parseFloat(parts[parts.length - 1] ?? '0') || 0;
		}
	}
	return total;
}

function parsePrometheusValue(lines: string[], metric: string): number {
	for (const line of lines) {
		if (line.startsWith(metric + ' ') || line.startsWith(metric + '{')) {
			const parts = line.split(' ');
			return parseFloat(parts[parts.length - 1] ?? '0') || 0;
		}
	}
	return 0;
}

function countFailures(lines: string[], metricPrefix: string): number {
	let total = 0;
	for (const line of lines) {
		if (line.startsWith(metricPrefix + '{') && !line.startsWith('#')) {
			const statusMatch = line.match(/http_rsp_status_code="(\d+)"/);
			if (statusMatch) {
				const code = parseInt(statusMatch[1] ?? '0');
				if (code >= 500) {
					const parts = line.split(' ');
					total += parseFloat(parts[parts.length - 1] ?? '0') || 0;
				}
			}
		}
	}
	return total;
}

function parseDirection(lines: string[], direction: 'inbound' | 'outbound'): DirectionStats {
	const requestTotal = sumPrometheusMetric(lines, `${direction}_http_route_request_statuses_total`);
	const failureTotal = countFailures(lines, `${direction}_http_route_request_statuses_total`);
	return {
		request_total: Math.round(requestTotal),
		success_total: Math.round(requestTotal - failureTotal),
		failure_total: Math.round(failureTotal)
	};
}

export const GET: RequestHandler = async () => {
	try {
		const resp = await fetch('http://localhost:4191/metrics');

		if (!resp.ok) {
			return respond({
				available: false,
				inbound: { request_total: 0, success_total: 0, failure_total: 0 },
				outbound: { request_total: 0, success_total: 0, failure_total: 0 },
				tcp_inbound: 0,
				tcp_outbound: 0,
				proxy_memory_bytes: 0,
				error: `Status ${resp.status}`
			});
		}

		const text = await resp.text();
		const lines = text.split('\n');

		return respond({
			available: true,
			inbound: parseDirection(lines, 'inbound'),
			outbound: parseDirection(lines, 'outbound'),
			tcp_inbound: Math.round(sumPrometheusMetric(lines, 'inbound_tcp_open_connections')),
			tcp_outbound: Math.round(sumPrometheusMetric(lines, 'outbound_tcp_open_connections')),
			proxy_memory_bytes: Math.round(parsePrometheusValue(lines, 'process_resident_memory_bytes'))
		});
	} catch (err) {
		return respond({
			available: false,
			inbound: { request_total: 0, success_total: 0, failure_total: 0 },
			outbound: { request_total: 0, success_total: 0, failure_total: 0 },
			tcp_inbound: 0,
			tcp_outbound: 0,
			proxy_memory_bytes: 0,
			error: String(err)
		});
	}
};

function respond(stats: LinkerdStats) {
	return new Response(JSON.stringify({ ...stats, timestamp: new Date().toISOString() }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
