import type { PageServerLoad } from './$types';
import { config } from '$lib/server/config.js';

export const load: PageServerLoad = async () => {
	return {
		version: config.version,
		commit: config.commit,
		buildTime: config.buildTime,
		hostname: config.hostname,
		environment: config.environment,
		consumerMode: config.consumerMode,
		rybbit: config.rybbit.enabled
			? { siteId: config.rybbit.siteId, host: config.rybbit.host }
			: null,
		features: {
			rabbitmq: config.rabbitmq.enabled,
			valkey: config.valkey.enabled,
			defectdojo: config.defectdojo.enabled,
			smtp: config.smtp.enabled,
			betterauth: config.betterauth.enabled
		}
	};
};
