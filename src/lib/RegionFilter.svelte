<script lang="ts">
	import { onMount } from 'svelte';
	import { _, locale } from 'svelte-i18n';
	import { createEventDispatcher } from 'svelte';
	import koreanRegions from './data/korean-regions.json';

	export let selectedRegion: string = '';
	export let locations: any[] = [];

	let isOpen = false;

	// Make translations reactive
	$: currentLocale = $locale;
	$: allRegionsLabel = $_('filter.allRegions');

	// Get unique regions from locations
	$: uniqueRegions = Array.from(
		new Set(
			locations
				.map((location) => location.region)
				.filter((region): region is string => Boolean(region))
				.sort()
		)
	);

	// Group regions by province/city for better organization
	$: regionGroups = uniqueRegions.reduce(
		(groups, region) => {
			// Extract province/city from full region name (e.g., "서울특별시 강남구" -> "서울특별시")
			const province = region.split(' ')[0];
			if (!groups[province]) {
				groups[province] = [];
			}
			groups[province].push(region);
			return groups;
		},
		{} as Record<string, string[]>
	);

	// Add "All Regions" option at the beginning
	$: regionOptions = ['', ...uniqueRegions];

	function handleRegionSelect(region: string) {
		selectedRegion = region;
		// Dispatch custom event for parent component
		dispatch('regionChange', { region });
	}

	// Create a custom event dispatcher
	const dispatch = createEventDispatcher<{ regionChange: { region: string } }>();

	// Close dropdown when clicking outside
	onMount(() => {
		function handleClickOutside(event: MouseEvent) {
			const target = event.target as HTMLElement;
			if (!target.closest('.relative')) {
				isOpen = false;
			}
		}

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="relative">
	<button
		type="button"
		class="flex w-full items-center justify-between rounded-none border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-gray-50 focus:border-brand-primary focus:outline-none"
		on:click={() => (isOpen = !isOpen)}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-labelledby="region-filter-label"
	>
		<span id="region-filter-label" class="block truncate">
			{selectedRegion || allRegionsLabel}
		</span>
		<svg
			class="h-5 w-5 text-gray-400 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>

	{#if isOpen}
		<div
			class="absolute z-10 mt-1 max-h-80 w-full overflow-y-auto rounded-none border border-gray-300 bg-white shadow-lg"
			role="listbox"
		>
			<!-- All Regions option -->
			<button
				type="button"
				class="flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-brand-primary/10 {selectedRegion ===
				''
					? 'bg-brand-primary/10 font-medium text-brand-primary'
					: 'text-gray-700'}"
				on:click={() => handleRegionSelect('')}
				role="option"
				aria-selected={selectedRegion === ''}
			>
				{allRegionsLabel}
			</button>

			<!-- Grouped regions -->
			{#each Object.entries(regionGroups) as [province, districts]}
				<div class="border-t border-gray-100">
					<div class="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
						{province}
					</div>
					{#each districts as region}
						<button
							type="button"
							class="flex w-full items-center px-6 py-2 text-left text-sm transition-colors hover:bg-brand-primary/10 {region ===
							selectedRegion
								? 'bg-brand-primary/10 font-medium text-brand-primary'
								: 'text-gray-700'}"
							on:click={() => handleRegionSelect(region)}
							role="option"
							aria-selected={region === selectedRegion}
						>
							{region}
						</button>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>
