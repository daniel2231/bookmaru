<script lang="ts">
	import { _, locale } from 'svelte-i18n';
	import LanguageSelector from '$lib/LanguageSelector.svelte';
	import { MoveRight, MoveLeft } from '@lucide/svelte';
	import { page } from '$app/stores';

	$: isAboutPage = $page.url.pathname === '/about';
	$: currentLocale = $locale;
	$: description = $_('hero.description');
	$: author = $_('hero.author');
</script>

<header class="hero mx-10 my-10 mb-8 flex flex-col justify-between gap-6 md:flex-row">
	<div class="text-left">
		<a href="/" class="text-5xl font-medium text-brand-primary">{$_('hero.title')}</a>
		<p class="mt-2 text-base text-brand-primary">
			{@html $_('hero.description')}
			<a target="_blank" href="https://danielkang.top" class="cursor-pointer underline">{author}.</a
			>
		</p>
		<p class="mt-2 text-base text-brand-primary">
			{#if isAboutPage}
				<a href="/" class="cursor-pointer">
					<MoveLeft class="inline-block" />
					{$_('nav.home')}
				</a>
			{:else}
				<a href="/about" class="cursor-pointer">
					{$_('nav.about')}
					<MoveRight class="inline-block" />
				</a>
			{/if}
		</p>
	</div>
	<div>
		<div class="flex flex-row items-center gap-4">
			<LanguageSelector />
			<a
				href="/submit"
				class="rounded-none border border-brand-primary p-3 text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
				>{$_('nav.addLocation')}</a
			>
		</div>
	</div>
</header>
