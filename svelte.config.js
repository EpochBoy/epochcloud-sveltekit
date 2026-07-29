import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: false,
			envPrefix: ''
		}),
		experimental: {
			// Emit spans for the handle hook, server load functions and form
			// actions, and load src/instrumentation.server.ts ahead of
			// application code so the exporter is live before the first request.
			// Together these make every served request a span producer, so the
			// standing probe traffic keeps the trace pipeline fed with no human
			// browsing the app.
			tracing: { server: true },
			instrumentation: { server: true }
		}
	}
};

export default config;
