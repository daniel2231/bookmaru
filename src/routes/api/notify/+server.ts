import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendNewEntryNotification } from '$lib/server/notifications';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const { type, payload } = body || {};

		if (type === 'new_entry') {
			const ok = await sendNewEntryNotification(payload || {});
			return json({ success: ok });
		}

		return json({ success: false, error: 'Unsupported notification type' }, { status: 400 });
	} catch (error) {
		console.error('notify endpoint error:', error);
		return json({ success: false, error: 'Internal error' }, { status: 500 });
	}
};
