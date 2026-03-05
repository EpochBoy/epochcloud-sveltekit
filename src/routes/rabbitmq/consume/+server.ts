import type { RequestHandler } from './$types';
import { getRabbitStatus } from '$lib/server/rabbitmq.js';

export const GET: RequestHandler = async () => {
	const status = getRabbitStatus();
	return new Response(
		JSON.stringify({
			success: true,
			messages: status.consumed_messages,
			count: status.consumed_messages.length,
			timestamp: new Date().toISOString()
		}),
		{ headers: { 'Content-Type': 'application/json' } }
	);
};
