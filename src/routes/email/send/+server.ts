import type { RequestHandler } from './$types';
import { sendEmail } from '$lib/server/smtp.js';
import { config } from '$lib/server/config.js';

export const GET: RequestHandler = async ({ url }) => {
	const email = url.searchParams.get('email');
	if (!email) {
		return new Response(
			JSON.stringify({ error: 'Missing email parameter', timestamp: new Date().toISOString() }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}

	if (!config.smtp.enabled) {
		return new Response(
			JSON.stringify({
				error: 'SMTP not configured (SMTP_HOST not set)',
				timestamp: new Date().toISOString()
			}),
			{ status: 503, headers: { 'Content-Type': 'application/json' } }
		);
	}

	try {
		await sendEmail(email);
		return new Response(
			JSON.stringify({
				success: true,
				message: `Email sent to ${email}`,
				timestamp: new Date().toISOString()
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (err) {
		return new Response(
			JSON.stringify({
				success: false,
				error: String(err),
				timestamp: new Date().toISOString()
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const email = formData.get('email')?.toString();

	if (!email) {
		return new Response(
			JSON.stringify({ error: 'Missing email field', timestamp: new Date().toISOString() }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}

	if (!config.smtp.enabled) {
		return new Response(
			JSON.stringify({
				error: 'SMTP not configured (SMTP_HOST not set)',
				timestamp: new Date().toISOString()
			}),
			{ status: 503, headers: { 'Content-Type': 'application/json' } }
		);
	}

	try {
		await sendEmail(email);
		return new Response(
			JSON.stringify({
				success: true,
				message: `Email sent to ${email}`,
				timestamp: new Date().toISOString()
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (err) {
		return new Response(
			JSON.stringify({
				success: false,
				error: String(err),
				timestamp: new Date().toISOString()
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
