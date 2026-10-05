<script lang="ts">
	import { absoluteUrl, DEFAULT_AUTHOR, DEFAULT_IMAGE, SITE_NAME, type MetaTags } from '$lib/meta';

	export let meta: MetaTags;

	$: canonicalUrl = absoluteUrl(meta.path);
	$: imageUrl = meta.image || DEFAULT_IMAGE;
	$: pageType = meta.type || 'website';
	$: author = meta.author || DEFAULT_AUTHOR;
	$: robots = meta.robots || 'index, follow';
	$: locale = meta.locale || 'en_US';
	$: structuredData = meta.structuredData
		? JSON.stringify(meta.structuredData).replace(/</g, '\\u003c')
		: '';
	$: structuredDataScript = structuredData
		? `<script type="application/ld+json">${structuredData}</` + 'script>'
		: '';
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="title" content={meta.title} />
	<meta name="description" content={meta.description} />
	{#if meta.keywords}
		<meta name="keywords" content={meta.keywords} />
	{/if}
	<meta name="author" content={author} />
	<meta name="robots" content={robots} />
	<meta name="application-name" content={SITE_NAME} />
	<link rel="canonical" href={canonicalUrl} />

	<meta property="og:type" content={pageType} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content={locale} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={canonicalUrl} />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
	<meta name="twitter:image" content={imageUrl} />
	<meta name="twitter:creator" content="@danielkang" />
	<meta name="twitter:site" content="@danielkang" />

	{#if structuredDataScript}
		{@html structuredDataScript}
	{/if}
</svelte:head>
