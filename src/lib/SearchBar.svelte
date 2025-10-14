<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { Search, X } from '@lucide/svelte';

	export let searchQuery = '';

	const dispatch = createEventDispatcher();

	let debounceTimer: NodeJS.Timeout;

	// Debounced search function
	function handleSearch(query: string): void {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			dispatch('search', query);
		}, 300); // 300ms debounce
	}

	function clearSearch(): void {
		searchQuery = '';
		dispatch('search', '');
	}

	// Watch for changes in searchQuery
	$: if (searchQuery !== undefined) {
		handleSearch(searchQuery);
	}
</script>

<div>
	<div class="relative">
		<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-brand-primary" />
		<input
			type="text"
			bind:value={searchQuery}
			placeholder={$_('search.placeholder')}
			class="mb-5 w-full border-y-1 border-brand-primary bg-brand-primary/20 px-5 py-2 pr-10 pl-10 text-brand-primary transition-all duration-200 outline-none focus:bg-white"
		/>
		{#if searchQuery}
			<button
				on:click={clearSearch}
				class="absolute top-1/2 right-3 -translate-y-1/2 text-brand-primary transition-colors hover:text-brand-secondary"
				aria-label="Clear search"
			>
				<X class="h-4 w-4" />
			</button>
		{/if}
	</div>
</div>
