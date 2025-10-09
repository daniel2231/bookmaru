<script lang="ts">
	import '../app.css';
	import Footer from '$lib/Footer.svelte';
	import { isLoading } from 'svelte-i18n';
</script>

{#if $isLoading}
	<div class="fixed inset-0 z-[1000] flex items-center justify-center bg-white text-lg">
		Loading...
	</div>
{:else}
	<div class="flex min-h-screen flex-col">
		<main class="flex-1">
			<slot />
		</main>
		<Footer />
	</div>
{/if}

<style>
	/* All global styles moved to app.css for better organization */
</style>
