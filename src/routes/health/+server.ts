import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return new Response(
		JSON.stringify({
			status: 'healthy',
			timestamp: new Date().toISOString()
		}),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
};
