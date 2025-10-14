<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Search, X } from '@lucide/svelte';

	let {
		searchQuery = $bindable(''),
		onSearch
	}: {
		searchQuery?: string;
		onSearch?: (query: string) => void;
	} = $props();

	let debounceTimer: NodeJS.Timeout;

	// Debounced search function
	function handleSearch(query: string): void {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			onSearch?.(query);
		}, 300); // 300ms debounce
	}

	function clearSearch(): void {
		searchQuery = '';
		onSearch?.('');
	}

	// Watch for changes in searchQuery
	$effect(() => {
		if (searchQuery !== undefined) {
			handleSearch(searchQuery);
		}
	});
</script>

<div>
	<div class="relative">
		<Search
			class="pointer-events-none absolute top-1/3 left-3 h-4 w-4 -translate-y-1/2 text-brand-primary"
		/>
		<input
			type="text"
			bind:value={searchQuery}
			placeholder={$_('search.placeholder')}
			class="mb-5 w-full border-y-1 border-brand-primary bg-brand-primary/20 px-5 py-2 pr-10 pl-10 text-brand-primary transition-all duration-200 outline-none focus:bg-white"
		/>
		{#if searchQuery}
			<button
				onclick={clearSearch}
				class="absolute top-1/2 right-3 -translate-y-1/2 text-brand-primary transition-colors hover:text-brand-secondary"
				aria-label="Clear search"
			>
				<X class="h-4 w-4" />
			</button>
		{/if}
	</div>
</div>
