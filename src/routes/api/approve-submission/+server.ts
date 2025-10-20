import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

async function callTranslationFunction(
	submissionId: number,
	originalLanguage: string,
	name: string,
	description: string,
	recommendedBook: unknown
) {
	try {
		const response = await fetch(
			'https://gsymxzlpjdmborouiblj.supabase.co/functions/v1/bookmaru-functions',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`
				},
				body: JSON.stringify({
					submission_id: submissionId,
					original_language: originalLanguage,
					name: name,
					description: description,
					recommended_book: recommendedBook
				})
			}
		);

		if (!response.ok) {
			throw new Error(`Translation function failed: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Translation function error:', error);
		throw error;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { id } = await request.json();

		if (!id) {
			return json({ error: 'Submission ID is required' }, { status: 400 });
		}

		console.log(`Approving submission with ID: ${id}`);

		// First, get the submission data to understand what needs translation
		const { data: submission, error: fetchError } = await supabase
			.from('places')
			.select('*')
			.eq('id', id)
			.single();

		if (fetchError) {
			console.error('Error fetching submission:', fetchError);
			return json({ error: 'Failed to fetch submission data' }, { status: 500 });
		}

		// Determine what needs translation based on original_language
		const originalLanguage = submission.original_language;
		let translationData = null;

		if (originalLanguage === 'ko') {
			// Korean submission - translate to English
			const name = submission.name_ko;
			const description = submission.description_ko;
			const recommendedBook = submission.recommended_book_ko;

			if (name) {
				console.log('Translating Korean submission to English...');
				translationData = await callTranslationFunction(
					id,
					originalLanguage,
					name,
					description,
					recommendedBook
				);
			}
		} else if (originalLanguage === 'en') {
			// English submission - translate to Korean
			const name = submission.name_en;
			const description = submission.description_en;
			const recommendedBook = submission.recommended_book_en;

			if (name) {
				console.log('Translating English submission to Korean...');
				translationData = await callTranslationFunction(
					id,
					originalLanguage,
					name,
					description,
					recommendedBook
				);
			}
		}

		// Prepare update data
		const updateData: Record<string, unknown> = {
			status: 'approved',
			updated_at: new Date().toISOString()
		};

		// Add translated content if translation was successful
		if (translationData) {
			if (originalLanguage === 'ko') {
				// Add English translations
				updateData.name_en = translationData.name;
				if (translationData.description) {
					updateData.description_en = translationData.description;
				}
				if (translationData.recommended_book) {
					updateData.recommended_book_en = translationData.recommended_book;
				}
			} else if (originalLanguage === 'en') {
				// Add Korean translations
				updateData.name_ko = translationData.name;
				if (translationData.description) {
					updateData.description_ko = translationData.description;
				}
				if (translationData.recommended_book) {
					updateData.recommended_book_ko = translationData.recommended_book;
				}
			}
		}

		// Update the submission with approval status and translations
		const { error } = await supabase.from('places').update(updateData).eq('id', id);

		if (error) {
			console.error('Supabase update error:', error);
			return json({ error: 'Failed to approve submission in database' }, { status: 500 });
		}

		const message = translationData
			? 'Submission approved and translated successfully'
			: 'Submission approved successfully (no translation needed)';

		return json({ success: true, message, translated: !!translationData });
	} catch (error) {
		console.error('Error approving submission:', error);
		return json({ error: 'Failed to approve submission' }, { status: 500 });
	}
};
