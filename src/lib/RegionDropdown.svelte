<script lang="ts">
	import { onMount } from 'svelte';
	import { _, locale } from 'svelte-i18n';
	import koreanRegions from './data/korean-regions.json';

	export let selectedRegion: string = '';
	export let placeholder: string = '';

	// Make translations reactive
	$: currentLocale = $locale;
	$: allRegionsLabel = $_('form.fields.allRegions');

	// Flatten the Korean regions data into a simple list
	let regionOptions: string[] = [];

	onMount(() => {
		// Extract all regions from the Korean regions data
		const regions: string[] = [];

		// Add major cities and their districts
		Object.entries(koreanRegions.대한민국_도시_행정구).forEach(([cityKey, cityData]) => {
			if (cityKey === '경기도_주요도시') {
				// Handle Gyeonggi-do cities
				Object.entries(cityData as any).forEach(([cityName, cityInfo]: [string, any]) => {
					if (Array.isArray(cityInfo.행정구)) {
						cityInfo.행정구.forEach((district: string) => {
							if (district === '단일 행정구역') {
								regions.push(cityName);
							} else {
								regions.push(`${cityName} ${district}`);
							}
						});
					}
				});
			} else if (cityKey === '기타_특별자치도') {
				// Handle Jeju
				Object.entries(cityData as any).forEach(([provinceName, provinceInfo]: [string, any]) => {
					if (Array.isArray(provinceInfo.행정시)) {
						provinceInfo.행정시.forEach((city: string) => {
							regions.push(`${provinceName} ${city}`);
						});
					}
				});
			} else {
				// Handle major cities (Seoul, Busan, etc.)
				const cityName = cityKey.replace('광역시', '').replace('특별시', '');
				if (Array.isArray((cityData as any).행정구)) {
					(cityData as any).행정구.forEach((district: string) => {
						regions.push(`${cityName} ${district}`);
					});
				}
			}
		});

		// Sort regions alphabetically
		regionOptions = regions.sort();
	});

	function handleRegionSelect(region: string) {
		selectedRegion = region;
		// Dispatch custom event for parent component
		dispatch('regionChange', { region });
	}

	// Create a custom event dispatcher
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<{ regionChange: { region: string } }>();
</script>

<div class="relative">
	<label for="region-select" class="mb-1.5 block font-medium text-brand-primary">
		{$_('form.fields.region')}
	</label>
	<select
		id="region-select"
		bind:value={selectedRegion}
		on:change={(e) => handleRegionSelect(e.currentTarget.value)}
		class="w-full rounded-none border border-gray-300 px-2.5 py-2.5 text-sm transition-colors focus:border-brand-primary focus:outline-none"
	>
		<option value="">{placeholder || allRegionsLabel}</option>
		{#each regionOptions as region}
			<option value={region}>{region}</option>
		{/each}
	</select>
	<small class="mt-1 block text-sm text-brand-secondary">
		{$_('form.fields.regionHint')}
	</small>
</div>
