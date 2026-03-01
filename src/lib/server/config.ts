import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const config = {
	// Build info (injected at build time)
	version: publicEnv.PUBLIC_VERSION || 'dev',
	commit: publicEnv.PUBLIC_COMMIT || 'unknown',
	buildTime: publicEnv.PUBLIC_BUILD_TIME || 'unknown',

	// Runtime
	environment: env.ENVIRONMENT || 'dev',
	port: parseInt(env.PORT || '3000'),
	hostname: env.HOSTNAME || 'unknown',

	// Consumer mode
	consumerMode: env.CONSUMER_MODE === 'true',

	// OpenTelemetry
	otelEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT || 'alloy.alloy.svc.cluster.local:4317',

	// RabbitMQ
	rabbitmq: {
		host: env.RABBITMQ_HOST || '',
		port: parseInt(env.RABBITMQ_PORT || '5672'),
		username: env.RABBITMQ_USERNAME || '',
		password: env.RABBITMQ_PASSWORD || '',
		vhost: env.RABBITMQ_VHOST || '/',
		queue: env.RABBITMQ_QUEUE || 'epochcloud-demo',
		get enabled() {
			return !!env.RABBITMQ_HOST;
		}
	},

	// Valkey
	valkey: {
		host: env.VALKEY_HOST || '',
		port: parseInt(env.VALKEY_PORT || '6379'),
		password: env.VALKEY_PASSWORD || '',
		database: parseInt(env.VALKEY_DATABASE || '0'),
		get enabled() {
			return !!env.VALKEY_HOST;
		}
	},

	// DefectDojo
	defectdojo: {
		url: env.DEFECTDOJO_URL || '',
		token: env.DEFECTDOJO_TOKEN || '',
		get enabled() {
			return !!(env.DEFECTDOJO_URL && env.DEFECTDOJO_TOKEN);
		}
	},

	// Rybbit analytics
	rybbit: {
		siteId: env.RYBBIT_SITE_ID || '',
		host: env.RYBBIT_HOST || '',
		get enabled() {
			return !!(env.RYBBIT_SITE_ID && env.RYBBIT_HOST);
		}
	},

	// SMTP (Maddy)
	smtp: {
		host: env.SMTP_HOST || '',
		port: parseInt(env.SMTP_PORT || '587'),
		from: env.SMTP_FROM || 'noreply@epoch.engineering',
		get enabled() {
			return !!env.SMTP_HOST;
		}
	},

	// BetterAuth
	betterauth: {
		url: env.BETTERAUTH_URL || '',
		get enabled() {
			return !!env.BETTERAUTH_URL;
		}
	}
};
