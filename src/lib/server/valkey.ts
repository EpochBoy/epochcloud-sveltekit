import Redis from 'ioredis';
import { config } from './config.js';
import { log } from './logger.js';
import { valkeyConnected, valkeyCacheHits, valkeyCacheMisses, valkeyOperations } from './metrics.js';

let client: Redis | null = null;

export async function initValkey(): Promise<void> {
	if (!config.valkey.enabled) {
		log('info', 'Valkey disabled (VALKEY_HOST not set)');
		return;
	}

	try {
		client = new Redis({
			host: config.valkey.host,
			port: config.valkey.port,
			password: config.valkey.password || undefined,
			db: config.valkey.database,
			retryStrategy: (times) => {
				if (times > 5) return null; // Stop retrying after 5 attempts
				return Math.min(times * 1000, 30000);
			},
			lazyConnect: true
		});

		client.on('connect', () => {
			valkeyConnected.set(1);
			log('info', 'Valkey connected', { host: config.valkey.host });
		});

		client.on('error', (err) => {
			valkeyConnected.set(0);
			log('error', 'Valkey error', { error: String(err) });
		});

		client.on('close', () => {
			valkeyConnected.set(0);
		});

		await client.connect();
	} catch (err) {
		log('error', 'Valkey init failed', { error: String(err) });
		valkeyConnected.set(0);
	}
}

export async function valkeyGet(key: string): Promise<string | null> {
	if (!client) throw new Error('Valkey not connected');

	valkeyOperations.inc({ operation: 'get' });
	const value = await client.get(key);

	if (value !== null) {
		valkeyCacheHits.inc();
	} else {
		valkeyCacheMisses.inc();
	}

	return value;
}

export async function valkeySet(key: string, value: string, ttlSeconds?: number): Promise<void> {
	if (!client) throw new Error('Valkey not connected');

	valkeyOperations.inc({ operation: 'set' });
	if (ttlSeconds) {
		await client.set(key, value, 'EX', ttlSeconds);
	} else {
		await client.set(key, value);
	}
}

export function getValkeyStatus() {
	return {
		connected: client?.status === 'ready'
	};
}
