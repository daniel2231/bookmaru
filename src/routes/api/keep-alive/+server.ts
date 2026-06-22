import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import type { Database } from '$lib/database.types';

export const GET = async () => {
	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

	if (!serviceRoleKey) {
		console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
		return json({ ok: false, error: 'Server configuration error' }, { status: 500 });
	}

	const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, serviceRoleKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});

	const { error } = await supabase.from('places').select('id').limit(1);

	if (error) {
		console.error('Supabase keep-alive query error:', error);
		return json({ ok: false, error: 'Keep-alive query failed' }, { status: 500 });
	}

	return json({ ok: true });
};
