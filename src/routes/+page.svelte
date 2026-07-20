<script lang="ts">
	import { onMount } from 'svelte';
	import LocationRow from '$lib/LocationRow.svelte';
	import SearchBar from '$lib/SearchBar.svelte';
	import TableHeader from '$lib/TableHeader.svelte';
	import { _, locale } from 'svelte-i18n';
	import type { UiPlace } from '$lib/types';
	import { placeRowToUiPlace } from '$lib/utils';
	import { getPageMeta } from '$lib/meta';
	import Seo from '$lib/Seo.svelte';
	import type { PageData } from './$types';

	import '$lib/i18n'; // Initialize i18n
	import HeroHeader from '$lib/HeroHeader.svelte';

	export let data: PageData;

	const ITEMS_PER_PAGE = 20;

	// Initialize the page from server-rendered data so approved places are included in the initial HTML.
	let rawData: any[] = data.places ?? [];
	let allLocations: UiPlace[] = rawData.map((row) => placeRowToUiPlace(row, 'en'));
	let filteredLocations: UiPlace[] = [...allLocations];
	let displayedLocations: UiPlace[] = filteredLocations.slice(0, ITEMS_PER_PAGE);
	let loading = false;
	let loadingMore = false;
	let error: string | null = data.loadError ?? null;
	let searchQuery = '';
	let currentPage = displayedLocations.length > 0 ? 1 : 0;
	let hasMoreData = displayedLocations.length < filteredLocations.length;

	// Load saved language preference after hydration. Server-rendered content defaults to English.
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

	// Make translations reactive
	$: currentLocale = $locale || 'en';
	$: nameHeader = $_('table.header.name');
	$: locationHeader = $_('table.header.location');
	$: categoryHeader = $_('table.header.category');
	$: quietnessHeader = $_('table.header.quietness');

	// Generate meta tags
	$: metaTags = getPageMeta('home');

	function filterLocations(): void {
		let filtered = [...allLocations];

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
		currentPage = 0;
		displayedLocations = [];
		hasMoreData = filteredLocations.length > 0;
		loadMoreLocations();
	}

	function searchLocations(query: string): void {
		searchQuery = query.toLowerCase().trim();
		filterLocations();
	}

	function handleSearchEvent(query: string): void {
		searchLocations(query);
	}

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

	// Reprocess the server-provided rows when the selected language changes.
	$: if (rawData.length > 0) {
		allLocations = rawData.map((row) => placeRowToUiPlace(row, currentLocale));
		filterLocations();
	}
</script>

<Seo meta={metaTags} />

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
				<button
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
