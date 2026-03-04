<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let emailInput = $state('');
	let emailStatus = $state('');
	let emailError = $state(false);

	// BetterAuth state
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

	// RabbitMQ state
	let rmqStatusText = $state('Not checked');
	let rmqStatusOk = $state(false);
	let rmqMessage = $state('');
	let rmqResult = $state('');
	let rmqResultOk = $state(false);
	let rmqResultVisible = $state(false);

	// DefectDojo state
	let ddStatusText = $state('Not checked');
	let ddStatusOk = $state(false);

	// Valkey state
	let vkStatusText = $state('Not checked');
	let vkStatusOk = $state(false);
	let vkSetKey = $state('demo');
	let vkSetValue = $state('hello');
	let vkSetTtl = $state('300');
	let vkGetKey = $state('demo');
	let vkResult = $state('');
	let vkResultOk = $state(false);
	let vkResultVisible = $state(false);

	// Chaos test state
	let chaosResult = $state('');
	let chaosResultOk = $state(false);
	let chaosResultVisible = $state(false);
	let chaosLoadCount = $state('10');

	// GO Feature Flag state
	let ffStatusText = $state('Not checked');
	let ffStatusOk = $state(false);
	let ffResult = $state('');
	let ffResultOk = $state(false);
	let ffResultVisible = $state(false);
	let ffFlagName = $state('maintenance-mode');
	let ffUserId = $state('user-123');
	let ffAllUserId = $state('user-456');

	async function sendEmail() {
		if (!emailInput) return;
		emailStatus = 'Sending...';
		emailError = false;

		try {
			const resp = await fetch(`/email/send?email=${encodeURIComponent(emailInput)}`);
			const result = await resp.json();
			if (result.success) {
				emailStatus = `✓ Email sent to ${emailInput}`;
				emailError = false;
			} else {
				emailStatus = `✗ ${result.error}`;
				emailError = true;
			}
		} catch (err) {
			emailStatus = `✗ ${err}`;
			emailError = true;
		}
	}

	async function checkAuthStatus() {
		authStatusText = 'Checking...';
		try {
			const resp = await fetch('/auth/status');
			const d = await resp.json();
			if (d.connected) {
				authStatusText = `● Connected — ${d.health}`;
				authStatusOk = true;
			} else {
				authStatusText = `● Disconnected${d.error ? ' — ' + d.error : ''}`;
				authStatusOk = false;
			}
		} catch (err) {
			authStatusText = `● Error: ${err}`;
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
			showAuthResult(`Network error: ${err}`, false);
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
			showAuthResult(`Network error: ${err}`, false);
		}
	}

	async function authSession() {
		try {
			const resp = await fetch('/auth/session');
			const d = await resp.json();
			showAuthResult(
				d.message + (d.data ? ' — ' + JSON.stringify(d.data) : ''),
				d.success
			);
		} catch (err) {
			showAuthResult(`Network error: ${err}`, false);
		}
	}

	async function checkRmqStatus() {
		rmqStatusText = 'Checking...';
		try {
			const resp = await fetch('/rabbitmq/status');
			const d = await resp.json();
			if (d.connected) {
				rmqStatusText = '● Connected';
				rmqStatusOk = true;
			} else {
				rmqStatusText = '● Disconnected';
				rmqStatusOk = false;
			}
		} catch (err) {
			rmqStatusText = `● Error: ${err}`;
			rmqStatusOk = false;
		}
	}

	async function rmqPublish() {
		const params = rmqMessage ? `?message=${encodeURIComponent(rmqMessage)}` : '';
		try {
			const resp = await fetch(`/rabbitmq/publish${params}`);
			const d = await resp.json();
			rmqResult = d.success ? `✓ Published: ${d.message}` : `✗ ${d.error}`;
			rmqResultOk = d.success;
			rmqResultVisible = true;
		} catch (err) {
			rmqResult = `✗ ${err}`;
			rmqResultOk = false;
			rmqResultVisible = true;
		}
	}

	async function checkDdStatus() {
		ddStatusText = 'Checking...';
		try {
			const resp = await fetch('/defectdojo/status');
			const d = await resp.json();
			if (d.connected) {
				ddStatusText = `● Connected — ${d.product_count} products`;
				ddStatusOk = true;
			} else {
				ddStatusText = '● Disconnected';
				ddStatusOk = false;
			}
		} catch (err) {
			ddStatusText = `● Error: ${err}`;
			ddStatusOk = false;
		}
	}

	async function checkVkStatus() {
		vkStatusText = 'Checking...';
		try {
			const resp = await fetch('/cache/status');
			const d = await resp.json();
			if (d.connected) {
				vkStatusText = '● Connected';
				vkStatusOk = true;
			} else {
				vkStatusText = '● Disconnected';
				vkStatusOk = false;
			}
		} catch (err) {
			vkStatusText = `● Error: ${err}`;
			vkStatusOk = false;
		}
	}

	async function vkSet() {
		try {
			const resp = await fetch(`/cache/set?key=${encodeURIComponent(vkSetKey)}&value=${encodeURIComponent(vkSetValue)}&ttl=${vkSetTtl}`);
			const d = await resp.json();
			vkResult = d.success ? `✓ Set "${d.key}" = "${d.value}" (TTL: ${d.ttl_seconds}s)` : `✗ ${d.error}`;
			vkResultOk = d.success;
			vkResultVisible = true;
		} catch (err) {
			vkResult = `✗ ${err}`;
			vkResultOk = false;
			vkResultVisible = true;
		}
	}

	async function vkGet() {
		try {
			const resp = await fetch(`/cache/get?key=${encodeURIComponent(vkGetKey)}`);
			const d = await resp.json();
			vkResult = d.cache_hit ? `✓ "${d.key}" = "${d.value}"` : `✗ Cache miss for "${d.key}"`;
			vkResultOk = d.cache_hit;
			vkResultVisible = true;
		} catch (err) {
			vkResult = `✗ ${err}`;
			vkResultOk = false;
			vkResultVisible = true;
		}
	}

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

	async function checkFfStatus() {
		ffStatusText = 'Checking...';
		try {
			const resp = await fetch('/features/status');
			const d = await resp.json();
			if (d.connected) {
				ffStatusText = `● Connected — ${d.flags_available || 0} flags`;
				ffStatusOk = true;
			} else {
				ffStatusText = `● Disconnected${d.error ? ' — ' + d.error : ''}`;
				ffStatusOk = false;
			}
		} catch (err) {
			ffStatusText = `● Error: ${err}`;
			ffStatusOk = false;
		}
	}

	function showFfResult(msg: string, ok: boolean) {
		ffResult = msg;
		ffResultOk = ok;
		ffResultVisible = true;
	}

	async function ffEvaluate() {
		try {
			const resp = await fetch(
				`/features/evaluate?flag=${encodeURIComponent(ffFlagName)}&user=${encodeURIComponent(ffUserId)}`
			);
			const d = await resp.json();
			showFfResult(JSON.stringify(d, null, 2), !d.error);
		} catch (err) {
			showFfResult(`Network error: ${err}`, false);
		}
	}

	async function ffEvalAll() {
		try {
			const resp = await fetch(`/features/all?user=${encodeURIComponent(ffAllUserId)}`);
			const d = await resp.json();
			showFfResult(JSON.stringify(d, null, 2), !d.error);
		} catch (err) {
			showFfResult(`Network error: ${err}`, false);
		}
	}

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

	// Stage navigation
	const stages = [
		{ label: 'Dev', prefix: 'sveltekit-dev' },
		{ label: 'Staging', prefix: 'sveltekit-staging' },
		{ label: 'Prod', prefix: 'sveltekit' }
	];
