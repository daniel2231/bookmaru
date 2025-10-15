<script lang="ts">
	import { _ } from 'svelte-i18n';
	import HeroHeader from '$lib/HeroHeader.svelte';
	import { getPageMeta } from '$lib/meta';
	import '$lib/i18n';

	// Generate meta tags
	$: metaTags = getPageMeta('about');
</script>

<svelte:head>
	{@html metaTags}
</svelte:head>

<div>
	<HeroHeader />

	<section class="mx-10 mb-16 max-w-3xl text-brand-primary">
		<h1 class="mb-4 text-2xl font-semibold text-brand-primary">{$_('about.title')}</h1>
		<p class="mb-4 break-keep whitespace-pre-line">{@html $_('about.description')}</p>
		<p class="text-sm">{@html $_('about.footerNote')}</p>
	</section>
</div>
