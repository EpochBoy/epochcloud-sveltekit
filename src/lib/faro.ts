import { getWebInstrumentations, initializeFaro, type Faro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

let faro: Faro | null = null;

export function setupFaro(config: { version: string; environment: string }) {
	if (faro || typeof window === 'undefined') return;

	faro = initializeFaro({
		url: '/api/faro/collect',
		app: {
			name: 'epochcloud-demo',
			version: config.version,
			environment: config.environment
		},
		instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()]
	});

	return faro;
}
