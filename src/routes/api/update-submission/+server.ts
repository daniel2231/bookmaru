import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/database.types';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
type PlaceUpdate = Database['public']['Tables']['places']['Update'];

const editableFields: Array<keyof PlaceUpdate> = [
	'name_en',
	'name_ko',
	'description_en',
	'description_ko',
	'category',
	'city_ko',
	'city_en',
	'district_ko',
	'district_en',
	'original_language',
	'latitude',
	'longitude',
	'quietness',
	'photos',
	'recommended_book_en',
	'recommended_book_ko',
	'status',
	'created_at'
];

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { id } = data;

		if (!id) {
			return json({ error: 'Submission ID is required' }, { status: 400 });
		}

		const updateData = editableFields.reduce<PlaceUpdate>((acc, field) => {
			if (field in data) {
				acc[field] = data[field];
			}

			return acc;
		}, {});

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
