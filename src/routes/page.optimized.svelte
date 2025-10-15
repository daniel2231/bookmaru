<script lang="ts">
	import { onMount } from 'svelte';
	import { _, locale } from 'svelte-i18n';
	import {
		placesStore,
		places,
		loading,
		loadingMore,
		error,
		hasMore,
		total
	} from '$lib/stores/places.store';
	import LocationRow from '$lib/LocationRow.svelte';
	import SearchBar from '$lib/SearchBar.svelte';
	import HeroHeader from '$lib/HeroHeader.svelte';
	import { getStoredLanguage, saveLanguage } from '$lib/utils';
	import type { Language } from '$lib/types';

	import '$lib/i18n'; // Initialize i18n

	// Reactive state from stores
	$: currentLocale = $locale || 'en';
	$: nameHeader = $_('table.header.name');
	$: cityHeader = $_('table.header.city');
	$: categoryHeader = $_('table.header.category');
	$: quietnessHeader = $_('table.header.quietness');

	// Debounced search function
	let searchTimeout: NodeJS.Timeout;
	function handleSearchEvent(query: string): void {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			placesStore.search(query, currentLocale as Language);
		}, 300);
	}

	// Load more function
	function loadMore(): void {
		placesStore.loadMore();
	}

	// Language change handler
	async function handleLanguageChange(newLanguage: Language): Promise<void> {
		saveLanguage(newLanguage);
		await placesStore.changeLanguage(newLanguage);
	}

	// Initialize on mount
	onMount(async () => {
		// Load saved language preference
		const savedLang = getStoredLanguage();
		if (savedLang && savedLang !== currentLocale) {
			await handleLanguageChange(savedLang);
		} else {
			// Load initial places
			await placesStore.loadPlaces(currentLocale as Language);
		}
	});

	// Watch for language changes
	$: if (currentLocale) {
		placesStore.changeLanguage(currentLocale as Language);
	}
</script>

<svelte:head>
	<title>{$_('app.title')} - {$_('app.tagline')}</title>
</svelte:head>

<HeroHeader />

<SearchBar onSearch={handleSearchEvent} />

{#if $loading}
	<div class="loading flex min-h-[60vh] items-center justify-center text-brand-primary">
		{$_('messages.loading')}
	</div>
{:else if $error}
	<div class="error">{$_('messages.error')}: {$error}</div>
	<button
		onclick={() => placesStore.clearError()}
		class="mt-2 rounded bg-brand-primary px-4 py-2 text-white"
	>
		{$_('messages.retry')}
	</button>
{:else if $places.length === 0}
	<div class="empty flex min-h-[60vh] flex-col items-center justify-center text-center">
		<h2>{$_('messages.noLocations')}</h2>
		<p>{$_('messages.beFirst')} <a href="/submit">{$_('messages.addSpot')}</a></p>
	</div>
{:else}
	<!-- Desktop table -->
	<div class="mt-5 mb-8 hidden md:block">
		<table class="w-full table-fixed border-collapse">
			<thead class="border-b-2 border-brand-primary">
				<tr>
					<th class="w-16 px-4 py-2 text-left text-sm font-medium"></th>
					<th class="w-2/5 py-2 text-left text-sm font-medium text-brand-primary">{nameHeader}</th>
					<th class="w-40 py-2 text-left text-sm font-medium text-brand-primary">{cityHeader}</th>
					<th class="w-36 py-2 text-left text-sm font-medium text-brand-primary"
						>{categoryHeader}</th
					>
					<th class="w-32 py-2 text-left text-sm font-medium text-brand-primary"
						>{quietnessHeader}</th
					>
				</tr>
			</thead>
			<tbody>
				{#each $places as location, index (location.id)}
					<LocationRow {location} {index} />
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Mobile cards container -->
	<div class="mt-5 mb-8 md:hidden">
		{#each $places as location, index (location.id)}
			<LocationRow {location} {index} />
		{/each}
	</div>

	<!-- Load More Button -->
	{#if $hasMore}
		<div class="flex justify-center py-8">
			<button
				onclick={loadMore}
				disabled={$loadingMore}
				class="rounded-lg bg-brand-primary px-6 py-3 text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if $loadingMore}
					{$_('search.loadingMore')}
				{:else}
					{$_('search.loadMore')} ({$total - $places.length} {$_('search.remaining')})
				{/if}
			</button>
		</div>
	{/if}
{/if}
