import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export const GET = async () => {
	try {
		// Query the places table for pending submissions
		const { data, error } = await supabase
			.from('places')
			.select('*')
			.eq('status', 'pending')
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Supabase query error:', error);
			return json({ error: 'Failed to fetch submissions' }, { status: 500 });
		}

		return json({ submissions: data || [] });
	} catch (error) {
		console.error('Server error:', error);
		return json({ error: 'Server error' }, { status: 500 });
	}
};
