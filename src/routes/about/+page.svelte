<script lang="ts">
	import { _ } from 'svelte-i18n';
	import HeroHeader from '$lib/HeroHeader.svelte';
	import { getPageMeta } from '$lib/meta';
	import Seo from '$lib/Seo.svelte';
	import '$lib/i18n';

	// Generate meta tags
	$: metaTags = getPageMeta('about');
</script>

<Seo meta={metaTags} />

<div>
	<HeroHeader />

	<section class="mx-10 mb-16 max-w-3xl text-brand-primary">
		<h1 class="mb-4 text-2xl font-semibold text-brand-primary">{$_('about.title')}</h1>
		<p class="mb-4 break-keep whitespace-pre-line">{@html $_('about.description')}</p>

		<div class="mb-4">
			<p class="mb-2">{@html $_('about.developmentStory')}</p>
		</div>

		<p class="text-sm">{@html $_('about.footerNote')}</p>
	</section>
</div>
