<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let emailInput = $state('');
	let emailStatus = $state('');
	let emailError = $state(false);

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
			{#each stages as stage}
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
			<div class="api-list">
				<code>GET /rabbitmq/status</code>
				<code>GET /rabbitmq/publish</code>
				<code>GET /rabbitmq/publish?message=Hello</code>
			</div>
			{#if !data.features.rabbitmq}
				<p class="disabled-note">⚠ Disabled (RABBITMQ_HOST not set)</p>
			{/if}
		</div>

		<!-- Chaos Testing -->
		<div class="card">
			<h2>🔥 Chaos Testing</h2>
			<div class="api-list">
				<code>GET /chaos?action=error</code>
				<code>GET /chaos?action=slow</code>
				<code>GET /chaos?action=load&count=10</code>
			</div>
		</div>

		<!-- DefectDojo Security -->
		<div class="card">
			<h2>🛡️ DefectDojo Security</h2>
			<div class="api-list">
				<code>GET /defectdojo/status</code>
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
			<div class="api-list">
				<code>GET /cache/status</code>
				<code>GET /cache/set?key=demo&value=hello&ttl=300</code>
				<code>GET /cache/get?key=demo</code>
			</div>
			{#if !data.features.valkey}
				<p class="disabled-note">⚠ Disabled (VALKEY_HOST not set)</p>
			{/if}
		</div>

		<!-- BetterAuth -->
		<div class="card">
			<h2>🔐 BetterAuth</h2>
			<p class="card-desc">Application auth server for customer-facing apps</p>
			<div class="icon-list">
				<div class="icon-item">👤 User Registration</div>
				<div class="icon-item">🔑 Login & Sessions</div>
				<div class="icon-item">🏢 Organizations</div>
				<div class="icon-item">🔒 Keycloak SSO</div>
			</div>
			{#if !data.features.betterauth}
				<p class="disabled-note">⚠ Not connected (BETTERAUTH_URL not set)</p>
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
