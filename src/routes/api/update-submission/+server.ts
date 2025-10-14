import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { id, ...updateData } = data;

		if (!id) {
			return json({ error: 'Submission ID is required' }, { status: 400 });
		}

		console.log(`Updating submission with ID: ${id}`, updateData);

		// Update the submission in Supabase
		const { error } = await supabase
			.from('places')
			.update({
				...updateData,
				updated_at: new Date().toISOString()
			})
			.eq('id', id);

		if (error) {
			console.error('Supabase update error:', error);
			return json({ error: 'Failed to update submission in database' }, { status: 500 });
		}

		return json({
			success: true,
			message: 'Submission updated successfully',
			submission: { id, ...updateData }
		});
	} catch (error) {
		console.error('Error updating submission:', error);
		return json({ error: 'Failed to update submission' }, { status: 500 });
	}
};
