<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// --------------- Email state ---------------
	let emailInput = $state('');
	let emailStatus = $state('');
	let emailError = $state(false);

	// --------------- BetterAuth state ---------------
	let authStatusText = $state('Not checked');
	let authStatusOk = $state(false);
	let authResult = $state('');
	let authResultOk = $state(false);
	let authResultVisible = $state(false);
	let authRegName = $state('');
	let authRegEmail = $state('');
	let authRegPass = $state('');
	let authLoginEmail = $state('');
	let authLoginPass = $state('');

	// --------------- RabbitMQ state ---------------
	let rmqStatusText = $state('Not checked');
	let rmqStatusOk = $state(false);
	let rmqMessage = $state('');
	let rmqBatchCount = $state('5');
	let rmqResult = $state('');
	let rmqResultOk = $state(false);
	let rmqResultVisible = $state(false);
	let rmqConsumed: Array<{ message: string; timestamp: string }> = $state([]);

	// --------------- DefectDojo state ---------------
	let ddStatusText = $state('Not checked');
	let ddStatusOk = $state(false);
	let ddFindings: { total: number; by_severity: Record<string, number> } | null = $state(null);

	// --------------- Valkey state ---------------
	let vkStatusText = $state('Not checked');
	let vkStatusOk = $state(false);
	let vkSetKey = $state('demo');
	let vkSetValue = $state('hello');
	let vkSetTtl = $state('300');
	let vkGetKey = $state('demo');
	let vkResult = $state('');
	let vkResultOk = $state(false);
	let vkResultVisible = $state(false);

	// --------------- Chaos state ---------------
	interface ChaosEntry {
		action: string;
		ok: boolean;
		message: string;
		elapsedMs: number;
		raw: Record<string, unknown>;
		timestamp: string;
		services?: { service: string; status: string; latency_ms: number }[];
	}
	let chaosHistory: ChaosEntry[] = $state([]);
	let chaosLoading = $state(false);
	let chaosDegradeState: { current: number; max: number; active: boolean } | null = $state(null);
	// Chaos params
	let chaosLoadCount = $state('10');
	let chaosDelayMs = $state('2000');
	let chaosJitterMin = $state('100');
	let chaosJitterMax = $state('5000');
	let chaosCpuSec = $state('3');
	let chaosMemMb = $state('50');
	let chaosFlakyRate = $state('50');
	let chaosDegradeMax = $state('10');

	// --------------- Feature Flags state ---------------
	let ffStatusText = $state('Not checked');
	let ffStatusOk = $state(false);
	let ffFlagName = $state('maintenance-mode');
	let ffUserId = $state('user-123');
	interface FfEvalResult {
		flag: string;
		value: unknown;
		variationType?: string;
		reason?: string;
		failed?: boolean;
		error?: string;
	}
	let ffEvalResult: FfEvalResult | null = $state(null);
	let ffAllFlags: Record<
		string,
		{ value: unknown; variationType?: string; reason?: string }
	> | null = $state(null);
	let ffAllUser = $state('user-456');
	let ffError = $state('');

	// --------------- ntfy state ---------------
	let ntfyStatusText = $state('Not checked');
	let ntfyStatusOk = $state(false);
	let ntfyTopic = $state('epochcloud-demo');
	let ntfyMessage = $state('');
	let ntfyResult = $state('');
	let ntfyResultOk = $state(false);
	let ntfyResultVisible = $state(false);

	// --------------- Knative state ---------------
	let knativeN = $state('10');
	let knativeResult = $state('');
	let knativeResultOk = $state(false);
	let knativeResultVisible = $state(false);
	let knativeLoading = $state(false);

	// --------------- Active Demo Tab ---------------
	let activeDemo = $state('rabbitmq');

	// --------------- Build Bar state ---------------
	let podRotating = $state(false);
	let podRotateMsg = $state('');
	let uptime = $state('');

	// --------------- CrowdSec state ---------------
	let csStatusText = $state('Not checked');
	let csStatusOk = $state(false);
	let csIp = $state('');
	let csResult = $state('');
	let csResultOk = $state(false);
	let csResultVisible = $state(false);

	// --------------- Linkerd state ---------------
	let linkerdData: {
		inbound: { requests: number; success: number; failures: number };
		outbound: { requests: number; success: number; failures: number };
		tcp_in: number;
		tcp_out: number;
		memory_mb: string;
	} | null = $state(null);
	let linkerdPrev: {
		inbound: { requests: number; success: number; failures: number };
		outbound: { requests: number; success: number; failures: number };
		tcp_in: number;
		tcp_out: number;
		memory_mb: string;
	} | null = null;
	let linkerdRates: {
		inbound: number;
		outbound: number;
	} | null = $state(null);
	let linkerdError = $state('');
	let linkerdLoaded = $state(false);
	let linkerdLive = $state(false);
	let linkerdTrafficRunning = $state(false);
	let linkerdLastUpdated = $state('');
	let linkerdAgo = $state(0);
	let linkerdLastTs = 0;

	// --------------- Prometheus state ---------------
	let promDemoCount = $state(0);
	let promHttpTotal = $state(0);
	let promActive = $state(0);
	let promLoaded = $state(false);
	let promPod = $state('');
	let promSource = $state('');
	let promStatusBreakdown: Record<string, number> = $state({});
	let promLatency = $state({ p50: 0, p95: 0, p99: 0 });
	let promErrors = $state(0);
	let promLive = $state(false);
	let promPrevHttpTotal = $state(0);
	let promRate = $state(0);
	let promHistory: Array<{ time: string; count: number }> = $state([]);
	let promLastUpdated = $state('');
	let promAgo = $state(0);
	let promLastTs = 0;

	// =============== Handler Functions ===============

	// --- Build Bar / Pod ---
	function formatUptime(startIso: string): string {
		const diff = Date.now() - new Date(startIso).getTime();
		if (diff < 0) return 'just now';
		const s = Math.floor(diff / 1000);
		if (s < 60) return `${s}s`;
		const m = Math.floor(s / 60);
		if (m < 60) return `${m}m ${s % 60}s`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}h ${m % 60}m`;
		const d = Math.floor(h / 24);
		return `${d}d ${h % 24}h`;
	}

	function formatBuildAge(iso: string): string {
		const diff = Date.now() - new Date(iso).getTime();
		if (diff < 0) return iso;
		const h = Math.floor(diff / 3600000);
		if (h < 1) return 'just now';
		if (h < 24) return `${h}h ago`;
		const d = Math.floor(h / 24);
		return `${d}d ago`;
	}

	$effect(() => {
		uptime = formatUptime(data.startedAt);
		const tick = setInterval(() => {
			uptime = formatUptime(data.startedAt);
		}, 1000);
		return () => clearInterval(tick);
	});

	function rotatePod() {
		podRotating = true;
		podRotateMsg = 'Reloading…';
		window.location.reload();
	}

	// --- Email ---
	async function sendEmail() {
		if (!emailInput) return;
		emailStatus = 'Sending...';
		emailError = false;
		try {
			const resp = await fetch(`/email/send?email=${encodeURIComponent(emailInput)}`);
			const r = await resp.json();
			emailStatus = r.success ? `Sent to ${emailInput}` : r.error;
			emailError = !r.success;
		} catch (err) {
			emailStatus = String(err);
			emailError = true;
		}
	}

	// --- BetterAuth ---
	async function checkAuthStatus() {
		authStatusText = 'Checking...';
		try {
			const resp = await fetch('/auth/status');
			const d = await resp.json();
			authStatusOk = d.connected;
			authStatusText = d.connected
				? `Connected — ${d.health}`
				: `Disconnected${d.error ? ' — ' + d.error : ''}`;
		} catch (err) {
			authStatusText = `Error: ${err}`;
			authStatusOk = false;
		}
	}

	function showAuthResult(msg: string, ok: boolean) {
		authResult = msg;
		authResultOk = ok;
		authResultVisible = true;
	}

	async function authRegister() {
		try {
			const resp = await fetch('/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: authRegName, email: authRegEmail, password: authRegPass })
			});
			const d = await resp.json();
			showAuthResult(d.message, d.success);
		} catch (err) {
			showAuthResult(`Error: ${err}`, false);
		}
	}

	async function authLogin() {
		try {
			const resp = await fetch('/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: authLoginEmail, password: authLoginPass })
			});
			const d = await resp.json();
			showAuthResult(d.message, d.success);
		} catch (err) {
			showAuthResult(`Error: ${err}`, false);
		}
	}

	async function authSession() {
		try {
			const resp = await fetch('/auth/session');
			const d = await resp.json();
			showAuthResult(d.message + (d.data ? ' — ' + JSON.stringify(d.data) : ''), d.success);
		} catch (err) {
			showAuthResult(`Error: ${err}`, false);
		}
	}

	// --- RabbitMQ ---
	async function checkRmqStatus() {
		rmqStatusText = 'Checking...';
		try {
			const resp = await fetch('/rabbitmq/status');
			const d = await resp.json();
			rmqStatusOk = d.connected;
			rmqStatusText = d.connected ? 'Connected' : 'Disconnected';
		} catch (err) {
			rmqStatusText = `Error: ${err}`;
			rmqStatusOk = false;
		}
	}

	async function rmqPublish() {
		const msg = rmqMessage || undefined;
		const count = parseInt(rmqBatchCount) || 1;
		const results: string[] = [];

		for (let i = 0; i < count; i++) {
			try {
				const params = msg
					? `?message=${encodeURIComponent(msg + (count > 1 ? ` #${i + 1}` : ''))}`
					: '';
				const resp = await fetch(`/rabbitmq/publish${params}`);
				const d = await resp.json();
				if (!d.success) results.push(`#${i + 1}: ${d.error}`);
			} catch (err) {
				results.push(`#${i + 1}: ${err}`);
			}
		}

		if (results.length === 0) {
			rmqResult = `Published ${count} message${count > 1 ? 's' : ''}`;
			rmqResultOk = true;
		} else {
			rmqResult = `Errors: ${results.join(', ')}`;
			rmqResultOk = false;
		}
		rmqResultVisible = true;
	}

	async function rmqConsume() {
		try {
			const resp = await fetch('/rabbitmq/consume');
			const d = await resp.json();
			rmqConsumed = d.messages || [];
			const consumers = d.consumerCount ?? 0;
			rmqResult = `${d.count} message${d.count !== 1 ? 's' : ''} in queue, ${consumers} consumer${consumers !== 1 ? 's' : ''}`;
			rmqResultOk = true;
			rmqResultVisible = true;
		} catch (err) {
			rmqResult = `Error: ${err}`;
			rmqResultOk = false;
			rmqResultVisible = true;
		}
	}

	// --- DefectDojo ---
	async function checkDdStatus() {
		ddStatusText = 'Checking...';
		try {
			const resp = await fetch('/defectdojo/status');
			const d = await resp.json();
			ddStatusOk = d.connected;
			ddStatusText = d.connected ? `Connected — ${d.product_count} products` : 'Disconnected';

			if (d.connected) {
				const fr = await fetch('/defectdojo/findings');
				const f = await fr.json();
				if (f.success) ddFindings = f.findings;
			}
		} catch (err) {
			ddStatusText = `Error: ${err}`;
			ddStatusOk = false;
		}
	}

	// --- Valkey ---
	async function checkVkStatus() {
		vkStatusText = 'Checking...';
		try {
			const resp = await fetch('/cache/status');
			const d = await resp.json();
			vkStatusOk = d.connected;
			vkStatusText = d.connected ? 'Connected' : 'Disconnected';
		} catch (err) {
			vkStatusText = `Error: ${err}`;
			vkStatusOk = false;
		}
	}

	async function vkSet() {
		try {
			const resp = await fetch(
				`/cache/set?key=${encodeURIComponent(vkSetKey)}&value=${encodeURIComponent(vkSetValue)}&ttl=${vkSetTtl}`
			);
			const d = await resp.json();
			vkResult = d.success ? `Set "${d.key}" = "${d.value}" (TTL: ${d.ttl_seconds}s)` : d.error;
			vkResultOk = d.success;
			vkResultVisible = true;
		} catch (err) {
			vkResult = String(err);
			vkResultOk = false;
			vkResultVisible = true;
		}
	}

	async function vkGet() {
		try {
			const resp = await fetch(`/cache/get?key=${encodeURIComponent(vkGetKey)}`);
			const d = await resp.json();
			vkResult = d.cache_hit ? `"${d.key}" = "${d.value}"` : `Cache miss for "${d.key}"`;
			vkResultOk = d.cache_hit;
			vkResultVisible = true;
		} catch (err) {
			vkResult = String(err);
			vkResultOk = false;
			vkResultVisible = true;
		}
	}

	// --- Chaos ---
	function formatChaosMessage(d: Record<string, unknown>, action: string): string {
		switch (action) {
			case 'cpu':
				return `CPU burn: ${d.seconds}s, ${Number(d.iterations).toLocaleString()} iterations (${d.duration_ms}ms)`;
			case 'memory':
				return `Memory spike: ${d.mb_allocated}MB held for 2s (alloc ${d.alloc_ms}ms)`;
			case 'slow':
				return `Fixed delay: ${d.delay_ms}ms`;
			case 'jitter':
				return `Jitter: ${d.delay_ms}ms (range ${d.min_ms}–${d.max_ms}ms)`;
			case 'timeout':
				return `Timeout simulation: ${d.delay_ms}ms`;
			case 'load':
				return `Concurrent load: ${d.count} ops in ${d.duration_ms}ms`;
			case 'flaky':
				return d.failed ? `Flaky FAILED (${d.rate}% rate)` : `Flaky OK (${d.rate}% rate)`;
			case 'cascade':
				return `Cascade: ${(d.services as unknown[])?.length || 0} services checked in ${d.total_ms}ms`;
			case 'degrade':
				return `Degradation #${d.request_number}: ${d.delay_ms}ms delay${d.saturated ? ' (saturated!)' : ''}`;
			case 'degrade-reset':
				return String(d.message || 'Counter reset');
			default:
				return String(d.message || d.error || 'Done');
		}
	}

	async function chaosAction(action: string, params: Record<string, string> = {}) {
		chaosLoading = true;
		const start = performance.now();
		const qs = new URLSearchParams({ action, ...params }).toString();
		try {
			const resp = await fetch(`/chaos?${qs}`);
			const d = await resp.json();
			const elapsedMs = Math.round(performance.now() - start);
			// Track degradation state
			if (action === 'degrade') {
				chaosDegradeState = {
					current: d.request_number as number,
					max: d.max_requests as number,
					active: true
				};
			} else if (action === 'degrade-reset') {
				chaosDegradeState = null;
			}
			chaosHistory = [
				{
					action,
					ok: !d.error,
					message: formatChaosMessage(d, action),
					elapsedMs,
					raw: d,
					timestamp: new Date().toISOString(),
					services: d.services as ChaosEntry['services']
				},
				...chaosHistory
			].slice(0, 20);
		} catch (err) {
			const elapsedMs = Math.round(performance.now() - start);
			chaosHistory = [
				{
					action,
					ok: false,
					message: `Error: ${err}`,
					elapsedMs,
					raw: {},
					timestamp: new Date().toISOString()
				},
				...chaosHistory
			].slice(0, 20);
		}
		chaosLoading = false;
	}

	// --- Feature Flags ---
	async function checkFfStatus() {
		ffStatusText = 'Checking...';
		try {
			const resp = await fetch('/features/status');
			const d = await resp.json();
			ffStatusOk = d.connected;
			ffStatusText = d.connected
				? `Connected — ${d.flags_available || 0} flags`
				: `Disconnected${d.error ? ' — ' + d.error : ''}`;
		} catch (err) {
			ffStatusText = `Error: ${err}`;
			ffStatusOk = false;
		}
	}

	async function ffEvaluate() {
		ffError = '';
		ffEvalResult = null;
		try {
			const resp = await fetch(
				`/features/evaluate?flag=${encodeURIComponent(ffFlagName)}&user=${encodeURIComponent(ffUserId)}`
			);
			const d = await resp.json();
			if (d.error) {
				ffError = d.error;
			} else {
				ffEvalResult = d;
			}
		} catch (err) {
			ffError = `Error: ${err}`;
		}
	}

	async function ffEvalAll() {
		ffError = '';
		ffAllFlags = null;
		try {
			const resp = await fetch(`/features/all?user=${encodeURIComponent(ffAllUser)}`);
			const d = await resp.json();
			if (d.error) {
				ffError = d.error;
			} else {
				ffAllFlags = d;
			}
		} catch (err) {
			ffError = `Error: ${err}`;
		}
	}

	// --- ntfy ---
	async function checkNtfyStatus() {
		ntfyStatusText = 'Checking...';
		try {
			const resp = await fetch('/ntfy/status');
			const d = await resp.json();
			ntfyStatusOk = d.connected;
			ntfyStatusText = d.connected ? 'Connected' : `Disconnected${d.error ? ' — ' + d.error : ''}`;
		} catch (err) {
			ntfyStatusText = `Error: ${err}`;
			ntfyStatusOk = false;
		}
	}

	async function ntfySend() {
		try {
			const resp = await fetch('/ntfy/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic: ntfyTopic,
					message: ntfyMessage || `Hello from EpochCloud at ${new Date().toLocaleTimeString()}`
				})
			});
			const d = await resp.json();
			ntfyResult = d.success ? `Sent to "${d.topic}"` : d.error;
			ntfyResultOk = d.success;
			ntfyResultVisible = true;
		} catch (err) {
			ntfyResult = String(err);
			ntfyResultOk = false;
			ntfyResultVisible = true;
		}
	}

	// --- Knative ---
	async function knativeInvoke() {
		knativeLoading = true;
		knativeResultVisible = false;
		try {
			const resp = await fetch(`/knative/invoke?n=${knativeN}`);
			const d = await resp.json();
			if (d.success) {
				knativeResult = `F(${d.n}) = ${d.result}\nLatency: ${d.latency_ms}ms${d.cold_start ? ' (cold start!)' : ''}${d.duration ? `\nCompute: ${d.duration}` : ''}`;
				knativeResultOk = true;
			} else {
				knativeResult = d.error || 'Unknown error';
				knativeResultOk = false;
			}
			knativeResultVisible = true;
		} catch (err) {
			knativeResult = String(err);
			knativeResultOk = false;
			knativeResultVisible = true;
		}
		knativeLoading = false;
	}

	// --- CrowdSec ---
	async function checkCsStatus() {
		csStatusText = 'Checking...';
		try {
			const resp = await fetch('/crowdsec/status');
			const d = await resp.json();
			csStatusOk = d.connected;
			csStatusText = d.connected ? 'Connected' : `Disconnected${d.error ? ' — ' + d.error : ''}`;
		} catch (err) {
			csStatusText = `Error: ${err}`;
			csStatusOk = false;
		}
	}

	async function csCheckIp() {
		if (!csIp) return;
		try {
			const resp = await fetch(`/crowdsec/decisions?ip=${encodeURIComponent(csIp)}`);
			const d = await resp.json();
			if (d.success) {
				csResult = d.blocked
					? `BLOCKED — ${d.decisions.length} decision(s)`
					: 'Clean — no active decisions';
				csResultOk = !d.blocked;
			} else {
				csResult = d.error;
				csResultOk = false;
			}
			csResultVisible = true;
		} catch (err) {
			csResult = String(err);
			csResultOk = false;
			csResultVisible = true;
		}
	}

	// --- Linkerd ---
	async function loadLinkerdStats() {
		try {
			const resp = await fetch('/linkerd/stats');
			const d = await resp.json();
			if (d.available) {
				const newData = {
					inbound: {
						requests: d.inbound.request_total,
						success: d.inbound.success_total,
						failures: d.inbound.failure_total
					},
					outbound: {
						requests: d.outbound.request_total,
						success: d.outbound.success_total,
						failures: d.outbound.failure_total
					},
					tcp_in: d.tcp_inbound,
					tcp_out: d.tcp_outbound,
					memory_mb: (d.proxy_memory_bytes / 1024 / 1024).toFixed(1)
				};
				// Calculate rates (delta since last poll)
				if (linkerdData) {
					linkerdRates = {
						inbound: Math.max(0, newData.inbound.requests - linkerdData.inbound.requests),
						outbound: Math.max(0, newData.outbound.requests - linkerdData.outbound.requests)
					};
				}
				linkerdPrev = linkerdData;
				linkerdData = newData;
				linkerdError = '';
			} else {
				linkerdData = null;
				linkerdError = d.error || 'Linkerd proxy not available';
			}
			linkerdLoaded = true;
			const now = new Date();
			linkerdLastUpdated = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
			linkerdLastTs = Date.now();
			linkerdAgo = 0;
		} catch (err) {
			linkerdData = null;
			linkerdError = String(err);
			linkerdLoaded = true;
		}
	}

	async function linkerdGenerateTraffic() {
		linkerdTrafficRunning = true;
		const endpoints = [
			'/linkerd/stats',
			'/prometheus/demo',
			'/rabbitmq/status',
			'/valkey/get?key=chaos-test',
			'/features/status',
			'/crowdsec/status',
			'/ntfy/status'
		];
		for (let round = 0; round < 3; round++) {
			await Promise.allSettled(endpoints.map((e) => fetch(e)));
			await new Promise((r) => setTimeout(r, 200));
		}
		await loadLinkerdStats();
		linkerdTrafficRunning = false;
	}

	// Auto-start live mode when Linkerd tab opens
	$effect(() => {
		if (activeDemo === 'linkerd') {
			linkerdLive = true;
			loadLinkerdStats();
		} else {
			linkerdLive = false;
		}
	});

	// Auto-refresh Linkerd stats while tab is active
	$effect(() => {
		if (activeDemo !== 'linkerd' || !linkerdLive) return;
		const id = setInterval(loadLinkerdStats, 3000);
		return () => clearInterval(id);
	});

	// Tick Linkerd "ago" counter every second
	$effect(() => {
		if (!linkerdLoaded || activeDemo !== 'linkerd') return;
		const tick = setInterval(() => {
			if (linkerdLastTs > 0) linkerdAgo = Math.floor((Date.now() - linkerdLastTs) / 1000);
		}, 1000);
		return () => clearInterval(tick);
	});

	// --- Prometheus ---
	async function loadPromMetrics(increment = false, burst = 1) {
		try {
			const action = increment ? 'increment' : 'status';
			const params = new URLSearchParams({ action });
			if (increment && burst > 1) params.set('burst', String(burst));
			const resp = await fetch(`/prometheus/demo?${params}`);
			const d = await resp.json();
			promPrevHttpTotal = promHttpTotal;
			promDemoCount = d.demo_counter;
			promHttpTotal = d.http_requests_total;
			promActive = d.active_requests;
			promPod = d.pod || '';
			promSource = d.source || '';
			promStatusBreakdown = d.status_breakdown || {};
			promLatency = d.latency || { p50: 0, p95: 0, p99: 0 };
			promErrors = d.errors || 0;
			if (promPrevHttpTotal > 0) {
				promRate = promHttpTotal - promPrevHttpTotal;
			}
			if (increment) {
				const now = new Date();
				promHistory = [
					{
						time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
						count: burst
					},
					...promHistory
				].slice(0, 15);
			}
			const now = new Date();
			promLastUpdated = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
			promLastTs = Date.now();
			promAgo = 0;
			promLoaded = true;
		} catch {
			promLoaded = false;
		}
	}

	// Auto-start live mode when Prometheus tab opens
	$effect(() => {
		if (activeDemo === 'prometheus') {
			promLive = true;
			loadPromMetrics(false);
		} else {
			promLive = false;
		}
	});

	$effect(() => {
		if (!promLive || activeDemo !== 'prometheus') return;
		const interval = setInterval(() => loadPromMetrics(false), 3000);
		return () => clearInterval(interval);
	});

	// Tick "ago" counter every second
	$effect(() => {
		if (!promLoaded || activeDemo !== 'prometheus') return;
		const tick = setInterval(() => {
			if (promLastTs > 0) promAgo = Math.floor((Date.now() - promLastTs) / 1000);
		}, 1000);
		return () => clearInterval(tick);
	});

	// =============== Static Data ===============

	function envBadgeClass(env: string): string {
		switch (env) {
			case 'prod':
				return 'badge-prod';
			case 'staging':
				return 'badge-staging';
			default:
				return 'badge-dev';
		}
	}

	const stages = [
		{ label: 'Dev', prefix: 'demo-dev' },
		{ label: 'Staging', prefix: 'demo-staging' },
		{ label: 'Prod', prefix: 'demo' }
	];

	const stackOnline = [
		'Proxmox VE + OpenTofu',
		'Talos OS + K8s 1.35',
		'Karpenter',
		'Cilium + Hubble',
		'WireGuard Encryption',
		'ArgoCD',
		'OpenBao',
		'External Secrets Operator',
		'SOPS + age',
		'helm-secrets',
		'Traefik + cert-manager',
		'Cloudflare Zero Trust',
		'Keycloak SSO',
		'oauth2-proxy',
		'Longhorn Storage',
		'CloudNativePG',
		'Harbor Registry',
		'Argo Workflows CI',
		'Argo Events',
		'Kyverno Policies',
		'Cosign Signing',
		'Syft + Grype',
		'Semgrep + Trivy',
		'OWASP ZAP',
		'Headlamp',
		'Renovate',
		'ArgoCD Image Updater',
		'Kargo Promotions',
		'Argo Rollouts',
		'Linkerd mTLS',
		'Prometheus + AlertManager',
		'Grafana',
		'Alloy Collector',
		'Loki Logs',
		'Tempo Traces',
		'ntfy Notifications',
		'Goldilocks VPA',
		'HPA Autoscaling',
		'KEDA Scaling',
		'VPA Right-sizing',
		'KRR Analysis',
		'Velero Backups',
		'Velero UI',
		'SeaweedFS S3',
		'RabbitMQ',
		'Valkey Cache',
		'CrowdSec Threat Intel'
	];

	const stackReview = [
		'LitmusChaos',
		'fail2ban',
		'Falco Runtime',
		'Falcosidekick',
		'DefectDojo',
		'Rybbit Analytics',
		'Knative Serving',
		'Sigma LogQL',
		'Maddy SMTP',
		'BetterAuth + Hono',
		'GO Feature Flag',
		'Resend Email'
	];

	const stackPending = ['Cluster Honeypot'];

	const dashboards = [
		{ name: 'Grafana', sub: 'grafana', desc: 'Metrics & Dashboards' },
		{ name: 'Headlamp', sub: 'headlamp', desc: 'K8s Dashboard' },
		{ name: 'Keycloak', sub: 'auth', desc: 'Identity Provider' },
		{ name: 'ArgoCD', sub: 'argocd', desc: 'GitOps Delivery' },
		{ name: 'Traefik', sub: 'traefik', desc: 'Ingress Proxy' },
		{ name: 'Harbor', sub: 'registry', desc: 'Container Registry' },
		{ name: 'Kargo', sub: 'kargo', desc: 'Staged Promotions' },
		{ name: 'Longhorn', sub: 'longhorn', desc: 'Block Storage' },
		{ name: 'OpenBao', sub: 'bao', desc: 'Secrets Vault' },
		{ name: 'Workflows', sub: 'workflows', desc: 'CI Pipelines' },
		{ name: 'Rollouts', sub: 'rollouts', desc: 'Progressive Delivery' },
		{ name: 'Hubble', sub: 'hubble', desc: 'Network Observability' },
		{ name: 'Linkerd', sub: 'linkerd', desc: 'Service Mesh' },
		{ name: 'Goldilocks', sub: 'goldilocks', desc: 'Resource Tuning' },
		{ name: 'Velero', sub: 'velero', desc: 'Backup Management' },
		{ name: 'RabbitMQ', sub: 'rabbitmq', desc: 'Message Broker' },
		{ name: 'DefectDojo', sub: 'defectdojo', desc: 'Vulnerability Mgmt' },
		{ name: 'ntfy', sub: 'ntfy', desc: 'Push Notifications' },
		{ name: 'Rybbit', sub: 'analytics', desc: 'Web Analytics' },
		{ name: 'LitmusChaos', sub: 'chaos', desc: 'Chaos Engineering' }
	];

	// =============== Auto-check on mount ===============
	$effect(() => {
		checkAuthStatus();
		checkRmqStatus();
		checkVkStatus();
		checkNtfyStatus();
		checkCsStatus();
		checkDdStatus();
		checkFfStatus();
		loadPromMetrics();
		loadLinkerdStats();
	});

	const severityColors: Record<string, string> = {
		Critical: 'var(--danger)',
		High: '#f97316',
		Medium: 'var(--warning)',
		Low: 'var(--accent)',
		Info: 'var(--muted-fg)'
	};
