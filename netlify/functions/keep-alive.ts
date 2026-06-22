import { createClient } from '@supabase/supabase-js';

export default async () => {
	const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		console.error('Supabase keep-alive environment variables are not configured');
		return Response.json({ ok: false, error: 'Server configuration error' }, { status: 500 });
	}

	const supabase = createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});

	const { error } = await supabase.from('places').select('id').limit(1);

	if (error) {
		console.error('Supabase keep-alive query error:', error);
		return Response.json({ ok: false, error: 'Keep-alive query failed' }, { status: 500 });
	}

	return Response.json({ ok: true });
};
