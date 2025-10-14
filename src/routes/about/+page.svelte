<script lang="ts">
	import { _ } from 'svelte-i18n';
	import HeroHeader from '$lib/HeroHeader.svelte';
	import '$lib/i18n';
</script>

<svelte:head>
	<title>{$_('app.title')} - {$_('nav.about')}</title>
	<meta name="description" content={$_('about.metaDescription')} />
	<link rel="canonical" href="/about" />
	<meta property="og:title" content={$_('app.title')} />
	<meta property="og:description" content={$_('about.metaDescription')} />
</svelte:head>

<div>
	<HeroHeader />

	<section class="mx-10 mb-16 max-w-3xl text-brand-primary">
		<h1 class="mb-4 text-2xl font-semibold text-brand-primary">{$_('about.title')}</h1>
		<p class="mb-4 whitespace-pre-line break-keep">{@html $_('about.description')}</p>
		<p class="text-sm">{@html $_('about.footerNote')}</p>
	</section>
</div>
