<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import LocationRow from '$lib/LocationRow.svelte';
	import SearchBar from '$lib/SearchBar.svelte';
	import TableHeader from '$lib/TableHeader.svelte';
	import { _, locale } from 'svelte-i18n';
	import type { UiPlace } from '$lib/types';
	import { get as getStore } from 'svelte/store';
	import { placeRowToUiPlace } from '$lib/utils';
	import { getPageMeta } from '$lib/meta';

	import '$lib/i18n'; // Initialize i18n
	import HeroHeader from '$lib/HeroHeader.svelte';

	// Load saved language preference
	onMount(() => {
		if (typeof window !== 'undefined') {
			const savedLang = localStorage.getItem('language');
			if (savedLang) {
				import('svelte-i18n').then(({ locale }) => {
					locale.set(savedLang);
				});
			}
		}
	});

	// State management
	let allLocations: UiPlace[] = []; // All loaded locations
	let filteredLocations: UiPlace[] = []; // Filtered by search
	let displayedLocations: UiPlace[] = []; // Currently displayed (lazy loaded)
	let loading = true;
	let loadingMore = false;
	let error: string | null = null;
	let rawData: any[] = []; // Store raw data from database
	let searchQuery = '';
	let hasMoreData = true;
	let currentPage = 0;
	const ITEMS_PER_PAGE = 20;

	// Make translations reactive
	$: currentLocale = $locale || 'en';
	$: nameHeader = $_('table.header.name');
	$: cityHeader = $_('table.header.city');
	$: categoryHeader = $_('table.header.category');
	$: quietnessHeader = $_('table.header.quietness');

	// Generate meta tags
	$: metaTags = getPageMeta('home');

	// Search functionality
	function filterLocations(): void {
		let filtered = [...allLocations];

		// Apply search filter
		if (searchQuery) {
			filtered = filtered.filter((location) => {
				const searchFields = [
					location.name,
					location.description,
					location.region,
					location.category,
					location.recommended_book?.title,
					location.recommended_book?.author
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();

				return searchFields.includes(searchQuery);
			});
		}

		filteredLocations = filtered;

		// Reset pagination when filtering
		currentPage = 0;
		displayedLocations = [];
		hasMoreData = filteredLocations.length > 0;
		loadMoreLocations();
	}

	// Search functionality
	function searchLocations(query: string): void {
		searchQuery = query.toLowerCase().trim();
		filterLocations();
	}

	// Handle search event
	function handleSearchEvent(query: string): void {
		searchLocations(query);
	}

	// Load more locations for lazy loading
	function loadMoreLocations(): void {
		if (loadingMore || !hasMoreData) return;

		loadingMore = true;
		const startIndex = currentPage * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		const newLocations = filteredLocations.slice(startIndex, endIndex);

		displayedLocations = [...displayedLocations, ...newLocations];
		currentPage++;
		hasMoreData = endIndex < filteredLocations.length;
		loadingMore = false;
	}

	async function loadAllLocations(): Promise<void> {
		try {
			loading = true;
			const { data, error: supabaseError } = await supabase
				.from('places')
				.select(
					'id, original_language, name_en, name_ko, description_en, description_ko, city_ko, city_en, district_ko, district_en, category, quietness, photos, latitude, longitude, recommended_book_en, recommended_book_ko, status, translation_reviewed, created_at, updated_at'
				)
				.eq('status', 'approved')
				.order('updated_at', { ascending: false });

			if (supabaseError) throw supabaseError;

			rawData = data ?? [];
			// Process locations with current locale
			allLocations = rawData.map((row) => placeRowToUiPlace(row, currentLocale));
			filteredLocations = [...allLocations];
			hasMoreData = allLocations.length > 0;
			loadMoreLocations();
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
			console.error('Error loading locations:', err);
		} finally {
			loading = false;
		}
	}

	// Reprocess locations when language changes
	$: if (rawData.length > 0) {
		allLocations = rawData.map((row) => placeRowToUiPlace(row, currentLocale));
		// Re-run filtering with current filters
		filterLocations();
	}

	onMount(() => {
		loadAllLocations();
	});
</script>

<svelte:head>
	{@html metaTags}
</svelte:head>

<HeroHeader />

<!-- Search and Filter Controls -->
<div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
	<div class="flex-1">
		<SearchBar bind:searchQuery onSearch={handleSearchEvent} />
	</div>
</div>

{#if loading}
	<div class="loading flex min-h-[60vh] items-center justify-center text-brand-primary">
		{$_('messages.loading')}
	</div>
{:else if error}
	<div class="error">{$_('messages.error')}: {error}</div>
{:else if displayedLocations.length === 0}
	<div class="empty flex min-h-[60vh] flex-col items-center justify-center text-center">
		{#if searchQuery}
			<h2>{$_('search.noResults')} "{searchQuery}"</h2>
			<p>
				Try a different search term or <button
					onclick={() => searchLocations('')}
					class="text-brand-primary underline hover:text-brand-secondary"
					>{$_('search.clearSearch')}</button
				>
			</p>
		{:else}
			<h2>{$_('messages.noLocations')}</h2>
			<p>{$_('messages.beFirst')} <a href="/submit">{$_('messages.addSpot')}</a></p>
		{/if}
	</div>
{:else}
	<!-- Desktop table -->
	<div class="mt-5 mb-8 hidden md:block">
		<table class="w-full table-fixed border-collapse">
			<TableHeader />
			<tbody>
				{#each displayedLocations as location, index (location.id)}
					<LocationRow {location} {index} />
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Mobile cards container -->
	<div class="mt-5 mb-8 md:hidden">
		{#each displayedLocations as location, index (location.id)}
			<LocationRow {location} {index} />
		{/each}
	</div>

	<!-- Load More Button -->
	{#if hasMoreData}
		<div class="flex justify-center py-8">
			<button
				onclick={loadMoreLocations}
				disabled={loadingMore}
				class="rounded-lg bg-brand-primary px-6 py-3 text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if loadingMore}
					{$_('search.loadingMore')}
				{:else}
					{$_('search.loadMore')} ({filteredLocations.length - displayedLocations.length}
					{$_('search.remaining')})
				{/if}
			</button>
		</div>
	{/if}
{/if}
