/**
 * Places Store - Reactive state management for places with performance optimizations
 */

import { writable, derived } from 'svelte/store';
import { placesService } from '../services/places.service';
import type { UiPlace, Language } from '../types';

interface PlacesState {
	places: UiPlace[];
	loading: boolean;
	loadingMore: boolean;
	error: string | null;
	hasMore: boolean;
	total: number;
	searchQuery: string;
	language: Language;
}

// Create the main store
function createPlacesStore() {
	const { subscribe, set, update } = writable<PlacesState>({
		places: [],
		loading: false,
		loadingMore: false,
		error: null,
		hasMore: false,
		total: 0,
		searchQuery: '',
		language: 'en'
	});

	return {
		subscribe,

		/**
		 * Load initial places
		 */
		async loadPlaces(language: Language = 'en', searchQuery: string = '') {
			update((state) => ({ ...state, loading: true, error: null, language, searchQuery }));

			try {
				const result = await placesService.getPlaces(0, 20, searchQuery, language);
				update((state) => ({
					...state,
					places: result.places,
					hasMore: result.hasMore,
					total: result.total,
					loading: false
				}));
			} catch (error) {
				update((state) => ({
					...state,
					error: error instanceof Error ? error.message : 'Failed to load places',
					loading: false
				}));
			}
		},

		/**
		 * Load more places (pagination)
		 */
		async loadMore() {
			update((state) => ({ ...state, loadingMore: true }));

			try {
				const currentState = await new Promise<PlacesState>((resolve) => {
					const unsubscribe = subscribe((state) => {
						resolve(state);
						unsubscribe();
					});
				});

				const nextPage = Math.floor(currentState.places.length / 20);
				const result = await placesService.getPlaces(
					nextPage,
					20,
					currentState.searchQuery,
					currentState.language
				);

				update((state) => ({
					...state,
					places: [...state.places, ...result.places],
					hasMore: result.hasMore,
					loadingMore: false
				}));
			} catch (error) {
				update((state) => ({
					...state,
					error: error instanceof Error ? error.message : 'Failed to load more places',
					loadingMore: false
				}));
			}
		},

		/**
		 * Search places
		 */
		async search(query: string, language: Language = 'en') {
			update((state) => ({
				...state,
				loading: true,
				error: null,
				searchQuery: query,
				language,
				places: [] // Clear current places
			}));

			try {
				const result = await placesService.searchPlaces(query, language, 0, 20);
				update((state) => ({
					...state,
					places: result.places,
					hasMore: result.hasMore,
					total: result.total,
					loading: false
				}));
			} catch (error) {
				update((state) => ({
					...state,
					error: error instanceof Error ? error.message : 'Search failed',
					loading: false
				}));
			}
		},

		/**
		 * Change language and reload
		 */
		async changeLanguage(language: Language) {
			const currentState = await new Promise<PlacesState>((resolve) => {
				const unsubscribe = subscribe((state) => {
					resolve(state);
					unsubscribe();
				});
			});

			// Clear cache for old language
			placesService.clearCache(currentState.language);

			// Reload with new language
			await this.loadPlaces(language, currentState.searchQuery);
		},

		/**
		 * Clear error state
		 */
		clearError() {
			update((state) => ({ ...state, error: null }));
		},

		/**
		 * Reset store
		 */
		reset() {
			set({
				places: [],
				loading: false,
				loadingMore: false,
				error: null,
				hasMore: false,
				total: 0,
				searchQuery: '',
				language: 'en'
			});
		}
	};
}

export const placesStore = createPlacesStore();

// Derived stores for specific data
export const places = derived(placesStore, ($store) => $store.places);
export const loading = derived(placesStore, ($store) => $store.loading);
export const loadingMore = derived(placesStore, ($store) => $store.loadingMore);
export const error = derived(placesStore, ($store) => $store.error);
export const hasMore = derived(placesStore, ($store) => $store.hasMore);
export const total = derived(placesStore, ($store) => $store.total);
