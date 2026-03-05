<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// --------------- Domain computation ---------------
	let domain = $state('');
	$effect(() => {
		if (typeof window !== 'undefined') {
			domain = window.location.hostname.split('.').slice(-2).join('.');
		}
	});

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
	let chaosResult = $state('');
	let chaosResultOk = $state(false);
	let chaosResultVisible = $state(false);
	let chaosLoadCount = $state('10');

	// --------------- Feature Flags state ---------------
	let ffStatusText = $state('Not checked');
	let ffStatusOk = $state(false);
	let ffResult = $state('');
	let ffResultOk = $state(false);
	let ffResultVisible = $state(false);
	let ffFlagName = $state('maintenance-mode');
	let ffUserId = $state('user-123');
	let ffAllUserId = $state('user-456');

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

	// --------------- CrowdSec state ---------------
	let csStatusText = $state('Not checked');
	let csStatusOk = $state(false);
	let csIp = $state('');
	let csResult = $state('');
	let csResultOk = $state(false);
	let csResultVisible = $state(false);

	// --------------- Linkerd state ---------------
	let linkerdResult = $state('');
	let linkerdResultOk = $state(false);
	let linkerdResultVisible = $state(false);

	// --------------- Prometheus state ---------------
	let promDemoCount = $state(0);
	let promHttpTotal = $state(0);
	let promActive = $state(0);
	let promLoaded = $state(false);
	let promPod = $state('');
	let promSource = $state('');

	// =============== Handler Functions ===============

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
			authStatusText = d.connected ? `Connected — ${d.health}` : `Disconnected${d.error ? ' — ' + d.error : ''}`;
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
				const params = msg ? `?message=${encodeURIComponent(msg + (count > 1 ? ` #${i + 1}` : ''))}` : '';
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
			rmqResult = `${d.count} message${d.count !== 1 ? 's' : ''} in buffer`;
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
			const resp = await fetch(`/cache/set?key=${encodeURIComponent(vkSetKey)}&value=${encodeURIComponent(vkSetValue)}&ttl=${vkSetTtl}`);
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
	async function chaosAction(action: string, count?: string) {
		const params = action === 'load' ? `?action=load&count=${count || '10'}` : `?action=${action}`;
		try {
			const resp = await fetch(`/chaos${params}`);
			const d = await resp.json();
			chaosResult = JSON.stringify(d, null, 2);
			chaosResultOk = !d.error;
			chaosResultVisible = true;
		} catch (err) {
			chaosResult = `Error: ${err}`;
			chaosResultOk = false;
			chaosResultVisible = true;
		}
	}

	// --- Feature Flags ---
	async function checkFfStatus() {
		ffStatusText = 'Checking...';
		try {
			const resp = await fetch('/features/status');
			const d = await resp.json();
			ffStatusOk = d.connected;
			ffStatusText = d.connected ? `Connected — ${d.flags_available || 0} flags` : `Disconnected${d.error ? ' — ' + d.error : ''}`;
		} catch (err) {
			ffStatusText = `Error: ${err}`;
			ffStatusOk = false;
		}
	}

	async function ffEvaluate() {
		try {
			const resp = await fetch(`/features/evaluate?flag=${encodeURIComponent(ffFlagName)}&user=${encodeURIComponent(ffUserId)}`);
			const d = await resp.json();
			ffResult = JSON.stringify(d, null, 2);
			ffResultOk = !d.error;
			ffResultVisible = true;
		} catch (err) {
			ffResult = `Error: ${err}`;
			ffResultOk = false;
			ffResultVisible = true;
		}
	}

	async function ffEvalAll() {
		try {
			const resp = await fetch(`/features/all?user=${encodeURIComponent(ffAllUserId)}`);
			const d = await resp.json();
			ffResult = JSON.stringify(d, null, 2);
			ffResultOk = !d.error;
			ffResultVisible = true;
		} catch (err) {
			ffResult = `Error: ${err}`;
			ffResultOk = false;
			ffResultVisible = true;
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
				knativeResult = `Result: ${d.result}\nLatency: ${d.latency_ms}ms${d.cold_start ? ' (cold start!)' : ''}`;
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
				const memMB = (d.proxy_memory_bytes / 1024 / 1024).toFixed(1);
				linkerdResult = [
					`Requests: ${d.request_total.toLocaleString()}`,
					`Success: ${d.success_total.toLocaleString()}`,
					`Failures: ${d.failure_total.toLocaleString()}`,
					`TCP Connections: ${d.tcp_connections}`,
					`Proxy Memory: ${memMB} MB`
				].join('\n');
				linkerdResultOk = true;
			} else {
				linkerdResult = d.error || 'Linkerd proxy not available';
				linkerdResultOk = false;
			}
			linkerdResultVisible = true;
		} catch (err) {
			linkerdResult = String(err);
			linkerdResultOk = false;
			linkerdResultVisible = true;
		}
	}

	// --- Prometheus ---
	async function loadPromMetrics(increment = false) {
		try {
			const action = increment ? 'increment' : 'status';
			const resp = await fetch(`/prometheus/demo?action=${action}`);
			const d = await resp.json();
			promDemoCount = d.demo_counter;
			promHttpTotal = d.http_requests_total;
			promActive = d.active_requests;
			promPod = d.pod || '';
			promSource = d.source || '';
			promLoaded = true;
		} catch {
			promLoaded = false;
		}
	}

	// =============== Static Data ===============

	function envBadgeClass(env: string): string {
		switch (env) {
			case 'prod': return 'badge-prod';
			case 'staging': return 'badge-staging';
			default: return 'badge-dev';
		}
	}

	const stages = [
		{ label: 'Dev', prefix: 'sveltekit-dev' },
		{ label: 'Staging', prefix: 'sveltekit-staging' },
		{ label: 'Prod', prefix: 'sveltekit' }
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
		{ name: 'Rybbit', sub: 'analytics', desc: 'Web Analytics' }
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
				<svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>
			{:else}
				<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg>
			{/if}
		{/if}
	</span>
{/snippet}

<svelte:head>
	<title>EpochCloud</title>
	{#if data.rybbit}
		<script
			src="{data.rybbit.host}/script.js"
			data-site-id={data.rybbit.siteId}
			defer
		></script>
	{/if}
</svelte:head>

<div class="dashboard">
	<!-- ─── Header ─── -->
	<header class="header">
		<div class="header-row">
			<h1 class="logo">EpochCloud</h1>
			<span class="env-badge {envBadgeClass(data.environment)}">{data.environment}</span>
		</div>
		<p class="tagline">SvelteKit 5 Infrastructure Dashboard</p>
		<nav class="stage-nav">
			{#each stages as stage (stage.label)}
				<a
					href="https://{stage.prefix}.{domain || 'example.com'}"
					class="stage-pill"
					class:active={data.environment === (stage.label === 'Prod' ? 'prod' : stage.label.toLowerCase())}
				>
					{stage.label}
				</a>
			{/each}
		</nav>
	</header>

	<!-- ─── Build Info ─── -->
	<section class="build-bar">
		<div class="build-items">
			<div class="build-item">
				<span class="build-label">Version</span>
				<span class="build-value">{data.version}</span>
			</div>
			<span class="build-sep"></span>
			<div class="build-item">
				<span class="build-label">Commit</span>
				<span class="build-value">{data.commit.substring(0, 7)}</span>
			</div>
			<span class="build-sep"></span>
			<div class="build-item">
				<span class="build-label">Built</span>
				<span class="build-value">{data.buildTime}</span>
			</div>
			<span class="build-sep"></span>
			<div class="build-item">
				<span class="build-label">Pod</span>
				<span class="build-value">{data.hostname}</span>
			</div>
		</div>
		<div class="pipeline">
			{#each ['Git Push', 'Argo Workflows', 'Harbor', 'Kargo', 'ArgoCD'] as step, i}
				{#if i > 0}<span class="pipe-arrow">&#8594;</span>{/if}
				<span class="pipe-step">{step}</span>
			{/each}
		</div>
	</section>

	<!-- ─── Platform Stack ─── -->
	<section class="section">
		<div class="section-head">
			<h2 class="section-title">Platform Stack</h2>
			<span class="count-badge">{stackOnline.length + stackReview.length + stackPending.length}</span>
		</div>

		<div class="stack-groups">
			<div class="stack-group">
				<div class="stack-group-head">
					<span class="dot dot-online"></span>
					<span class="stack-group-label">Online</span>
					<span class="stack-group-count">{stackOnline.length}</span>
				</div>
				<div class="chip-grid">
					{#each stackOnline as item}
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
					{#each stackReview as item}
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
					{#each stackPending as item}
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
			{#each dashboards as db}
				<a href="https://{db.sub}.{domain || 'example.com'}" target="_blank" rel="noopener" class="dash-card">
					<span class="dash-name">{db.name}</span>
					<span class="dash-desc">{db.desc}</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- ─── Interactive Demos ─── -->
	<section class="section">
		<div class="section-head">
			<h2 class="section-title">Interactive Demos</h2>
		</div>

		<!-- ═══ Infrastructure ═══ -->
		<h3 class="demo-category">Infrastructure</h3>
		<div class="demo-grid">
			<!-- ── RabbitMQ ── -->
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
					<div class="form-row">
						<input type="text" bind:value={rmqMessage} placeholder="Message (optional)" class="input" />
						<input type="number" bind:value={rmqBatchCount} min="1" max="50" class="input input-sm" style="max-width:70px" />
						<button onclick={rmqPublish} class="btn btn-primary btn-sm">Publish</button>
						<button onclick={rmqConsume} class="btn btn-outline btn-sm">Consume</button>
					</div>
					{#if rmqResultVisible}
						<p class="result" class:ok={rmqResultOk} class:err={!rmqResultOk}>{rmqResult}</p>
					{/if}
					{#if rmqConsumed.length > 0}
						<div class="consumed-list">
							{#each rmqConsumed.slice(0, 5) as msg}
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

			<!-- ── Valkey Cache ── -->
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
							<input type="text" bind:value={vkSetKey} placeholder="Key" class="input" />
							<input type="text" bind:value={vkSetValue} placeholder="Value" class="input" />
							<input type="number" bind:value={vkSetTtl} placeholder="TTL (s)" class="input" />
							<button onclick={vkSet} class="btn btn-primary btn-sm w-full">Set</button>
						</div>
						<div class="form-col">
							<span class="form-label">Get Value</span>
							<input type="text" bind:value={vkGetKey} placeholder="Key" class="input" />
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

			<!-- ── Email ── -->
			<div class="card">
				<div class="card-head">
					<h3>Email</h3>
					<span class="card-tag">SMTP</span>
				</div>
				{#if data.features.smtp}
					<div class="form-row">
						<input type="email" bind:value={emailInput} placeholder="recipient@example.com" class="input" />
						<button onclick={sendEmail} class="btn btn-primary btn-sm">Send</button>
					</div>
					{#if emailStatus}
						<p class="result" class:ok={!emailError} class:err={emailError}>{emailStatus}</p>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — SMTP_HOST not set</p>
				{/if}
			</div>
		</div>

		<!-- ═══ Security ═══ -->
		<h3 class="demo-category">Security</h3>
		<div class="demo-grid">
			<!-- ── BetterAuth ── -->
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
							<input type="password" bind:value={authRegPass} placeholder="Password" class="input" />
							<button onclick={authRegister} class="btn btn-primary btn-sm w-full">Register</button>
						</div>
						<div class="form-col">
							<span class="form-label">Login</span>
							<input type="email" bind:value={authLoginEmail} placeholder="Email" class="input" />
							<input type="password" bind:value={authLoginPass} placeholder="Password" class="input" />
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

			<!-- ── CrowdSec ── -->
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

			<!-- ── DefectDojo ── -->
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
						{#each Object.entries(ddFindings.by_severity) as [sev, count]}
							<div class="finding-item">
								<span class="finding-dot" style="background:{severityColors[sev] || 'var(--muted-fg)'}"></span>
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
				{#if data.features.defectdojo && domain}
					<a href="https://defectdojo.{domain}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm w-full" style="margin-top:0.5rem">Open Dashboard</a>
				{:else if !data.features.defectdojo}
					<p class="disabled-msg">Not configured — DEFECTDOJO_URL not set</p>
				{/if}
			</div>
		</div>

		<!-- ═══ Observability ═══ -->
		<h3 class="demo-category">Observability</h3>
		<div class="demo-grid">
			<!-- ── Prometheus Demo ── -->
			<div class="card">
				<div class="card-head">
					<h3>Prometheus</h3>
					<span class="card-tag">Metrics</span>
				</div>
				<p class="card-desc">Aggregated app metrics via Prometheus API</p>
				<div class="btn-row">
					<button onclick={() => loadPromMetrics(true)} class="btn btn-primary btn-sm">Increment Counter</button>
					<button onclick={() => loadPromMetrics(false)} class="btn btn-outline btn-sm">Refresh</button>
				</div>
				{#if promLoaded}
					<div class="prom-stats">
						<div class="prom-stat">
							<span class="prom-val">{promDemoCount}</span>
							<span class="prom-label">Demo Counter</span>
						</div>
						<div class="prom-stat">
							<span class="prom-val">{promHttpTotal.toLocaleString()}</span>
							<span class="prom-label">HTTP Requests</span>
						</div>
						<div class="prom-stat">
							<span class="prom-val">{promActive}</span>
							<span class="prom-label">Active</span>
						</div>
					</div>
					<div class="prom-meta">
						<span class="prom-meta-item">Pod: {promPod}</span>
						<span class="prom-meta-item">Source: {promSource}</span>
					</div>
				{/if}
			</div>

			<!-- ── Linkerd Mesh ── -->
			<div class="card">
				<div class="card-head">
					<h3>Linkerd</h3>
					<span class="card-tag">Service Mesh</span>
				</div>
				<p class="card-desc">mTLS sidecar proxy metrics</p>
				<button onclick={loadLinkerdStats} class="btn btn-outline btn-sm w-full">Load Stats</button>
				{#if linkerdResultVisible}
					<pre class="result-pre" class:ok={linkerdResultOk} class:err={!linkerdResultOk}>{linkerdResult}</pre>
				{/if}
			</div>

			<!-- ── Chaos Testing ── -->
			<div class="card">
				<div class="card-head">
					<h3>Chaos Testing</h3>
					<span class="card-tag">Observability</span>
				</div>
				<p class="card-desc">Trigger errors, latency, and load</p>
				<div class="btn-row">
					<button onclick={() => chaosAction('error')} class="btn btn-danger btn-sm">Error</button>
					<button onclick={() => chaosAction('slow')} class="btn btn-warning btn-sm">Slow</button>
				</div>
				<div class="form-row" style="margin-top:0.5rem">
					<input type="number" bind:value={chaosLoadCount} class="input input-sm" style="max-width:70px" />
					<button onclick={() => chaosAction('load', chaosLoadCount)} class="btn btn-accent btn-sm">Load Test</button>
				</div>
				{#if chaosResultVisible}
					<pre class="result-pre" class:ok={chaosResultOk} class:err={!chaosResultOk}>{chaosResult}</pre>
				{/if}
			</div>
		</div>

		<!-- ═══ Platform ═══ -->
		<h3 class="demo-category">Platform</h3>
		<div class="demo-grid">
			<!-- ── Feature Flags ── -->
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
					<div class="form-cols">
						<div class="form-col">
							<span class="form-label">Evaluate Flag</span>
							<select bind:value={ffFlagName} class="input">
								<option value="maintenance-mode">maintenance-mode</option>
								<option value="new-dashboard-layout">new-dashboard-layout</option>
								<option value="dark-mode">dark-mode</option>
								<option value="welcome-banner">welcome-banner</option>
							</select>
							<input type="text" bind:value={ffUserId} placeholder="User ID" class="input" />
							<button onclick={ffEvaluate} class="btn btn-primary btn-sm w-full">Evaluate</button>
						</div>
						<div class="form-col">
							<span class="form-label">All Flags</span>
							<input type="text" bind:value={ffAllUserId} placeholder="User ID" class="input" />
							<button onclick={ffEvalAll} class="btn btn-secondary btn-sm w-full">Evaluate All</button>
						</div>
					</div>
					{#if ffResultVisible}
						<pre class="result-pre" class:ok={ffResultOk} class:err={!ffResultOk}>{ffResult}</pre>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — GOFEATUREFLAG_URL not set</p>
				{/if}
			</div>

			<!-- ── ntfy Notifications ── -->
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
					<input type="text" bind:value={ntfyMessage} placeholder="Message (optional)" class="input" />
					<button onclick={ntfySend} class="btn btn-primary btn-sm w-full">Send Notification</button>
					{#if ntfyResultVisible}
						<p class="result" class:ok={ntfyResultOk} class:err={!ntfyResultOk}>{ntfyResult}</p>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — NTFY_URL not set</p>
				{/if}
			</div>

			<!-- ── Knative Cold Start ── -->
			<div class="card">
				<div class="card-head">
					<h3>Knative</h3>
					<span class="card-tag">Serverless</span>
				</div>
				<p class="card-desc">Invoke Fibonacci and measure cold start</p>
				{#if data.features.knative}
					<div class="form-row">
						<span class="form-label" style="white-space:nowrap">n =</span>
						<input type="number" bind:value={knativeN} min="0" max="50" class="input input-sm" style="max-width:80px" />
						<button onclick={knativeInvoke} class="btn btn-primary btn-sm" disabled={knativeLoading}>
							{knativeLoading ? 'Invoking...' : 'Invoke'}
						</button>
					</div>
					{#if knativeResultVisible}
						<pre class="result-pre" class:ok={knativeResultOk} class:err={!knativeResultOk}>{knativeResult}</pre>
					{/if}
				{:else}
					<p class="disabled-msg">Not configured — KNATIVE_FIBONACCI_URL not set</p>
				{/if}
			</div>
		</div>
	</section>

	<!-- ─── Footer ─── -->
	<footer class="footer">
		<span>SvelteKit 5</span>
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
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
	}

	.build-items {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
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

	.build-sep {
		width: 1px;
		height: 24px;
		background: var(--border);
	}

	.pipeline {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.pipe-step {
		padding: 0.2rem 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border);
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

	.form-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
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
	.prom-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
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

	.prom-label {
		font-size: 0.65rem;
		color: var(--muted-fg);
		text-transform: uppercase;
		letter-spacing: 0.04em;
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
	}
</style>