</script>

{#snippet statusIcon(ok: boolean, checked: boolean)}
	<span class="status-icon" class:ok class:checked>
		{#if checked}
			{#if ok}
				<svg viewBox="0 0 16 16" fill="currentColor"
					><path
						d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
					/></svg
				>
			{:else}
				<svg viewBox="0 0 16 16" fill="currentColor"
					><path
						d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"
					/></svg
				>
			{/if}
		{/if}
	</span>
{/snippet}

<svelte:head>
	<title>EpochCloud</title>
</svelte:head>

<div class="dashboard">
	<!-- ─── Header ─── -->
	<header class="header">
		<div class="header-row">
			<h1 class="logo">EpochCloud</h1>
			<span class="env-badge {envBadgeClass(data.environment)}">{data.environment}</span>
		</div>
		<p class="tagline">Infrastructure Dashboard</p>
		<nav class="stage-nav">
			{#each stages as stage (stage.label)}
				<a
					href="https://{stage.prefix}.{data.domain}"
					class="stage-pill"
					class:active={data.environment ===
						(stage.label === 'Prod' ? 'prod' : stage.label.toLowerCase())}
				>
					{stage.label}
				</a>
			{/each}
		</nav>
	</header>

	<!-- ─── Build Info ─── -->
	<section class="build-bar">
		<div class="build-top">
			<div class="build-items">
				<div class="build-item">
					<span class="build-label">Version</span>
					<span class="build-value build-version">{data.version}</span>
				</div>
				<span class="build-sep"></span>
				<div class="build-item">
					<span class="build-label">Commit</span>
					<span class="build-value"
						><code class="build-commit">{data.commit.substring(0, 7)}</code></span
					>
				</div>
				<span class="build-sep"></span>
				<div class="build-item">
					<span class="build-label">Built</span>
					<span class="build-value" title={data.buildTime}>{formatBuildAge(data.buildTime)}</span>
				</div>
				<span class="build-sep"></span>
				<div class="build-item">
					<span class="build-label">Uptime</span>
					<span class="build-value build-uptime">{uptime}</span>
				</div>
				<span class="build-sep"></span>
				<div class="build-item">
					<span class="build-label">Environment</span>
					<span class="build-value"
						><span class="build-env-badge badge-{data.environment}">{data.environment}</span></span
					>
				</div>
			</div>
		</div>
		<div class="build-pod-row">
			<div class="build-pod-info">
				<span class="build-label">Pod</span>
				<span class="build-value build-pod-name">{data.hostname}</span>
			</div>
			<button
				class="btn btn-outline btn-sm build-rotate-btn"
				onclick={rotatePod}
				disabled={podRotating}
			>
				{podRotating ? '↻ Rotating...' : '↻ Rotate Pod'}
			</button>
			{#if podRotateMsg}
				<span class="build-rotate-msg">{podRotateMsg}</span>
			{/if}
		</div>
		<div class="pipeline">
			{#each [{ name: 'Git Push', icon: '⬆' }, { name: 'Argo Workflows', icon: '⚙' }, { name: 'Harbor', icon: '📦' }, { name: 'Kargo', icon: '🚀' }, { name: 'ArgoCD', icon: '🔄' }] as step, i (step.name)}
				{#if i > 0}<span class="pipe-connector"></span>{/if}
				<div class="pipe-step">
					<span class="pipe-icon">{step.icon}</span>
					<span class="pipe-name">{step.name}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- ─── Platform Stack ─── -->
	<section class="section">
		<div class="section-head">
			<h2 class="section-title">Platform Stack</h2>
			<span class="count-badge"
				>{stackOnline.length + stackReview.length + stackPending.length}</span
			>
		</div>

		<div class="stack-groups">
			<div class="stack-group">
				<div class="stack-group-head">
					<span class="dot dot-online"></span>
					<span class="stack-group-label">Online</span>
					<span class="stack-group-count">{stackOnline.length}</span>
				</div>
				<div class="chip-grid">
					{#each stackOnline as item (item)}
						<span class="chip chip-online">{item}</span>
					{/each}
				</div>
			</div>

			<div class="stack-group">
				<div class="stack-group-head">
					<span class="dot dot-review"></span>
					<span class="stack-group-label">Under Review</span>
					<span class="stack-group-count">{stackReview.length}</span>
				</div>
				<div class="chip-grid">
					{#each stackReview as item (item)}
						<span class="chip chip-review">{item}</span>
					{/each}
				</div>
			</div>

			<div class="stack-group">
				<div class="stack-group-head">
					<span class="dot dot-pending"></span>
					<span class="stack-group-label">Pending</span>
					<span class="stack-group-count">{stackPending.length}</span>
				</div>
				<div class="chip-grid">
					{#each stackPending as item (item)}
						<span class="chip chip-pending">{item}</span>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- ─── Dashboards ─── -->
	<section class="section">
		<div class="section-head">
			<h2 class="section-title">Dashboards</h2>
			<span class="count-badge">{dashboards.length}</span>
		</div>
		<div class="dash-grid">
			{#each dashboards as db (db.sub)}
				<a href="https://{db.sub}.{data.domain}" target="_blank" rel="noopener" class="dash-card">
					<span class="dash-name">{db.name}</span>
					<span class="dash-desc">{db.desc}</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- ─── Live Demos ─── -->
	<section class="section">
		<div class="section-head">
			<h2 class="section-title">Live Demos</h2>
			<span class="count-badge">12</span>
		</div>

		<div class="demo-tabs">
			<button
				class="demo-tab"
				class:active={activeDemo === 'rabbitmq'}
				onclick={() => (activeDemo = 'rabbitmq')}
			>
				{#if rmqStatusText !== 'Not checked'}<span class="tab-dot" class:ok={rmqStatusOk}
					></span>{/if}
				RabbitMQ
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'valkey'}
				onclick={() => (activeDemo = 'valkey')}
			>
				{#if vkStatusText !== 'Not checked'}<span class="tab-dot" class:ok={vkStatusOk}></span>{/if}
				Valkey
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'email'}
				onclick={() => (activeDemo = 'email')}
			>
				Email
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'betterauth'}
				onclick={() => (activeDemo = 'betterauth')}
			>
				{#if authStatusText !== 'Not checked'}<span class="tab-dot" class:ok={authStatusOk}
					></span>{/if}
				BetterAuth
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'crowdsec'}
				onclick={() => (activeDemo = 'crowdsec')}
			>
				{#if csStatusText !== 'Not checked'}<span class="tab-dot" class:ok={csStatusOk}></span>{/if}
				CrowdSec
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'defectdojo'}
				onclick={() => (activeDemo = 'defectdojo')}
			>
				{#if ddStatusText !== 'Not checked'}<span class="tab-dot" class:ok={ddStatusOk}></span>{/if}
				DefectDojo
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'prometheus'}
				onclick={() => (activeDemo = 'prometheus')}
			>
				Prometheus
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'linkerd'}
				onclick={() => (activeDemo = 'linkerd')}
			>
				Linkerd
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'chaos'}
				onclick={() => (activeDemo = 'chaos')}
			>
				Chaos Testing
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'featureflags'}
				onclick={() => (activeDemo = 'featureflags')}
			>
				{#if ffStatusText !== 'Not checked'}<span class="tab-dot" class:ok={ffStatusOk}></span>{/if}
				Feature Flags
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'ntfy'}
				onclick={() => (activeDemo = 'ntfy')}
			>
				{#if ntfyStatusText !== 'Not checked'}<span class="tab-dot" class:ok={ntfyStatusOk}
					></span>{/if}
				ntfy
			</button>
			<button
				class="demo-tab"
				class:active={activeDemo === 'knative'}
				onclick={() => (activeDemo = 'knative')}
			>
				Knative
			</button>
		</div>

		{#if activeDemo === 'rabbitmq'}
			<div class="card">
				<div class="card-head">
					<h3>RabbitMQ</h3>
					<span class="card-tag">Message Queue</span>
				</div>
				<div class="status-row">
					<button onclick={checkRmqStatus} class="btn btn-outline btn-sm">Check Status</button>
					{@render statusIcon(rmqStatusOk, rmqStatusText !== 'Not checked')}
					<span class="status-text">{rmqStatusText}</span>
				</div>
				{#if data.features.rabbitmq}
					<div class="form-cols">
						<div class="form-col">
							<span class="form-label">Publish</span>
							<div class="input-row">
								<span class="input-label">Message</span>
								<input type="text" bind:value={rmqMessage} placeholder="optional" class="input" />
							</div>
							<div class="input-row">
								<span class="input-label">Count</span>
								<input
									type="number"
									bind:value={rmqBatchCount}
									min="1"
									max="50"
									class="input input-sm"
									style="max-width:70px"
								/>
							</div>
							<button onclick={rmqPublish} class="btn btn-primary btn-sm w-full">Publish</button>
						</div>
						<div class="form-col">
							<span class="form-label">Consume</span>
							<button onclick={rmqConsume} class="btn btn-outline btn-sm w-full"
								>Check Buffer</button
							>
						</div>
					</div>
					{#if rmqResultVisible}
						<p class="result" class:ok={rmqResultOk} class:err={!rmqResultOk}>{rmqResult}</p>
					{/if}
					{#if rmqConsumed.length > 0}
						<div class="consumed-list">
							{#each rmqConsumed.slice(0, 5) as msg (msg.timestamp)}
								<div class="consumed-item">
									<span class="consumed-msg">{msg.message}</span>
									<span class="consumed-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
								</div>
							{/each}
						</div>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — RABBITMQ_HOST not set</p>
				{/if}
			</div>
		{:else if activeDemo === 'valkey'}
			<div class="card">
				<div class="card-head">
					<h3>Valkey Cache</h3>
					<span class="card-tag">Key-Value Store</span>
				</div>
				<div class="status-row">
					<button onclick={checkVkStatus} class="btn btn-outline btn-sm">Check Status</button>
					{@render statusIcon(vkStatusOk, vkStatusText !== 'Not checked')}
					<span class="status-text">{vkStatusText}</span>
				</div>
				{#if data.features.valkey}
					<div class="form-cols">
						<div class="form-col">
							<span class="form-label">Set Value</span>
							<div class="input-row">
								<span class="input-label">Key</span>
								<input type="text" bind:value={vkSetKey} placeholder="demo" class="input" />
							</div>
							<div class="input-row">
								<span class="input-label">Value</span>
								<input type="text" bind:value={vkSetValue} placeholder="hello" class="input" />
							</div>
							<div class="input-row">
								<span class="input-label">TTL</span>
								<input type="number" bind:value={vkSetTtl} placeholder="300" class="input" />
								<span class="input-unit">sec</span>
							</div>
							<button onclick={vkSet} class="btn btn-primary btn-sm w-full">Set</button>
						</div>
						<div class="form-col">
							<span class="form-label">Get Value</span>
							<div class="input-row">
								<span class="input-label">Key</span>
								<input type="text" bind:value={vkGetKey} placeholder="demo" class="input" />
							</div>
							<button onclick={vkGet} class="btn btn-secondary btn-sm w-full">Get</button>
						</div>
					</div>
					{#if vkResultVisible}
						<p class="result" class:ok={vkResultOk} class:err={!vkResultOk}>{vkResult}</p>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — VALKEY_HOST not set</p>
				{/if}
			</div>
		{:else if activeDemo === 'email'}
			<div class="card">
				<div class="card-head">
					<h3>Email</h3>
					<span class="card-tag">SMTP</span>
				</div>
				{#if data.features.smtp}
					<div class="form-row">
						<input
							type="email"
							bind:value={emailInput}
							placeholder="recipient@example.com"
							class="input"
						/>
						<button onclick={sendEmail} class="btn btn-primary btn-sm">Send</button>
					</div>
					{#if emailStatus}
						<p class="result" class:ok={!emailError} class:err={emailError}>{emailStatus}</p>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — SMTP_HOST not set</p>
				{/if}
			</div>
		{:else if activeDemo === 'betterauth'}
			<div class="card">
				<div class="card-head">
					<h3>BetterAuth</h3>
					<span class="card-tag">App Auth</span>
				</div>
				<div class="status-row">
					<button onclick={checkAuthStatus} class="btn btn-outline btn-sm">Check Status</button>
					{@render statusIcon(authStatusOk, authStatusText !== 'Not checked')}
					<span class="status-text">{authStatusText}</span>
				</div>
				{#if data.features.betterauth}
					<div class="form-cols">
						<div class="form-col">
							<span class="form-label">Register</span>
							<input type="text" bind:value={authRegName} placeholder="Name" class="input" />
							<input type="email" bind:value={authRegEmail} placeholder="Email" class="input" />
							<input
								type="password"
								bind:value={authRegPass}
								placeholder="Password"
								class="input"
							/>
							<button onclick={authRegister} class="btn btn-primary btn-sm w-full">Register</button>
						</div>
						<div class="form-col">
							<span class="form-label">Login</span>
							<input type="email" bind:value={authLoginEmail} placeholder="Email" class="input" />
							<input
								type="password"
								bind:value={authLoginPass}
								placeholder="Password"
								class="input"
							/>
							<button onclick={authLogin} class="btn btn-secondary btn-sm w-full">Login</button>
						</div>
					</div>
					<button onclick={authSession} class="btn btn-ghost w-full">Validate Session</button>
					{#if authResultVisible}
						<p class="result" class:ok={authResultOk} class:err={!authResultOk}>{authResult}</p>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — BETTERAUTH_URL not set</p>
				{/if}
			</div>
		{:else if activeDemo === 'crowdsec'}
			<div class="card">
				<div class="card-head">
					<h3>CrowdSec</h3>
					<span class="card-tag">Threat Intel</span>
				</div>
				<div class="status-row">
					<button onclick={checkCsStatus} class="btn btn-outline btn-sm">Check Status</button>
					{@render statusIcon(csStatusOk, csStatusText !== 'Not checked')}
					<span class="status-text">{csStatusText}</span>
				</div>
				{#if data.features.crowdsec}
					<div class="form-row">
						<input type="text" bind:value={csIp} placeholder="IP address" class="input" />
						<button onclick={csCheckIp} class="btn btn-secondary btn-sm">Check IP</button>
					</div>
					{#if csResultVisible}
						<p class="result" class:ok={csResultOk} class:err={!csResultOk}>{csResult}</p>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — CROWDSEC_LAPI_URL not set</p>
				{/if}
			</div>
		{:else if activeDemo === 'defectdojo'}
			<div class="card">
				<div class="card-head">
					<h3>DefectDojo</h3>
					<span class="card-tag">Security</span>
				</div>
				<div class="status-row">
					<button onclick={checkDdStatus} class="btn btn-outline btn-sm">Check Status</button>
					{@render statusIcon(ddStatusOk, ddStatusText !== 'Not checked')}
					<span class="status-text">{ddStatusText}</span>
				</div>
				{#if ddFindings}
					<div class="findings-grid">
						{#each Object.entries(ddFindings.by_severity) as [sev, count] (sev)}
							<div class="finding-item">
								<span
									class="finding-dot"
									style="background:{severityColors[sev] || 'var(--muted-fg)'}"
								></span>
								<span class="finding-label">{sev}</span>
								<span class="finding-count">{count}</span>
							</div>
						{/each}
						<div class="finding-item finding-total">
							<span class="finding-label">Total</span>
							<span class="finding-count">{ddFindings.total}</span>
						</div>
					</div>
				{/if}
				{#if data.features.defectdojo && data.domain}
					<a
						href="https://defectdojo.{data.domain}"
						target="_blank"
						rel="noopener"
						class="btn btn-ghost btn-sm w-full"
						style="margin-top:0.5rem">Open Dashboard</a
					>
				{:else if !data.features.defectdojo}
					<p class="disabled-msg">Not configured — DEFECTDOJO_URL not set</p>
				{/if}
			</div>
		{:else if activeDemo === 'prometheus'}
			<div class="card">
				<div class="card-head">
					<h3>Prometheus</h3>
					<span class="card-tag">Metrics</span>
				</div>
				<p class="card-desc">
					Counter &amp; in-flight are per-pod, HTTP total aggregated via Prometheus
				</p>
				<div class="prom-controls">
					<button onclick={() => loadPromMetrics(true)} class="btn btn-primary btn-sm">+1</button>
					<button onclick={() => loadPromMetrics(true, 5)} class="btn btn-primary btn-sm">+5</button
					>
					<button onclick={() => loadPromMetrics(true, 25)} class="btn btn-primary btn-sm"
						>+25</button
					>
					<button onclick={() => loadPromMetrics(false)} class="btn btn-outline btn-sm"
						>Refresh</button
					>
					<button
						class="btn btn-sm"
						class:btn-outline={!promLive}
						class:btn-ok={promLive}
						onclick={() => {
							promLive = !promLive;
							if (promLive) loadPromMetrics(false);
						}}
					>
						{#if promLive}<span class="live-dot"></span>{/if}
						{promLive ? 'Live' : 'Auto-refresh'}
					</button>
				</div>
				{#if promLoaded}
					<div class="prom-stats">
						<div class="prom-stat">
							<span class="prom-val">{promDemoCount.toLocaleString()}</span>
							<span class="prom-label">Demo Counter</span>
							<span class="prom-scope">this pod</span>
						</div>
						<div class="prom-stat">
							<span class="prom-val">{promHttpTotal.toLocaleString()}</span>
							<span class="prom-label">HTTP Total</span>
							<span class="prom-scope"
								>{promSource === 'prometheus' ? 'all pods' : 'this pod'}{promRate > 0
									? ` · +${promRate}`
									: ''}</span
							>
						</div>
						<div class="prom-stat">
							<span class="prom-val">{promActive}</span>
							<span class="prom-label">In-Flight</span>
							<span class="prom-scope">this pod</span>
						</div>
						<div class="prom-stat">
							<span class="prom-val" class:prom-val-err={promErrors > 0}>{promErrors}</span>
							<span class="prom-label">Errors</span>
							<span class="prom-scope">this pod</span>
						</div>
					</div>

					<!-- Latency percentiles -->
					{#if promLatency.p50 > 0 || promLatency.p95 > 0}
						<div class="prom-latency">
							<span class="prom-latency-title">Latency</span>
							<div class="prom-latency-bars">
								{#each [{ label: 'p50', val: promLatency.p50 }, { label: 'p95', val: promLatency.p95 }, { label: 'p99', val: promLatency.p99 }] as pct}
									<div class="prom-pct">
										<span class="prom-pct-label">{pct.label}</span>
										<div class="prom-pct-bar">
											<div
												class="prom-pct-fill"
												style="width: {Math.min(
													(pct.val / Math.max(promLatency.p99, 0.001)) * 100,
													100
												)}%"
											></div>
										</div>
										<span class="prom-pct-val"
											>{pct.val < 1
												? `${(pct.val * 1000).toFixed(0)}ms`
												: `${pct.val.toFixed(2)}s`}</span
										>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Status code breakdown -->
					{#if Object.keys(promStatusBreakdown).length > 0}
						<div class="prom-status-section">
							<span class="prom-latency-title">Status Codes</span>
							<div class="prom-status-codes">
								{#each Object.entries(promStatusBreakdown).sort( ([a], [b]) => a.localeCompare(b) ) as [code, count]}
									<div
										class="prom-status-chip"
										class:status-2xx={code.startsWith('2')}
										class:status-3xx={code.startsWith('3')}
										class:status-4xx={code.startsWith('4')}
										class:status-5xx={code.startsWith('5')}
									>
										<span class="prom-status-code">{code}</span>
										<span class="prom-status-count">{count.toLocaleString()}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Increment history -->
					{#if promHistory.length > 0}
						<div class="prom-history">
							<span class="prom-latency-title">Activity</span>
							<div class="prom-history-items">
								{#each promHistory as entry}
									<span class="prom-history-item">
										<span class="prom-history-time">{entry.time}</span>
										+{entry.count}
									</span>
								{/each}
							</div>
						</div>
					{/if}

					<div class="prom-meta">
						<span class="prom-meta-item">Pod: {promPod}</span>
						<span class="prom-meta-item">Source: {promSource}</span>
						<span class="prom-meta-item"
							>Updated: {promLastUpdated}{promAgo > 0 ? ` (${promAgo}s ago)` : ''}</span
						>
					</div>
				{/if}
			</div>
		{:else if activeDemo === 'linkerd'}
			<div class="card">
				<div class="card-head">
					<h3>Linkerd</h3>
					<span class="card-tag">Service Mesh</span>
				</div>
				<p class="card-desc">
					mTLS proxy — inbound from meshed services, outbound to meshed services
				</p>
				<div class="linkerd-controls">
					<button onclick={loadLinkerdStats} class="btn btn-outline btn-sm">Refresh</button>
					<button
						onclick={linkerdGenerateTraffic}
						class="btn btn-accent btn-sm"
						disabled={linkerdTrafficRunning}
					>
						{linkerdTrafficRunning ? 'Generating...' : 'Generate Traffic'}
					</button>
					<button
						class="btn btn-sm"
						class:btn-outline={!linkerdLive}
						class:btn-ok={linkerdLive}
						onclick={() => {
							linkerdLive = !linkerdLive;
							if (linkerdLive) loadLinkerdStats();
						}}
					>
						{#if linkerdLive}<span class="live-dot"></span>{/if}
						{linkerdLive ? 'Live' : 'Auto-refresh'}
					</button>
				</div>
				{#if linkerdLoaded}
					{#if linkerdData}
						<div class="linkerd-sections">
							{#each [{ dir: 'Outbound', hint: 'this pod → services', data: linkerdData.outbound, tcp: linkerdData.tcp_out, rate: linkerdRates?.outbound ?? 0 }, { dir: 'Inbound', hint: 'services → this pod', data: linkerdData.inbound, tcp: linkerdData.tcp_in, rate: linkerdRates?.inbound ?? 0 }] as section}
								<div class="linkerd-dir">
									<div class="linkerd-dir-top">
										<span class="linkerd-dir-label"
											>{section.dir} <span class="linkerd-dir-hint">{section.hint}</span></span
										>
										{#if section.rate > 0}
											<span class="linkerd-rate">+{section.rate}/3s</span>
										{/if}
									</div>
									{#if section.data.requests > 0}
										<div class="linkerd-success-bar">
											<div
												class="linkerd-success-fill"
												style="width: {section.data.requests > 0
													? (section.data.success / section.data.requests) * 100
													: 100}%"
											></div>
										</div>
										<span class="linkerd-success-text"
											>{(section.data.requests > 0
												? (section.data.success / section.data.requests) * 100
												: 100
											).toFixed(1)}% success rate</span
										>
									{/if}
									<div class="linkerd-stats">
										<div class="linkerd-stat">
											<span class="linkerd-val">{section.data.requests.toLocaleString()}</span>
											<span class="linkerd-stat-label">Requests</span>
										</div>
										<div class="linkerd-stat">
											<span class="linkerd-val">{section.data.success.toLocaleString()}</span>
											<span class="linkerd-stat-label">Success</span>
										</div>
										<div class="linkerd-stat">
											<span class="linkerd-val" class:linkerd-val-err={section.data.failures > 0}
												>{section.data.failures.toLocaleString()}</span
											>
											<span class="linkerd-stat-label">Failures</span>
										</div>
										<div class="linkerd-stat">
											<span class="linkerd-val">{section.tcp}</span>
											<span class="linkerd-stat-label">TCP</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
						<div class="prom-meta">
							<span class="prom-meta-item">Proxy Memory: {linkerdData.memory_mb} MB</span>
							<span class="prom-meta-item">mTLS: Active</span>
							<span class="prom-meta-item"
								>Updated: {linkerdLastUpdated}{linkerdAgo > 0 ? ` (${linkerdAgo}s ago)` : ''}</span
							>
						</div>
					{:else}
						<pre class="result-pre err">{linkerdError}</pre>
					{/if}
				{/if}
			</div>
		{:else if activeDemo === 'chaos'}
			<div class="chaos-panel">
				<div class="chaos-header">
					<div>
						<h3>Chaos Testing</h3>
						<p class="card-desc">
							Inject failures, latency, and resource pressure to test observability and resilience
						</p>
					</div>
					{#if chaosLoading}<span class="chaos-loading">Running...</span>{/if}
				</div>

				<div class="chaos-grid">
					<!-- Error Injection -->
					<div class="chaos-section chaos-danger">
						<h4 class="chaos-section-title">Error Injection</h4>
						<p class="chaos-section-desc">
							Trigger HTTP errors to test alerting and Prometheus counters
						</p>
						<div class="chaos-actions">
							<button
								onclick={() => chaosAction('error')}
								class="btn btn-danger btn-sm"
								disabled={chaosLoading}>500 Error</button
							>
							<button
								onclick={() => chaosAction('error502')}
								class="btn btn-danger btn-sm"
								disabled={chaosLoading}>502 Gateway</button
							>
							<button
								onclick={() => chaosAction('error503')}
								class="btn btn-danger btn-sm"
								disabled={chaosLoading}>503 Unavailable</button
							>
						</div>
					</div>

					<!-- Latency Injection -->
					<div class="chaos-section chaos-warning">
						<h4 class="chaos-section-title">Latency Injection</h4>
						<p class="chaos-section-desc">
							Inject delays to observe p99 latency in Linkerd and Prometheus
						</p>
						<div class="chaos-fields">
							<div class="chaos-field">
								<span class="chaos-field-label">Fixed delay</span>
								<div class="chaos-field-row">
									<input
										type="number"
										bind:value={chaosDelayMs}
										class="input input-sm chaos-input"
										min="100"
										max="30000"
									/>
									<span class="chaos-unit">ms</span>
									<button
										onclick={() => chaosAction('slow', { delay: chaosDelayMs })}
										class="btn btn-warning btn-sm"
										disabled={chaosLoading}>Inject</button
									>
								</div>
							</div>
							<div class="chaos-field">
								<span class="chaos-field-label">Random jitter</span>
								<div class="chaos-field-row">
									<input
										type="number"
										bind:value={chaosJitterMin}
										class="input input-sm chaos-input"
										min="0"
									/>
									<span class="chaos-unit">&ndash;</span>
									<input
										type="number"
										bind:value={chaosJitterMax}
										class="input input-sm chaos-input"
										min="100"
									/>
									<span class="chaos-unit">ms</span>
									<button
										onclick={() =>
											chaosAction('jitter', { min: chaosJitterMin, max: chaosJitterMax })}
										class="btn btn-warning btn-sm"
										disabled={chaosLoading}>Jitter</button
									>
								</div>
							</div>
							<div class="chaos-field">
								<span class="chaos-field-label">Timeout</span>
								<button
									onclick={() => chaosAction('timeout')}
									class="btn btn-warning btn-sm"
									disabled={chaosLoading}>30s Timeout</button
								>
							</div>
						</div>
					</div>

					<!-- Resource Pressure -->
					<div class="chaos-section chaos-accent">
						<h4 class="chaos-section-title">Resource Pressure</h4>
						<p class="chaos-section-desc">
							Stress CPU/memory to observe metrics, OOM behavior, and scaling
						</p>
						<div class="chaos-fields">
							<div class="chaos-field">
								<span class="chaos-field-label">CPU burn</span>
								<div class="chaos-field-row">
									<input
										type="number"
										bind:value={chaosCpuSec}
										class="input input-sm chaos-input"
										min="1"
										max="10"
									/>
									<span class="chaos-unit">sec</span>
									<button
										onclick={() => chaosAction('cpu', { seconds: chaosCpuSec })}
										class="btn btn-accent btn-sm"
										disabled={chaosLoading}>Burn</button
									>
								</div>
							</div>
							<div class="chaos-field">
								<span class="chaos-field-label">Memory spike</span>
								<div class="chaos-field-row">
									<input
										type="number"
										bind:value={chaosMemMb}
										class="input input-sm chaos-input"
										min="1"
										max="256"
									/>
									<span class="chaos-unit">MB</span>
									<button
										onclick={() => chaosAction('memory', { mb: chaosMemMb })}
										class="btn btn-accent btn-sm"
										disabled={chaosLoading}>Spike</button
									>
								</div>
							</div>
							<div class="chaos-field">
								<span class="chaos-field-label">Concurrent load</span>
								<div class="chaos-field-row">
									<input
										type="number"
										bind:value={chaosLoadCount}
										class="input input-sm chaos-input"
										min="1"
										max="100"
									/>
									<span class="chaos-unit">ops</span>
									<button
										onclick={() => chaosAction('load', { count: chaosLoadCount })}
										class="btn btn-accent btn-sm"
										disabled={chaosLoading}>Run</button
									>
								</div>
							</div>
						</div>
					</div>

					<!-- Failure Patterns -->
					<div class="chaos-section chaos-muted">
						<h4 class="chaos-section-title">Failure Patterns</h4>
						<p class="chaos-section-desc">
							Intermittent errors, cascading failures, and gradual degradation
						</p>
						<div class="chaos-fields">
							<div class="chaos-field">
								<span class="chaos-field-label">Flaky endpoint</span>
								<div class="chaos-field-row">
									<input
										type="number"
										bind:value={chaosFlakyRate}
										class="input input-sm chaos-input"
										min="1"
										max="99"
									/>
									<span class="chaos-unit">%</span>
									<button
										onclick={() => chaosAction('flaky', { rate: chaosFlakyRate })}
										class="btn btn-outline btn-sm"
										disabled={chaosLoading}>Test</button
									>
								</div>
							</div>
							<div class="chaos-field">
								<span class="chaos-field-label">Degradation</span>
								<div class="chaos-field-row">
									<input
										type="number"
										bind:value={chaosDegradeMax}
										class="input input-sm chaos-input"
										min="2"
										max="50"
									/>
									<span class="chaos-unit">reqs</span>
									<button
										onclick={() => chaosAction('degrade', { requests: chaosDegradeMax })}
										class="btn btn-outline btn-sm"
										disabled={chaosLoading}>Start</button
									>
									<button
										onclick={() => chaosAction('degrade-reset')}
										class="btn btn-outline btn-sm"
										disabled={chaosLoading}>Reset</button
									>
								</div>
								{#if chaosDegradeState}
									<div class="degrade-progress">
										<div
											class="degrade-bar"
											style="width: {Math.min(
												(chaosDegradeState.current / chaosDegradeState.max) * 100,
												100
											)}%"
										></div>
									</div>
									<span class="chaos-unit"
										>{chaosDegradeState.current}/{chaosDegradeState.max} requests{chaosDegradeState.current >=
										chaosDegradeState.max
											? ' (saturated)'
											: ''}</span
									>
								{/if}
							</div>
							<div class="chaos-field">
								<span class="chaos-field-label">Cascade check</span>
								<button
									onclick={() => chaosAction('cascade')}
									class="btn btn-outline btn-sm"
									disabled={chaosLoading}>Valkey + RabbitMQ + Prometheus</button
								>
							</div>
						</div>
					</div>
				</div>

				<!-- Action History -->
				{#if chaosHistory.length > 0}
					<div class="chaos-log">
						<div class="chaos-log-header">
							<h4 class="chaos-section-title">Action Log</h4>
							<button
								class="btn btn-outline btn-sm"
								onclick={() => {
									chaosHistory = [];
									chaosDegradeState = null;
								}}>Clear</button
							>
						</div>
						<div class="chaos-log-entries">
							{#each chaosHistory as entry}
								<div class="chaos-log-entry" class:ok={entry.ok} class:err={!entry.ok}>
									<div class="chaos-log-main">
										<span class="chaos-log-badge" class:ok={entry.ok} class:err={!entry.ok}
											>{entry.ok ? '✓' : '✗'}</span
										>
										<span class="chaos-log-action">{entry.action}</span>
										<span class="chaos-log-msg">{entry.message}</span>
									</div>
									<span class="chaos-log-time">{entry.elapsedMs}ms</span>
								</div>
								{#if entry.services}
									<table class="cascade-table">
										<thead><tr><th>Service</th><th>Status</th><th>Latency</th></tr></thead>
										<tbody>
											{#each entry.services as svc}
												<tr>
													<td>{svc.service}</td>
													<td
														><span
															class="cascade-dot"
															class:ok={svc.status === 'ok'}
															class:err={svc.status !== 'ok'}
														></span>
														{svc.status}</td
													>
													<td>{svc.latency_ms}ms</td>
												</tr>
											{/each}
										</tbody>
									</table>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{:else if activeDemo === 'featureflags'}
			<div class="card">
				<div class="card-head">
					<h3>Feature Flags</h3>
					<span class="card-tag">GO Feature Flag</span>
				</div>
				<div class="status-row">
					<button onclick={checkFfStatus} class="btn btn-outline btn-sm">Check Status</button>
					{@render statusIcon(ffStatusOk, ffStatusText !== 'Not checked')}
					<span class="status-text">{ffStatusText}</span>
				</div>
				{#if data.features.gofeatureflag}
					<div class="ff-sections">
						<!-- Evaluate single flag -->
						<div class="ff-section">
							<span class="form-label">Evaluate Flag</span>
							<select bind:value={ffFlagName} class="input">
								<option value="maintenance-mode">maintenance-mode</option>
								<option value="new-dashboard-layout">new-dashboard-layout</option>
								<option value="dark-mode">dark-mode</option>
								<option value="welcome-banner">welcome-banner</option>
							</select>
							<div class="ff-user-row">
								<input type="text" bind:value={ffUserId} placeholder="User ID" class="input" />
								<div class="ff-user-presets">
									{#each ['user-123', 'admin', 'beta-tester', 'anonymous'] as preset}
										<button
											class="ff-preset"
											class:active={ffUserId === preset}
											onclick={() => (ffUserId = preset)}>{preset}</button
										>
									{/each}
								</div>
							</div>
							<button onclick={ffEvaluate} class="btn btn-primary btn-sm w-full">Evaluate</button>
							{#if ffEvalResult}
								<div class="ff-result-card">
									<div class="ff-result-header">
										<span class="ff-flag-name">{ffEvalResult.flag}</span>
										<span
											class="ff-value-badge"
											class:on={ffEvalResult.value === true}
											class:off={ffEvalResult.value === false}
										>
											{#if typeof ffEvalResult.value === 'boolean'}
												{ffEvalResult.value ? 'ON' : 'OFF'}
											{:else}
												{JSON.stringify(ffEvalResult.value)}
											{/if}
										</span>
									</div>
									{#if ffEvalResult.variationType}
										<div class="ff-result-meta">
											<span>Variation: <strong>{ffEvalResult.variationType}</strong></span>
											{#if ffEvalResult.reason}<span>Reason: {ffEvalResult.reason}</span>{/if}
										</div>
									{/if}
								</div>
							{/if}
						</div>

						<!-- All flags -->
						<div class="ff-section">
							<span class="form-label">All Flags</span>
							<div class="ff-user-row">
								<input type="text" bind:value={ffAllUser} placeholder="User ID" class="input" />
								<div class="ff-user-presets">
									{#each ['user-456', 'admin', 'new-user'] as preset}
										<button
											class="ff-preset"
											class:active={ffAllUser === preset}
											onclick={() => (ffAllUser = preset)}>{preset}</button
										>
									{/each}
								</div>
							</div>
							<button onclick={ffEvalAll} class="btn btn-secondary btn-sm w-full"
								>Evaluate All</button
							>
							{#if ffAllFlags}
								<div class="ff-flags-table">
									{#each Object.entries(ffAllFlags) as [name, flag]}
										<div class="ff-flag-row">
											<span class="ff-flag-name">{name}</span>
											<span
												class="ff-value-badge"
												class:on={flag.value === true}
												class:off={flag.value === false}
											>
												{#if typeof flag.value === 'boolean'}
													{flag.value ? 'ON' : 'OFF'}
												{:else}
													{JSON.stringify(flag.value)}
												{/if}
											</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>
					{#if ffError}
						<pre class="result-pre err">{ffError}</pre>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — GOFEATUREFLAG_URL not set</p>
				{/if}
			</div>
		{:else if activeDemo === 'ntfy'}
			<div class="card">
				<div class="card-head">
					<h3>ntfy</h3>
					<span class="card-tag">Push Notifications</span>
				</div>
				<div class="status-row">
					<button onclick={checkNtfyStatus} class="btn btn-outline btn-sm">Check Status</button>
					{@render statusIcon(ntfyStatusOk, ntfyStatusText !== 'Not checked')}
					<span class="status-text">{ntfyStatusText}</span>
				</div>
				{#if data.features.ntfy}
					<input type="text" bind:value={ntfyTopic} placeholder="Topic" class="input" />
					<input
						type="text"
						bind:value={ntfyMessage}
						placeholder="Message (optional)"
						class="input"
					/>
					<button onclick={ntfySend} class="btn btn-primary btn-sm w-full">Send Notification</button
					>
					{#if ntfyResultVisible}
						<p class="result" class:ok={ntfyResultOk} class:err={!ntfyResultOk}>{ntfyResult}</p>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — NTFY_URL not set</p>
				{/if}
			</div>
		{:else if activeDemo === 'knative'}
			<div class="card">
				<div class="card-head">
					<h3>Knative</h3>
					<span class="card-tag">Serverless</span>
				</div>
				<p class="card-desc">Invoke Fibonacci and measure cold start</p>
				{#if data.features.knative}
					<div class="form-row">
						<span class="form-label" style="white-space:nowrap">n =</span>
						<input
							type="number"
							bind:value={knativeN}
							min="0"
							max="50"
							class="input input-sm"
							style="max-width:80px"
						/>
						<button
							onclick={knativeInvoke}
							class="btn btn-primary btn-sm"
							disabled={knativeLoading}
						>
							{knativeLoading ? 'Invoking...' : 'Invoke'}
						</button>
					</div>
					{#if knativeResultVisible}
						<pre
							class="result-pre"
							class:ok={knativeResultOk}
							class:err={!knativeResultOk}>{knativeResult}</pre>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — KNATIVE_FIBONACCI_URL not set</p>
				{/if}
			</div>
		{/if}
	</section>

	<!-- ─── Footer ─── -->
	<footer class="footer">
		<span>EpochCloud Demo</span>
		<span class="footer-sep"></span>
		<span>{new Date().toISOString()}</span>
	</footer>
</div>

<style>
	/* ─── Theme ─── */
	:global(body) {
		margin: 0;
		padding: 0;
		background: #09090b;
		color: #fafafa;
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		min-height: 100vh;
		-webkit-font-smoothing: antialiased;
	}

	/* ─── Variables ─── */
	.dashboard {
		--bg: #09090b;
		--card-bg: #111113;
		--border: #1e1e21;
		--border-hover: #27272a;
		--text: #fafafa;
		--text-secondary: #a1a1aa;
		--muted-fg: #8b8b93;
		--accent: #3b82f6;
		--success: #22c55e;
		--warning: #eab308;
		--danger: #ef4444;
		--radius: 0.75rem;

		max-width: 1280px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}

	/* ─── Header ─── */
	.header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.logo {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		margin: 0;
		color: var(--text);
	}

	.tagline {
		color: var(--text-secondary);
		font-size: 0.875rem;
		margin: 0.25rem 0 0.75rem;
	}

	.env-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.2rem 0.6rem;
		border-radius: 9999px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.badge-dev {
		background: rgba(239, 68, 68, 0.15);
		color: #f87171;
		border: 1px solid rgba(239, 68, 68, 0.25);
	}

	.badge-staging {
		background: rgba(234, 179, 8, 0.15);
		color: #facc15;
		border: 1px solid rgba(234, 179, 8, 0.25);
	}

	.badge-prod {
		background: rgba(34, 197, 94, 0.15);
		color: #4ade80;
		border: 1px solid rgba(34, 197, 94, 0.25);
	}

	.stage-nav {
		display: flex;
		justify-content: center;
		gap: 0.375rem;
	}

	.stage-pill {
		padding: 0.3rem 0.875rem;
		border-radius: 9999px;
		font-size: 0.8rem;
		text-decoration: none;
		color: var(--muted-fg);
		background: transparent;
		border: 1px solid var(--border);
		transition: all 0.15s ease;
	}

	.stage-pill:hover {
		color: var(--text-secondary);
		border-color: var(--border-hover);
	}

	.stage-pill.active {
		color: var(--text);
		background: rgba(255, 255, 255, 0.06);
		border-color: var(--border-hover);
	}

	/* ─── Build Bar ─── */
	.build-bar {
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1rem 1.25rem;
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.build-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.build-items {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.build-item {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.build-label {
		font-size: 0.65rem;
		color: var(--muted-fg);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.build-value {
		font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.build-version {
		color: var(--accent);
		font-weight: 600;
	}

	.build-commit {
		font-size: 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		padding: 0.1rem 0.35rem;
		border-radius: 3px;
		color: var(--text-secondary);
	}

	.build-uptime {
		color: var(--ok);
	}

	.build-env-badge {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
	}
	.badge-prod {
		background: rgba(239, 68, 68, 0.15);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}
	.badge-staging {
		background: rgba(245, 158, 11, 0.15);
		color: #f59e0b;
		border: 1px solid rgba(245, 158, 11, 0.3);
	}
	.badge-dev {
		background: rgba(99, 102, 241, 0.15);
		color: #818cf8;
		border: 1px solid rgba(99, 102, 241, 0.3);
	}

	.build-sep {
		width: 1px;
		height: 24px;
		background: var(--border);
	}

	.build-pod-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.625rem;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 6px;
		border: 1px solid var(--border);
	}

	.build-pod-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.build-pod-name {
		font-size: 0.75rem;
		word-break: break-all;
	}

	.build-rotate-btn {
		margin-left: auto;
		white-space: nowrap;
	}

	.build-rotate-msg {
		font-size: 0.7rem;
		color: var(--text-secondary);
	}

	.pipeline {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0;
	}

	.pipe-step {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.3rem 0.6rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border);
	}

	.pipe-icon {
		font-size: 0.7rem;
	}

	.pipe-name {
		font-size: 0.7rem;
	}

	.pipe-connector {
		width: 16px;
		height: 2px;
		background: var(--border);
	}

	.pipe-arrow {
		color: var(--muted-fg);
		font-size: 0.75rem;
	}

	/* ─── Sections ─── */
	.section {
		margin-bottom: 2rem;
	}

	.section-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
		color: var(--text);
		letter-spacing: -0.01em;
	}

	.count-badge {
		font-size: 0.7rem;
		padding: 0.15rem 0.5rem;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.06);
		color: var(--muted-fg);
		border: 1px solid var(--border);
	}

	/* ─── Stack Grid ─── */
	.stack-groups {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.stack-group {
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1rem 1.25rem;
	}

	.stack-group-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.stack-group-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text);
	}

	.stack-group-count {
		font-size: 0.7rem;
		color: var(--muted-fg);
		margin-left: auto;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.dot-online {
		background: var(--success);
		box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
	}

	.dot-review {
		background: var(--warning);
		box-shadow: 0 0 6px rgba(234, 179, 8, 0.4);
	}

	.dot-pending {
		background: var(--muted-fg);
	}

	.chip-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.chip {
		font-size: 0.75rem;
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		border: 1px solid var(--border);
		color: var(--text-secondary);
		background: transparent;
		white-space: nowrap;
	}

	.chip-online {
		border-color: rgba(34, 197, 94, 0.2);
	}

	.chip-review {
		border-color: rgba(234, 179, 8, 0.2);
		color: var(--muted-fg);
	}

	.chip-pending {
		border-color: rgba(113, 113, 122, 0.3);
		color: var(--muted-fg);
	}

	/* ─── Dashboards Grid ─── */
	.dash-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.5rem;
	}

	.dash-card {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.75rem 1rem;
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.dash-card:hover {
		border-color: var(--border-hover);
		background: rgba(255, 255, 255, 0.03);
	}

	.dash-name {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text);
	}

	.dash-desc {
		font-size: 0.7rem;
		color: var(--muted-fg);
	}

	/* ─── Demo Grid ─── */
	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
		gap: 0.75rem;
	}

	/* ─── Cards ─── */
	.card {
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.card-head h3 {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0;
		color: var(--text);
	}

	.card-tag {
		font-size: 0.65rem;
		padding: 0.15rem 0.5rem;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.04);
		color: var(--muted-fg);
		border: 1px solid var(--border);
		white-space: nowrap;
	}

	.card-desc {
		color: var(--muted-fg);
		font-size: 0.8rem;
		margin: -0.25rem 0 0;
	}

	/* ─── Status Row ─── */
	.status-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--muted-fg);
		flex-shrink: 0;
	}

	.status-dot.ok {
		background: var(--success);
		box-shadow: 0 0 6px rgba(34, 197, 94, 0.35);
	}

	.status-text {
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	/* ─── Forms ─── */
	.form-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.form-cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.form-col {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	/* Feature Flags */
	.ff-sections {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.ff-section {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.ff-user-row {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.ff-user-presets {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}
	.ff-preset {
		font-size: 0.65rem;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--text-secondary);
		cursor: pointer;
	}
	.ff-preset.active {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}
	.ff-result-card {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.5rem;
	}
	.ff-result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}
	.ff-result-meta {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		margin-top: 0.375rem;
		font-size: 0.7rem;
		color: var(--text-secondary);
	}
	.ff-value-badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		background: var(--border);
		color: var(--text-secondary);
	}
	.ff-value-badge.on {
		background: var(--ok);
		color: #fff;
	}
	.ff-value-badge.off {
		background: var(--danger);
		color: #fff;
	}
	.ff-flag-name {
		font-size: 0.75rem;
		font-family: 'SF Mono', monospace;
	}
	.ff-flags-table {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.ff-flag-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.3rem 0.5rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
	}

	.form-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.input-label {
		font-size: 0.7rem;
		font-weight: 500;
		color: var(--muted-fg);
		min-width: 38px;
		flex-shrink: 0;
	}

	.input-unit {
		font-size: 0.7rem;
		color: var(--muted-fg);
		flex-shrink: 0;
	}

	.input {
		width: 100%;
		box-sizing: border-box;
		padding: 0.45rem 0.65rem;
		border-radius: 0.5rem;
		border: 1px solid var(--border);
		background: rgba(0, 0, 0, 0.25);
		color: var(--text);
		font-size: 0.8rem;
		outline: none;
		transition: border-color 0.15s ease;
		font-family: inherit;
	}

	.input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
	}

	.input-sm {
		padding: 0.35rem 0.5rem;
	}

	select.input {
		appearance: none;
		cursor: pointer;
	}

	/* ─── Buttons ─── */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.15s ease;
		white-space: nowrap;
		font-family: inherit;
	}

	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
	}

	.btn-primary {
		background: var(--text);
		color: var(--bg);
		border-color: var(--text);
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.btn-secondary {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text);
		border-color: var(--border-hover);
	}

	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	.btn-outline {
		background: transparent;
		color: var(--text-secondary);
		border-color: var(--border);
	}

	.btn-outline:hover {
		color: var(--text);
		border-color: var(--border-hover);
		background: rgba(255, 255, 255, 0.03);
	}

	.btn-ghost {
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--border);
	}

	.btn-ghost:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.04);
	}

	.btn-danger {
		background: rgba(239, 68, 68, 0.15);
		color: #f87171;
		border-color: rgba(239, 68, 68, 0.25);
	}

	.btn-danger:hover {
		background: rgba(239, 68, 68, 0.25);
	}

	.btn-warning {
		background: rgba(234, 179, 8, 0.15);
		color: #facc15;
		border-color: rgba(234, 179, 8, 0.25);
	}

	.btn-warning:hover {
		background: rgba(234, 179, 8, 0.25);
	}

	.btn-accent {
		background: rgba(59, 130, 246, 0.15);
		color: #60a5fa;
		border-color: rgba(59, 130, 246, 0.25);
	}

	.btn-accent:hover {
		background: rgba(59, 130, 246, 0.25);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-row {
		display: flex;
		gap: 0.375rem;
	}

	.w-full {
		width: 100%;
	}

	/* ─── Results ─── */
	.result {
		font-size: 0.8rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		margin: 0;
	}

	.result.ok {
		background: rgba(34, 197, 94, 0.1);
		color: #4ade80;
		border: 1px solid rgba(34, 197, 94, 0.2);
	}

	.result.err {
		background: rgba(239, 68, 68, 0.1);
		color: #f87171;
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	.result-pre {
		font-size: 0.75rem;
		font-family: 'JetBrains Mono', 'SF Mono', monospace;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		white-space: pre-wrap;
		max-height: 180px;
		overflow-y: auto;
		margin: 0;
	}

	.result-pre.ok {
		background: rgba(34, 197, 94, 0.08);
		color: #4ade80;
		border: 1px solid rgba(34, 197, 94, 0.15);
	}

	.result-pre.err {
		background: rgba(239, 68, 68, 0.08);
		color: #f87171;
		border: 1px solid rgba(239, 68, 68, 0.15);
	}

	.disabled-msg {
		color: var(--muted-fg);
		font-size: 0.75rem;
		margin: 0;
		font-style: italic;
	}

	/* ─── RabbitMQ consumed list ─── */
	.consumed-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.consumed-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.35rem 0.6rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0.375rem;
		font-size: 0.75rem;
	}

	.consumed-msg {
		color: var(--text-secondary);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-right: 0.5rem;
	}

	.consumed-time {
		color: var(--muted-fg);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		flex-shrink: 0;
	}

	/* ─── DefectDojo findings ─── */
	.findings-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.finding-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8rem;
	}

	.finding-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.finding-label {
		color: var(--text-secondary);
	}

	.finding-count {
		font-weight: 600;
		color: var(--text);
		font-family: 'JetBrains Mono', monospace;
	}

	.finding-total {
		margin-left: auto;
		border-left: 1px solid var(--border);
		padding-left: 0.5rem;
	}

	/* ─── Prometheus Stats ─── */
	.prom-controls {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
		align-items: center;
	}
	.prom-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	.prom-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0.5rem;
	}

	.prom-val {
		font-size: 1.25rem;
		font-weight: 700;
		font-family: 'JetBrains Mono', monospace;
		color: var(--text);
	}
	.prom-val-err {
		color: var(--danger);
	}

	.prom-label {
		font-size: 0.65rem;
		color: var(--muted-fg);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.prom-scope {
		font-size: 0.6rem;
		color: var(--muted-fg);
		font-style: italic;
	}

	.prom-latency {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.prom-latency-title {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.prom-latency-bars {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.prom-pct {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.prom-pct-label {
		font-size: 0.7rem;
		font-weight: 600;
		font-family: 'JetBrains Mono', monospace;
		color: var(--muted-fg);
		min-width: 2rem;
	}
	.prom-pct-bar {
		flex: 1;
		height: 6px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 3px;
		overflow: hidden;
	}
	.prom-pct-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 3px;
		transition: width 0.3s ease;
	}
	.prom-pct-val {
		font-size: 0.7rem;
		font-family: 'JetBrains Mono', monospace;
		color: var(--text-secondary);
		min-width: 3.5rem;
		text-align: right;
	}

	.prom-status-section {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.prom-status-codes {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}
	.prom-status-chip {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		background: var(--bg);
		border: 1px solid var(--border);
		font-size: 0.7rem;
	}
	.prom-status-code {
		font-weight: 700;
		font-family: 'JetBrains Mono', monospace;
	}
	.prom-status-count {
		color: var(--text-secondary);
	}
	.status-2xx {
		border-color: var(--ok);
	}
	.status-2xx .prom-status-code {
		color: var(--ok);
	}
	.status-3xx {
		border-color: var(--accent);
	}
	.status-3xx .prom-status-code {
		color: var(--accent);
	}
	.status-4xx {
		border-color: var(--warning);
	}
	.status-4xx .prom-status-code {
		color: var(--warning);
	}
	.status-5xx {
		border-color: var(--danger);
	}
	.status-5xx .prom-status-code {
		color: var(--danger);
	}

	.prom-history {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.prom-history-items {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}
	.prom-history-item {
		font-size: 0.65rem;
		font-family: 'JetBrains Mono', monospace;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.15);
		color: var(--text-secondary);
	}
	.prom-history-time {
		color: var(--muted-fg);
		margin-right: 0.25rem;
	}

	.prom-meta {
		display: flex;
		gap: 1rem;
		padding: 0.25rem 0 0;
	}

	.prom-meta-item {
		font-size: 0.7rem;
		font-family: 'JetBrains Mono', 'SF Mono', monospace;
		color: var(--muted-fg);
	}

	/* ─── Demo Tabs ─── */
	.demo-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 1rem;
	}

	.demo-tab {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--muted-fg);
		transition: all 0.15s ease;
		font-family: inherit;
		white-space: nowrap;
	}

	.demo-tab:hover {
		color: var(--text-secondary);
		border-color: var(--border-hover);
		background: rgba(255, 255, 255, 0.03);
	}

	.demo-tab.active {
		color: var(--text);
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--border-hover);
	}

	.tab-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--danger);
		flex-shrink: 0;
	}

	.tab-dot.ok {
		background: var(--success);
	}

	/* ─── Category Headers ─── */
	.demo-category {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 1.5rem 0 0.75rem;
		padding-bottom: 0.375rem;
		border-bottom: 1px solid var(--border);
	}

	/* ─── Linkerd Stats ─── */
	.linkerd-sections {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.linkerd-dir {
		padding: 0.5rem 0.625rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0.5rem;
	}

	.linkerd-dir-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.375rem;
	}

	.linkerd-dir-label {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.linkerd-dir-hint {
		font-weight: 400;
		font-size: 0.6rem;
		color: var(--muted-fg);
		text-transform: none;
		letter-spacing: 0;
	}

	.linkerd-rate {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.linkerd-success-bar {
		height: 3px;
		background: var(--border);
		border-radius: 2px;
		margin-bottom: 0.25rem;
		overflow: hidden;
	}

	.linkerd-success-fill {
		height: 100%;
		background: var(--ok);
		border-radius: 2px;
		transition: width 0.5s ease;
	}

	.linkerd-success-text {
		font-size: 0.6rem;
		color: var(--ok);
		margin-bottom: 0.375rem;
		display: block;
	}

	.linkerd-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.linkerd-val-err {
		color: var(--danger) !important;
	}

	.live-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--ok);
		display: inline-block;
		margin-right: 0.25rem;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.btn-ok {
		background: color-mix(in srgb, var(--ok) 15%, transparent);
		color: var(--ok);
		border: 1px solid color-mix(in srgb, var(--ok) 30%, transparent);
	}

	.linkerd-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.375rem;
	}

	.linkerd-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.linkerd-val {
		font-size: 1rem;
		font-weight: 700;
		font-family: 'JetBrains Mono', monospace;
		color: var(--text);
	}

	.linkerd-stat-label {
		font-size: 0.6rem;
		color: var(--muted-fg);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.demo-category:first-of-type {
		margin-top: 0;
	}

	/* ─── Status Icons (SVG checkmark/X) ─── */
	.status-icon {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		color: var(--muted-fg);
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.status-icon :global(svg) {
		width: 14px;
		height: 14px;
	}

	.status-icon.checked.ok {
		color: var(--success);
	}

	.status-icon.checked:not(.ok) {
		color: var(--danger);
	}

	/* ─── Chaos Panel (Full Width) ─── */
	.chaos-panel {
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.5rem;
	}

	.chaos-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 1.25rem;
	}

	.chaos-header h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.chaos-loading {
		font-size: 0.8rem;
		color: var(--accent);
		font-weight: 500;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	.chaos-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.25rem;
	}

	.chaos-section {
		padding: 1rem;
		background: var(--bg);
		border-radius: 8px;
		border: 1px solid var(--border);
		border-left: 3px solid var(--border);
		overflow: hidden;
	}

	.chaos-section.chaos-danger {
		border-left-color: var(--danger);
	}

	.chaos-section.chaos-warning {
		border-left-color: var(--warning);
	}

	.chaos-section.chaos-accent {
		border-left-color: var(--accent);
	}

	.chaos-section.chaos-muted {
		border-left-color: var(--muted-fg);
	}

	.chaos-section-title {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.375rem;
	}

	.chaos-section-desc {
		font-size: 0.75rem;
		color: var(--muted-fg);
		margin-bottom: 0.75rem;
		line-height: 1.4;
	}

	.chaos-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chaos-fields {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.chaos-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.chaos-field-label {
		font-size: 0.7rem;
		font-weight: 500;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.chaos-field-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
	}

	.chaos-input {
		width: 5rem;
		min-width: 0;
	}

	.chaos-unit {
		font-size: 0.75rem;
		color: var(--muted-fg);
		white-space: nowrap;
	}

	.chaos-result {
		margin-top: 1.25rem;
	}

	/* Degradation progress bar */
	.degrade-progress {
		height: 4px;
		background: var(--border);
		border-radius: 2px;
		margin-top: 0.375rem;
		overflow: hidden;
	}

	.degrade-bar {
		height: 100%;
		background: var(--warning);
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	/* Action history log */
	.chaos-log {
		margin-top: 1.25rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
	}

	.chaos-log-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
	}

	.chaos-log-header .chaos-section-title {
		margin-bottom: 0;
	}

	.chaos-log-entries {
		max-height: 280px;
		overflow-y: auto;
	}

	.chaos-log-entry {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.8rem;
		gap: 0.5rem;
	}

	.chaos-log-entry:last-child {
		border-bottom: none;
	}

	.chaos-log-main {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
		flex: 1;
	}

	.chaos-log-badge {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.65rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.chaos-log-badge.ok {
		background: color-mix(in srgb, var(--ok) 15%, transparent);
		color: var(--ok);
	}

	.chaos-log-badge.err {
		background: color-mix(in srgb, var(--danger) 15%, transparent);
		color: var(--danger);
	}

	.chaos-log-action {
		font-weight: 600;
		color: var(--text-primary);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.chaos-log-msg {
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chaos-log-time {
		font-size: 0.7rem;
		color: var(--muted-fg);
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	/* Cascade results table */
	.cascade-table {
		width: 100%;
		font-size: 0.75rem;
		border-collapse: collapse;
		background: var(--bg);
	}

	.cascade-table th {
		text-align: left;
		padding: 0.25rem 0.75rem;
		color: var(--muted-fg);
		font-weight: 500;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.cascade-table td {
		padding: 0.25rem 0.75rem;
		color: var(--text-secondary);
		border-top: 1px solid var(--border);
	}

	.cascade-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		margin-right: 0.25rem;
		vertical-align: middle;
	}

	.cascade-dot.ok {
		background: var(--ok);
	}

	.cascade-dot.err {
		background: var(--danger);
	}

	/* ─── Footer ─── */
	.footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		color: var(--muted-fg);
		font-size: 0.75rem;
		border-top: 1px solid var(--border);
		margin-top: 1rem;
	}

	.footer-sep {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--muted-fg);
	}

	/* ─── Responsive ─── */
	@media (max-width: 768px) {
		.dashboard {
			padding: 1rem;
		}

		.logo {
			font-size: 1.5rem;
		}

		.demo-grid {
			grid-template-columns: 1fr;
		}

		.form-cols {
			grid-template-columns: 1fr;
		}

		.build-items {
			gap: 0.5rem;
		}

		.build-sep {
			display: none;
		}

		.dash-grid {
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		}

		.pipeline {
			display: none;
		}

		.prom-stats {
			grid-template-columns: 1fr;
		}

		.chaos-panel {
			padding: 1rem;
		}

		.chaos-grid {
			grid-template-columns: 1fr;
		}

		.chaos-field-row {
			flex-wrap: wrap;
		}
	}
</style>
