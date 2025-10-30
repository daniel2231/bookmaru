import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { sendContactNotification } from '$lib/server/notifications';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const email = body.email?.toString().trim() || null;
		const message = body.message?.toString().trim() || '';

		if (!message) {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		const ok = await sendContactNotification({ email, message });

		if (ok) {
			return json({ message: 'Notification sent' });
		}

		return json({ error: 'Failed to send notification' }, { status: 500 });
	} catch (err) {
		console.error('Contact API error:', err);
		return json({ error: 'Server error' }, { status: 500 });
	}
};