</script>

<svelte:head>
	<title>EpochCloud SvelteKit</title>
	{#if data.rybbit}
		<script
			src="{data.rybbit.host}/script.js"
			data-site-id={data.rybbit.siteId}
			defer
		></script>
	{/if}
</svelte:head>

<div class="container">
	<header>
		<h1 class="title">🚀 EpochCloud SvelteKit</h1>
		<p class="subtitle">SvelteKit 5 platform demo • 1:1 equivalent of Go test app</p>
		<span class="badge {envBadgeClass(data.environment)}">{data.environment}</span>

		<nav class="stage-nav">
			{#each stages as stage (stage.label)}
				<a
					href="https://{stage.prefix}.{typeof window !== 'undefined' ? window.location.hostname.split('.').slice(-2).join('.') : 'example.com'}"
					class="stage-pill"
					class:active={data.environment ===
						(stage.label === 'Prod' ? 'prod' : stage.label.toLowerCase())}
				>
					{stage.label}
				</a>
			{/each}
		</nav>
	</header>

	<div class="grid">
		<!-- Build Information -->
		<div class="card">
			<h2>📦 Build Information</h2>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Version</span>
					<span class="info-value">{data.version}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Commit</span>
					<span class="info-value">{data.commit.substring(0, 7)}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Build Time</span>
					<span class="info-value">{data.buildTime}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Hostname</span>
					<span class="info-value">{data.hostname}</span>
				</div>
			</div>
		</div>

		<!-- Observability Stack -->
		<div class="card">
			<h2>📊 Observability Stack</h2>
			<div class="icon-list">
				<div class="icon-item">📈 Prometheus</div>
				<div class="icon-item">📝 Loki</div>
				<div class="icon-item">🔍 Tempo</div>
				<div class="icon-item">🚨 AlertManager</div>
				<div class="icon-item">🦅 Falco</div>
				<div class="icon-item">📊 Rybbit</div>
			</div>
		</div>

		<!-- Deployment Pipeline -->
		<div class="card">
			<h2>⚡ Deployment Pipeline</h2>
			<div class="pipeline">
				<span class="pipeline-step">Git Push</span>
				<span class="pipeline-arrow">→</span>
				<span class="pipeline-step">Argo Workflows</span>
				<span class="pipeline-arrow">→</span>
				<span class="pipeline-step">Harbor</span>
				<span class="pipeline-arrow">→</span>
				<span class="pipeline-step">Kargo</span>
				<span class="pipeline-arrow">→</span>
				<span class="pipeline-step">ArgoCD</span>
			</div>
		</div>

		<!-- RabbitMQ Demo -->
		<div class="card">
			<h2>🐰 RabbitMQ Demo</h2>
			<p class="card-desc">Message queue for async workloads</p>

			<div class="auth-status-row">
				<button onclick={checkRmqStatus} class="auth-status-btn">Check Status 🔗</button>
				<span class="auth-indicator" class:ok={rmqStatusOk}>{rmqStatusText}</span>
			</div>

			{#if data.features.rabbitmq}
				<div class="email-form">
					<input type="text" bind:value={rmqMessage} placeholder="Message (optional)" class="email-input" />
					<button onclick={rmqPublish} class="email-btn">Publish 📤</button>
				</div>
				{#if rmqResultVisible}
					<p class="auth-result" class:ok={rmqResultOk} class:error={!rmqResultOk}>{rmqResult}</p>
				{/if}
			{:else}
				<p class="disabled-note">⚠ Disabled (RABBITMQ_HOST not set)</p>
			{/if}
		</div>

		<!-- Chaos Testing -->
		<div class="card">
			<h2>🔥 Chaos Testing</h2>
			<p class="card-desc">Trigger errors, latency, and load for observability testing</p>

			<div class="chaos-buttons">
				<button onclick={() => chaosAction('error')} class="chaos-btn error">Trigger Error 💥</button>
				<button onclick={() => chaosAction('slow')} class="chaos-btn slow">Trigger Slow 🐌</button>
			</div>
			<div class="email-form" style="margin-top: 0.5rem;">
				<input type="number" bind:value={chaosLoadCount} placeholder="Count" class="email-input" style="max-width: 80px;" />
				<button onclick={() => chaosAction('load', chaosLoadCount)} class="chaos-btn load">Load Test ⚡</button>
			</div>
			{#if chaosResultVisible}
				<pre class="ff-result" class:ok={chaosResultOk} class:error={!chaosResultOk}>{chaosResult}</pre>
			{/if}
		</div>

		<!-- DefectDojo Security -->
		<div class="card">
			<h2>🛡️ DefectDojo Security</h2>
			<p class="card-desc">Vulnerability management platform</p>

			<div class="auth-status-row">
				<button onclick={checkDdStatus} class="auth-status-btn">Check Status 🔗</button>
				<span class="auth-indicator" class:ok={ddStatusOk}>{ddStatusText}</span>
			</div>

			{#if !data.features.defectdojo}
				<p class="disabled-note">⚠ Disabled (DEFECTDOJO_URL not set)</p>
			{/if}
		</div>

		<!-- Email Demo -->
		<div class="card">
			<h2>📧 Email Demo</h2>
			{#if data.features.smtp}
				<div class="email-form">
					<input
						type="email"
						bind:value={emailInput}
						placeholder="recipient@example.com"
						class="email-input"
					/>
					<button onclick={sendEmail} class="email-btn">Send Hello ✉️</button>
				</div>
				{#if emailStatus}
					<p class="email-status" class:error={emailError}>{emailStatus}</p>
				{/if}
			{:else}
				<p class="disabled-note">⚠ Disabled (SMTP_HOST not set)</p>
			{/if}
		</div>

		<!-- Knative Serverless -->
		<div class="card">
			<h2>⚡ Knative Serverless</h2>
			<div class="icon-list">
				<div class="icon-item">📐 Autoscaler</div>
				<div class="icon-item">🌐 Networking</div>
				<div class="icon-item">📋 Revisions</div>
				<div class="icon-item">🔗 Service Mesh</div>
			</div>
		</div>

		<!-- Valkey Cache Demo -->
		<div class="card">
			<h2>💾 Valkey Cache Demo</h2>
			<p class="card-desc">In-memory cache for fast key-value storage</p>

			<div class="auth-status-row">
				<button onclick={checkVkStatus} class="auth-status-btn">Check Status 🔗</button>
				<span class="auth-indicator" class:ok={vkStatusOk}>{vkStatusText}</span>
			</div>

			{#if data.features.valkey}
				<div class="auth-forms">
					<div class="auth-form-col">
						<p class="auth-form-label">Set Value</p>
						<input type="text" bind:value={vkSetKey} placeholder="Key" class="auth-input" />
						<input type="text" bind:value={vkSetValue} placeholder="Value" class="auth-input" />
						<input type="number" bind:value={vkSetTtl} placeholder="TTL (seconds)" class="auth-input" />
						<button onclick={vkSet} class="auth-btn register">Set 💾</button>
					</div>
					<div class="auth-form-col">
						<p class="auth-form-label">Get Value</p>
						<input type="text" bind:value={vkGetKey} placeholder="Key" class="auth-input" />
						<button onclick={vkGet} class="auth-btn login">Get 🔍</button>
					</div>
				</div>
				{#if vkResultVisible}
					<p class="auth-result" class:ok={vkResultOk} class:error={!vkResultOk}>{vkResult}</p>
				{/if}
			{:else}
				<p class="disabled-note">⚠ Disabled (VALKEY_HOST not set)</p>
			{/if}
		</div>

		<!-- BetterAuth -->
		<div class="card">
			<h2>🔐 BetterAuth</h2>
			<p class="card-desc">Application auth server for customer-facing apps</p>

			<div class="auth-status-row">
				<button onclick={checkAuthStatus} class="auth-status-btn">Check Status 🔗</button>
				<span class="auth-indicator" class:ok={authStatusOk}>{authStatusText}</span>
			</div>

			{#if data.features.betterauth}
				<div class="auth-forms">
					<div class="auth-form-col">
						<p class="auth-form-label">Register</p>
						<input type="text" bind:value={authRegName} placeholder="Name" class="auth-input" />
						<input type="email" bind:value={authRegEmail} placeholder="Email" class="auth-input" />
						<input type="password" bind:value={authRegPass} placeholder="Password" class="auth-input" />
						<button onclick={authRegister} class="auth-btn register">Register ✨</button>
					</div>
					<div class="auth-form-col">
						<p class="auth-form-label">Login</p>
						<input type="email" bind:value={authLoginEmail} placeholder="Email" class="auth-input" />
						<input type="password" bind:value={authLoginPass} placeholder="Password" class="auth-input" />
						<button onclick={authLogin} class="auth-btn login">Login 🔑</button>
					</div>
				</div>
				<button onclick={authSession} class="auth-session-btn">Validate Session 🎫</button>
				{#if authResultVisible}
					<p class="auth-result" class:ok={authResultOk} class:error={!authResultOk}>{authResult}</p>
				{/if}
			{:else}
				<p class="disabled-note">⚠ Not connected (BETTERAUTH_URL not set)</p>
			{/if}
		</div>

		<!-- GO Feature Flag -->
		<div class="card">
			<h2>🚩 Feature Flags</h2>
			<p class="card-desc">Evaluate feature flags in real-time via GO Feature Flag relay proxy</p>

			<div class="auth-status-row">
				<button onclick={checkFfStatus} class="auth-status-btn">Check Status 🔗</button>
				<span class="auth-indicator" class:ok={ffStatusOk}>{ffStatusText}</span>
			</div>

			{#if data.features.gofeatureflag}
				<div class="auth-forms">
					<div class="auth-form-col">
						<p class="auth-form-label">Evaluate Single Flag</p>
						<select bind:value={ffFlagName} class="auth-input">
							<option value="maintenance-mode">maintenance-mode</option>
							<option value="new-dashboard-layout">new-dashboard-layout</option>
							<option value="dark-mode">dark-mode</option>
							<option value="welcome-banner">welcome-banner</option>
						</select>
						<input type="text" bind:value={ffUserId} placeholder="User ID" class="auth-input" />
						<button onclick={ffEvaluate} class="auth-btn register">Evaluate 🎯</button>
					</div>
					<div class="auth-form-col">
						<p class="auth-form-label">Evaluate All Flags</p>
						<input type="text" bind:value={ffAllUserId} placeholder="User ID" class="auth-input" />
						<button onclick={ffEvalAll} class="auth-btn login">Evaluate All 🏁</button>
					</div>
				</div>
				{#if ffResultVisible}
					<pre class="ff-result" class:ok={ffResultOk} class:error={!ffResultOk}>{ffResult}</pre>
				{/if}
			{:else}
				<p class="disabled-note">⚠ Not connected (GOFEATUREFLAG_URL not set)</p>
			{/if}
		</div>

		<!-- Infrastructure Stack -->
		<div class="card">
			<h2>🏗️ Infrastructure Stack</h2>
			<div class="icon-list">
				<div class="icon-item">🔧 Talos OS</div>
				<div class="icon-item">🔗 Linkerd</div>
				<div class="icon-item">🐝 Cilium</div>
				<div class="icon-item">🔐 Keycloak</div>
				<div class="icon-item">🏗️ Harbor</div>
				<div class="icon-item">🛡️ CrowdSec</div>
			</div>
		</div>
	</div>

	<footer>
		<p>Framework: SvelteKit 5 • Last refreshed: {new Date().toISOString()}</p>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
		color: #e0e0e0;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.title {
		font-size: 2.5rem;
		font-weight: 700;
		background: linear-gradient(135deg, #00d2ff, #3a7bd5);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0 0 0.5rem;
	}

	.subtitle {
		color: #8892b0;
		margin: 0 0 1rem;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.badge-dev {
		background: rgba(255, 59, 48, 0.2);
		color: #ff6b6b;
		border: 1px solid rgba(255, 59, 48, 0.3);
	}
	.badge-staging {
		background: rgba(255, 204, 0, 0.2);
		color: #ffd43b;
		border: 1px solid rgba(255, 204, 0, 0.3);
	}
	.badge-prod {
		background: rgba(52, 199, 89, 0.2);
		color: #51cf66;
		border: 1px solid rgba(52, 199, 89, 0.3);
	}

	.stage-nav {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.stage-pill {
		padding: 0.35rem 1rem;
		border-radius: 9999px;
		font-size: 0.8rem;
		text-decoration: none;
		color: #8892b0;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition:
			background 0.2s,
			color 0.2s;
	}

	.stage-pill:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #e0e0e0;
	}

	.stage-pill.active {
		background: rgba(0, 210, 255, 0.15);
		color: #00d2ff;
		border-color: rgba(0, 210, 255, 0.3);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.card {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1.5rem;
	}

	.card h2 {
		font-size: 1.1rem;
		margin: 0 0 1rem;
		color: #e0e0e0;
	}

	.card-desc {
		color: #8892b0;
		font-size: 0.85rem;
		margin: -0.5rem 0 0.75rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-label {
		font-size: 0.7rem;
		color: #8892b0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.info-value {
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-size: 0.85rem;
		color: #00d2ff;
	}

	.icon-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.icon-item {
		font-size: 0.85rem;
		color: #ccd6f6;
	}

	.pipeline {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.pipeline-step {
		background: rgba(0, 210, 255, 0.1);
		border: 1px solid rgba(0, 210, 255, 0.2);
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
		font-size: 0.8rem;
		color: #00d2ff;
	}

	.pipeline-arrow {
		color: #4a5568;
		font-size: 1.2rem;
	}

	.api-list {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.api-list code {
		background: rgba(0, 0, 0, 0.3);
		padding: 0.3rem 0.6rem;
		border-radius: 4px;
		font-size: 0.8rem;
		color: #51cf66;
		font-family: 'SF Mono', 'Fira Code', monospace;
	}

	.disabled-note {
		color: #8892b0;
		font-size: 0.8rem;
		margin: 0.5rem 0 0;
		font-style: italic;
	}

	.email-form {
		display: flex;
		gap: 0.5rem;
	}

	.email-input {
		flex: 1;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		padding: 0.5rem 0.75rem;
		color: #e0e0e0;
		font-size: 0.85rem;
		outline: none;
	}

	.email-input:focus {
		border-color: rgba(0, 210, 255, 0.4);
	}

	.email-btn {
		background: linear-gradient(135deg, #00d2ff, #3a7bd5);
		border: none;
		border-radius: 6px;
		padding: 0.5rem 1rem;
		color: white;
		font-size: 0.85rem;
		cursor: pointer;
		white-space: nowrap;
	}

	.email-btn:hover {
		opacity: 0.9;
	}

	.email-status {
		margin: 0.5rem 0 0;
		font-size: 0.8rem;
		color: #51cf66;
	}

	.email-status.error {
		color: #ff6b6b;
	}

	/* BetterAuth styles */
	.auth-status-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.auth-status-btn {
		padding: 0.5rem 1rem;
		border-radius: 8px;
		border: 1px solid rgba(0, 217, 255, 0.3);
		background: rgba(0, 217, 255, 0.1);
		color: #00d9ff;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.85rem;
	}

	.auth-indicator {
		font-size: 0.85rem;
		color: #888;
	}

	.auth-indicator.ok {
		color: #00d26a;
	}

	.auth-forms {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.auth-form-label {
		color: #aaa;
		font-size: 0.8rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.auth-input {
		width: 100%;
		box-sizing: border-box;
		margin-bottom: 0.4rem;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		font-size: 0.85rem;
		outline: none;
	}

	.auth-input:focus {
		border-color: #00d9ff;
	}

	.auth-btn {
		width: 100%;
		padding: 0.5rem;
		border-radius: 6px;
		border: none;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.85rem;
		color: #1a1a2e;
	}

	.auth-btn.register {
		background: linear-gradient(90deg, #00d9ff, #00ff88);
	}

	.auth-btn.login {
		background: linear-gradient(90deg, #ff6b6b, #ffa07a);
	}

	.auth-session-btn {
		width: 100%;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.05);
		color: #ccc;
		cursor: pointer;
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.auth-result {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-size: 0.85rem;
	}

	.auth-result.ok {
		background: rgba(0, 210, 106, 0.2);
		color: #00d26a;
	}

	.auth-result.error {
		background: rgba(255, 100, 100, 0.2);
		color: #ff6b6b;
	}

	.ff-result {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-size: 0.8rem;
		font-family: monospace;
		white-space: pre-wrap;
		max-height: 200px;
		overflow-y: auto;
		margin: 0;
	}

	.ff-result.ok {
		background: rgba(0, 210, 106, 0.2);
		color: #00d26a;
	}

	.ff-result.error {
		background: rgba(255, 100, 100, 0.2);
		color: #ff6b6b;
	}

	/* Chaos testing styles */
	.chaos-buttons {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.chaos-btn {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: none;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.8rem;
		color: #1a1a2e;
	}

	.chaos-btn.error {
		background: linear-gradient(90deg, #ff6b6b, #ff4757);
	}

	.chaos-btn.slow {
		background: linear-gradient(90deg, #ffa502, #ff6348);
	}

	.chaos-btn.load {
		background: linear-gradient(90deg, #00d2ff, #3a7bd5);
	}

	.chaos-btn:hover {
		opacity: 0.9;
	}

	footer {
		text-align: center;
		margin-top: 2rem;
		padding: 1rem;
		color: #4a5568;
		font-size: 0.8rem;
	}

	@media (max-width: 768px) {
		.title {
			font-size: 1.75rem;
		}
		.grid {
			grid-template-columns: 1fr;
		}
		.pipeline {
			justify-content: center;
		}
	}
</style>
