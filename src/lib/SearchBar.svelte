<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Search, X, Loader2 } from '@lucide/svelte';
	import { debounce } from '$lib/utils/performance';

	let {
		searchQuery = $bindable(''),
		onSearch,
		loading = false
	}: {
		searchQuery?: string;
		onSearch?: (query: string) => void;
		loading?: boolean;
	} = $props();

	// Debounced search function with performance monitoring
	const debouncedSearch = debounce((query: string) => {
		onSearch?.(query);
	}, 300);

	// Handle search input
	function handleInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		debouncedSearch(searchQuery);
	}

	// Clear search
	function clearSearch(): void {
		searchQuery = '';
		onSearch?.('');
	}

	// Handle keyboard shortcuts
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			clearSearch();
		}
	}
</script>

<div class="relative">
	<Search
		class="pointer-events-none absolute top-1/3 left-3 h-4 w-4 -translate-y-1/2 text-brand-primary"
	/>
	<input
		type="text"
		bind:value={searchQuery}
		oninput={handleInput}
		onkeydown={handleKeydown}
		placeholder={$_('search.placeholder')}
		class="mb-5 w-full border-y-1 border-brand-primary bg-brand-primary/20 px-5 py-2 pr-10 pl-10 text-brand-primary transition-all duration-200 outline-none focus:bg-white"
		disabled={loading}
	/>

	{#if loading}
		<Loader2
			class="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-brand-primary"
		/>
	{:else if searchQuery}
		<button
			onclick={clearSearch}
			class="absolute top-1/2 right-3 -translate-y-1/2 text-brand-primary transition-colors hover:text-brand-secondary"
			aria-label="Clear search"
		>
			<X class="h-4 w-4" />
		</button>
	{/if}
</div>
