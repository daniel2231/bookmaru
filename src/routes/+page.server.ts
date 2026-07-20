import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { PageServerLoad } from './$types';
import type { Database } from '$lib/database.types';

export const load: PageServerLoad = async () => {
	const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false
		}
	});

	const { data, error } = await supabase
		.from('places')
		.select(
			'id, original_language, name_en, name_ko, description_en, description_ko, city_ko, city_en, district_ko, district_en, category, quietness, photos, latitude, longitude, recommended_book_en, recommended_book_ko, status, created_at, updated_at'
		)
		.eq('status', 'approved')
		.order('updated_at', { ascending: false });

	return {
		places: data ?? [],
		loadError: error?.message ?? null
	};
};
