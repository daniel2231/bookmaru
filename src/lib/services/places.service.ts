/**
 * Places Service - Handles all place-related data operations with caching
 */

import type { UiPlace, Language } from '../types';
import { placeRowToUiPlace } from '../utils';

interface PlacesResponse {
	places: any[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	};
}

interface CacheEntry {
	data: UiPlace[];
	timestamp: number;
	language: string;
	searchQuery: string;
}

class PlacesService {
	private cache = new Map<string, CacheEntry>();
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
	private readonly CACHE_KEY_PREFIX = 'places_';

	/**
	 * Get places with server-side pagination and caching
	 */
	async getPlaces(
		page: number = 0,
		limit: number = 20,
		searchQuery: string = '',
		language: Language = 'en'
	): Promise<{ places: UiPlace[]; hasMore: boolean; total: number }> {
		const cacheKey = `${this.CACHE_KEY_PREFIX}${page}_${limit}_${searchQuery}_${language}`;

		// Check cache first
		const cached = this.cache.get(cacheKey);
		if (cached && this.isCacheValid(cached)) {
			return {
				places: cached.data,
				hasMore: cached.data.length === limit,
				total: cached.data.length
			};
		}

		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				...(searchQuery && { search: searchQuery }),
				language
			});

			const response = await fetch(`/api/places?${params}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: PlacesResponse = await response.json();

			// Transform data to UI format
			const uiPlaces = result.places.map((row) => placeRowToUiPlace(row, language));

			// Cache the result
			this.cache.set(cacheKey, {
				data: uiPlaces,
				timestamp: Date.now(),
				language,
				searchQuery
			});

			return {
				places: uiPlaces,
				hasMore: result.pagination.hasMore,
				total: result.pagination.total
			};
		} catch (error) {
			console.error('Error fetching places:', error);
			throw error;
		}
	}

	/**
	 * Search places with debounced server-side search
	 */
	async searchPlaces(
		query: string,
		language: Language = 'en',
		page: number = 0,
		limit: number = 20
	): Promise<{ places: UiPlace[]; hasMore: boolean; total: number }> {
		return this.getPlaces(page, limit, query, language);
	}

	/**
	 * Clear cache for a specific language or all cache
	 */
	clearCache(language?: Language): void {
		if (language) {
			// Clear cache for specific language
			for (const [key, entry] of this.cache.entries()) {
				if (entry.language === language) {
					this.cache.delete(key);
				}
			}
		} else {
			// Clear all cache
			this.cache.clear();
		}
	}

	/**
	 * Check if cache entry is still valid
	 */
	private isCacheValid(entry: CacheEntry): boolean {
		return Date.now() - entry.timestamp < this.CACHE_DURATION;
	}

	/**
	 * Get cache statistics for debugging
	 */
	getCacheStats(): { size: number; entries: string[] } {
		return {
			size: this.cache.size,
			entries: Array.from(this.cache.keys())
		};
	}
}

// Export singleton instance
export const placesService = new PlacesService();
