import type { RequestHandler } from './$types';

interface LinkerdStats {
	available: boolean;
	request_total: number;
	success_total: number;
	failure_total: number;
	tcp_connections: number;
	proxy_memory_bytes: number;
	error?: string;
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

export const GET: RequestHandler = async () => {
	try {
		// Linkerd proxy sidecar exposes metrics on localhost:4191
		const resp = await fetch('http://localhost:4191/metrics');

		if (!resp.ok) {
			return respond({
				available: false,
				request_total: 0,
				success_total: 0,
				failure_total: 0,
				tcp_connections: 0,
				proxy_memory_bytes: 0,
				error: `Status ${resp.status}`
			});
		}

		const text = await resp.text();
		const lines = text.split('\n');

		const requestTotal = sumPrometheusMetric(lines, 'inbound_http_route_request_statuses_total');
		const tcpConns = parsePrometheusValue(lines, 'inbound_tcp_open_connections');
		const memBytes = parsePrometheusValue(lines, 'process_resident_memory_bytes');

		// Count failures (status_code >= 500)
		let failureTotal = 0;
		for (const line of lines) {
			if (line.startsWith('inbound_http_route_request_statuses_total{') && !line.startsWith('#')) {
				const statusMatch = line.match(/http_rsp_status_code="(\d+)"/);
				if (statusMatch) {
					const code = parseInt(statusMatch[1] ?? '0');
					if (code >= 500) {
						const parts = line.split(' ');
						failureTotal += parseFloat(parts[parts.length - 1] ?? '0') || 0;
					}
				}
			}
		}

		return respond({
			available: true,
			request_total: Math.round(requestTotal),
			success_total: Math.round(requestTotal - failureTotal),
			failure_total: Math.round(failureTotal),
			tcp_connections: Math.round(tcpConns),
			proxy_memory_bytes: Math.round(memBytes)
		});
	} catch (err) {
		return respond({
			available: false,
			request_total: 0,
			success_total: 0,
			failure_total: 0,
			tcp_connections: 0,
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
