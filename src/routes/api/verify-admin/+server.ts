import { json } from '@sveltejs/kit';
import { PRIVATE_ADMIN_PASSWORD } from '$env/static/private';

export const POST = async ({ request }: { request: Request }) => {
	try {
		const { password } = await request.json();

		if (!password) {
			return json({ error: 'Password is required' }, { status: 400 });
		}

		if (password !== PRIVATE_ADMIN_PASSWORD) {
			return json({ error: 'Invalid password' }, { status: 401 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Admin verification error:', error);
		return json({ error: 'Server error' }, { status: 500 });
	}
};
