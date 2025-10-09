<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import LocationRow from '$lib/LocationRow.svelte';
	import SearchBar from '$lib/SearchBar.svelte';
	import { _, locale } from 'svelte-i18n';
	import type { UiPlace } from '$lib/types';
	import { get as getStore } from 'svelte/store';
	import { placeRowToUiPlace } from '$lib/utils';

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

	let locations: UiPlace[] = [];
	let loading = true;
	let error: string | null = null;
	let rawData: any[] = []; // Store raw data from database

	// Make translations reactive
	$: currentLocale = $locale || 'en';
	$: nameHeader = $_('table.header.name');
	$: cityHeader = $_('table.header.city');
	$: categoryHeader = $_('table.header.category');
	$: quietnessHeader = $_('table.header.quietness');
	$: facilityHeader = $_('table.header.facility');

	async function loadLocations(): Promise<void> {
		try {
			loading = true;
			const { data, error: supabaseError } = await supabase
				.from('places')
				.select(
					'id, original_language, name_en, name_ko, description_en, description_ko, address_en, address_ko, region, category, quietness, amenities, hours, tags, photos, latitude, longitude, recommended_book_en, recommended_book_ko, status, translation_reviewed, created_at, updated_at'
				)
				.eq('status', 'approved')
				.order('updated_at', { ascending: false });

			if (supabaseError) throw supabaseError;

			rawData = data ?? [];
			// Process locations with current locale
			locations = rawData.map((row) => placeRowToUiPlace(row, currentLocale));
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
			console.error('Error loading locations:', err);
		} finally {
			loading = false;
		}
	}

	// Reprocess locations when language changes
	$: if (rawData.length > 0) {
		locations = rawData.map((row) => placeRowToUiPlace(row, currentLocale));
	}

	onMount(() => {
		loadLocations();
	});
</script>

<svelte:head>
	<title>{$_('app.title')} - {$_('app.tagline')}</title>
</svelte:head>

<HeroHeader />

<SearchBar on:search={loadLocations} />

{#if loading}
	<div class="loading flex min-h-[60vh] items-center justify-center text-brand-primary">
		{$_('messages.loading')}
	</div>
{:else if error}
	<div class="error">{$_('messages.error')}: {error}</div>
{:else if locations.length === 0}
	<div class="empty flex min-h-[60vh] flex-col items-center justify-center text-center">
		<h2>{$_('messages.noLocations')}</h2>
		<p>{$_('messages.beFirst')} <a href="/submit">{$_('messages.addSpot')}</a></p>
	</div>
{:else}
	<table class="mt-5 mb-8 hidden w-full table-fixed border-collapse md:table">
		<thead class="hidden border-b-2 border-brand-primary md:table-header-group">
			<tr>
				<th class="w-24 px-4 py-2 text-left text-sm font-medium"></th>
				<th class="py-2 text-left text-sm font-medium text-brand-primary">{nameHeader}</th>
				<th class="py-2 text-left text-sm font-medium text-brand-primary">{cityHeader}</th>
				<th class="py-2 text-left text-sm font-medium text-brand-primary">{categoryHeader}</th>
				<th class="py-2 text-left text-sm font-medium text-brand-primary">{quietnessHeader}</th>
				<th class="py-2 text-left text-sm font-medium text-brand-primary">{facilityHeader}</th>
			</tr>
		</thead>
		<tbody class="hidden md:table-row-group">
			{#each locations as location, index (location.id)}
				<LocationRow {location} {index} />
			{/each}
		</tbody>
	</table>
{/if}
