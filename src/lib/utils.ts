/**
 * Utility functions for the Bookmaru application
 */

import type { PlaceRow, UiPlace, Language, RecommendedBook } from './types';

/**
 * Converts a database PlaceRow to a UI-friendly UiPlace object
 * Selects the appropriate language fields based on the current locale
 */
export function placeRowToUiPlace(row: PlaceRow, currentLocale: string): UiPlace {
	const isKo = currentLocale.startsWith('ko');

	const name = isKo ? (row.name_ko ?? row.name_en ?? '') : (row.name_en ?? row.name_ko ?? '');

	const description = isKo
		? (row.description_ko ?? row.description_en)
		: (row.description_en ?? row.description_ko);

	// Combine city and district for display, with fallback to old region fields
	let region: string | null = null;

	// Try new city/district fields first
	if (row.city_ko || row.city_en || row.district_ko || row.district_en) {
		const city = isKo ? (row.city_ko ?? row.city_en) : (row.city_en ?? row.city_ko);
		const district = isKo
			? (row.district_ko ?? row.district_en)
			: (row.district_en ?? row.district_ko);

		if (city && district) {
			region = `${city} ${district}`;
		} else if (city) {
			region = city;
		}
	}

	// Fallback to city/district fields if region is not available
	if (!region) {
		const city = isKo ? (row.city_ko ?? row.city_en) : (row.city_en ?? row.city_ko);
		const district = isKo
			? (row.district_ko ?? row.district_en)
			: (row.district_en ?? row.district_ko);
		region = [city, district].filter(Boolean).join(' ');
	}

	// Parse recommended book from JSONB (now single object instead of array)
	const recommendedBookJson = isKo
		? (row.recommended_book_ko ?? row.recommended_book_en)
		: (row.recommended_book_en ?? row.recommended_book_ko);

	let recommended_book: RecommendedBook | null = null;
	if (recommendedBookJson) {
		try {
			const parsed =
				typeof recommendedBookJson === 'string'
					? JSON.parse(recommendedBookJson)
					: recommendedBookJson;
			if (parsed && typeof parsed === 'object' && 'title' in parsed && 'author' in parsed) {
				recommended_book = parsed as RecommendedBook;
			}
		} catch (e) {
			console.error('Failed to parse recommended book:', e);
		}
	}

	return {
		id: row.id.toString(),
		name,
		description: description ?? null,
		region: region ?? null,
		category: row.category,
		quietness: row.quietness,
		photos: row.photos,
		latitude: row.latitude,
		longitude: row.longitude,
		recommended_book
	};
}

/**
 * Gets the current language preference from localStorage
 */
export function getStoredLanguage(): Language | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('language');
	return stored === 'ko' || stored === 'en' ? stored : null;
}

/**
 * Saves the language preference to localStorage
 */
export function saveLanguage(lang: Language): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem('language', lang);
}

/**
 * Generates a simple, URL-safe ID (8 characters)
 */
export function generateSimpleId(): string {
	return Math.random().toString(36).slice(2, 10);
}

/**
 * Parses a comma-separated string into an array of trimmed strings
 * Returns null if the input is empty or results in an empty array
 */
export function parseCommaSeparated(input: string): string[] | null {
	if (!input.trim()) return null;
	const result = input
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
	return result.length > 0 ? result : null;
}
