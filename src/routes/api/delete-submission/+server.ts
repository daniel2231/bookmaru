import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export const DELETE: RequestHandler = async ({ request, url }) => {
	try {
		const { id } = await request.json();

		if (!id) {
			return json({ error: 'Submission ID is required' }, { status: 400 });
		}

		console.log(`Deleting submission with ID: ${id}`);

		// Delete from places table
		const { error } = await supabase.from('places').delete().eq('id', id);

		if (error) {
			console.error('Supabase delete error:', error);
			return json({ error: 'Failed to delete submission from database' }, { status: 500 });
		}

		return json({ success: true, message: 'Submission deleted successfully' });
	} catch (error) {
		console.error('Error deleting submission:', error);
		return json({ error: 'Failed to delete submission' }, { status: 500 });
	}
};
