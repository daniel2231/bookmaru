import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export const GET = async ({ url }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '0');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const search = url.searchParams.get('search') || '';
		const language = url.searchParams.get('language') || 'en';

		const offset = page * limit;

		// Build the query with server-side filtering
		let query = supabase
			.from('places')
			.select(
				`
				id, 
				original_language, 
				name_en, 
				name_ko, 
				description_en, 
				description_ko, 
				location_en, 
				location_ko, 
				district_en, 
				district_ko, 
				category, 
				quietness, 
				photos, 
				latitude, 
				longitude, 
				recommended_book_en, 
				recommended_book_ko, 
				status, 
				created_at, 
				updated_at
			`
			)
			.eq('status', 'approved')
			.order('updated_at', { ascending: false });

		// Add search filtering at database level if search term provided
		if (search) {
			const searchTerm = `%${search}%`;
			query = query.or(`
				name_en.ilike.${searchTerm},
				name_ko.ilike.${searchTerm},
				description_en.ilike.${searchTerm},
				description_ko.ilike.${searchTerm},
				location_en.ilike.${searchTerm},
				location_ko.ilike.${searchTerm},
				district_en.ilike.${searchTerm},
				district_ko.ilike.${searchTerm},
				category.ilike.${searchTerm}
			`);
		}

		// Add pagination
		query = query.range(offset, offset + limit - 1);

		const { data, error } = await query;

		if (error) {
			console.error('Supabase query error:', error);
			return json({ error: `Failed to fetch places: ${error.message}` }, { status: 500 });
		}

		return json({
			places: data || [],
			pagination: {
				page,
				limit,
				total: data?.length || 0,
				hasMore: (data?.length || 0) === limit
			}
		});
	} catch (error) {
		console.error('Server error:', error);
		return json({ error: 'Server error' }, { status: 500 });
	}
};
