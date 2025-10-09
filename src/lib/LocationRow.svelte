<script lang="ts">
	import { _, locale } from 'svelte-i18n';
	import { ChevronDown, ChevronRight } from '@lucide/svelte';
	import { MapPin, BookOpen, ExternalLink } from '@lucide/svelte';
	import type { UiPlace } from './types';
	import { fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	export let location: UiPlace;
	export let index: number;

	let isExpanded = false;

	// Make translations reactive
	$: currentLocale = $locale;
	$: categoryText = location.category ? $_(`categories.${location.category.toLowerCase()}`) : '-';
	$: descriptionLabel = $_('location.description');
	$: recommendedBooksTitle = $_('location.recommendedBooks.title');
	$: recommendedBooksBy = $_('location.recommendedBooks.by');
	$: recommendedBooksReadMore = $_('location.recommendedBooks.readMore');
	$: recommendedBooksNone = $_('location.recommendedBooks.none');
	$: featuresTitle = $_('location.features.title');

	$: quietnessLabel = $_('table.header.quietness');
	$: facilityLabel = $_('table.header.facility');

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

<!-- Desktop table row -->
<tr
	class="hidden cursor-pointer border-brand-primary transition-colors duration-200 hover:bg-brand-primary/10 md:table-row {isExpanded
		? 'bg-brand-primary/10'
		: ''}"
	class:border-b={!isExpanded}
	on:click={toggleExpanded}
>
	<!-- Index/ID Column -->
	<td class="px-10 py-2 text-left">
		<div class="flex items-center gap-2">
			<span class="text-xs font-medium text-brand-primary sm:text-sm">
				{index + 1}
			</span>
		</div>
	</td>

	<!-- Name and Type Column -->
	<td class="py-2 text-left">
		<div class="flex items-center gap-3">
			<h4 class="text-xs font-medium text-brand-primary sm:text-sm">{location.name}</h4>
			<!-- <span
				class="type-badge type-{location.type} inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
			>
				{$_(`location.types.${location.type}`)}
			</span> -->
		</div>
	</td>

	<!-- City/Region Column -->
	<td class="py-2 text-left text-sm font-medium text-brand-primary">
		{location.region ?? '-'}
	</td>

	<!-- Category Column -->
	<td class="py-2 text-left text-sm font-medium text-brand-primary">
		{categoryText}
	</td>

	<!-- Quietness Column -->
	<td class="py-2 text-left text-sm font-medium text-brand-primary">
		{#if location.quietness}
			{location.quietness}/5
		{:else}
			-
		{/if}
	</td>

	<!-- Expand/Collapse Chevron on the right -->
	<td class="px-10 py-2 text-right align-middle">
		{#if isExpanded}
			<ChevronDown size={16} class="inline-block text-gray-400" />
		{:else}
			<ChevronRight size={16} class="inline-block text-gray-400" />
		{/if}
	</td>
</tr>

<!-- Mobile card layout -->
<div class="md:hidden">
	<div
		class="mx-4 mb-4 cursor-pointer rounded-lg border border-brand-primary/20 bg-white p-4 shadow-sm transition-all duration-200 hover:bg-brand-primary/5 hover:shadow-md {isExpanded
			? 'bg-brand-primary/5 shadow-md'
			: ''}"
		role="button"
		tabindex="0"
		on:click={toggleExpanded}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggleExpanded();
			}
		}}
	>
		<!-- Header with name and chevron -->
		<div class="mb-3 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<span class="text-sm font-medium text-brand-primary">
					{index + 1}
				</span>
				<h4 class="text-sm font-medium text-brand-primary">{location.name}</h4>
			</div>
			{#if isExpanded}
				<ChevronDown size={16} class="text-gray-400" />
			{:else}
				<ChevronRight size={16} class="text-gray-400" />
			{/if}
		</div>

		<!-- Information rows -->
		<div class="space-y-2">
			<div class="flex justify-between">
				<span class="text-xs text-gray-500">{$_('table.header.city')}</span>
				<span class="text-sm font-medium text-brand-primary">{location.region ?? '-'}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-xs text-gray-500">{$_('table.header.category')}</span>
				<span class="text-sm font-medium text-brand-primary">{categoryText}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-xs text-gray-500">{$_('table.header.quietness')}</span>
				<span class="text-sm font-medium text-brand-primary">
					{#if location.quietness}
						{location.quietness}/5
					{:else}
						-
					{/if}
				</span>
			</div>
		</div>
	</div>
</div>

<!-- Desktop expanded detail row -->
{#if isExpanded}
	<tr class="hidden border-0 md:table-row">
		<td
			colspan="6"
			class="overflow-hidden border-b border-brand-primary bg-brand-primary/10 p-0 text-left"
		>
			<div transition:fade={{ duration: 180 }}>
				<div class="px-10 py-3" transition:slide={{ duration: 280, easing: cubicOut }}>
					<div class="flex flex-col gap-4 md:flex-row">
						<!-- Left: Image -->
						<div class="md:w-1/3">
							{#if location.photos && location.photos.length}
								<img
									src={location.photos[0]}
									alt={location.name}
									class="h-48 w-full object-cover"
								/>
							{/if}
						</div>

						<!-- Right: Description and Features -->
						<div class="space-y-3 md:w-1/3">
							{#if location.description}
								<div>
									<h5 class="mb-2 font-medium text-gray-900">{descriptionLabel}</h5>
									<p class="text-sm leading-relaxed text-gray-600">{location.description}</p>
								</div>
							{/if}

							<div>
								<h5 class="mb-2 flex items-center gap-2 font-medium text-gray-900">
									<BookOpen size={18} class="text-brand-primary" />
									{recommendedBooksTitle}
								</h5>
								{#if location.recommended_book}
									<div
										class="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-brand-primary/50 hover:shadow-sm"
									>
										<div class="flex-1">
											<p class="font-medium text-gray-900">{location.recommended_book.title}</p>
											<p class="text-sm text-gray-600">
												{recommendedBooksBy}
												{location.recommended_book.author}
											</p>
										</div>
										{#if location.recommended_book.link}
											<a
												href={location.recommended_book.link}
												target="_blank"
												rel="noopener noreferrer"
												class="flex items-center gap-1 text-sm text-brand-primary transition-colors hover:text-brand-primary/80"
												on:click={(e) => e.stopPropagation()}
											>
												{recommendedBooksReadMore}
												<ExternalLink size={14} />
											</a>
										{/if}
									</div>
								{:else}
									<p class="text-sm text-gray-500">{recommendedBooksNone}</p>
								{/if}
							</div>

							<div>
								<h5 class="mb-2 font-medium text-gray-900">{featuresTitle}</h5>
								<div class="flex flex-wrap gap-2 text-sm text-gray-700">
									{#if location.amenities && location.amenities.length > 0}
										{facilityLabel}: {location.amenities.join(', ')}
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</td>
	</tr>
{/if}

<!-- Mobile expanded detail -->
{#if isExpanded}
	<div class="md:hidden">
		<div
			class="mx-4 mb-4 rounded-lg border border-brand-primary/20 bg-brand-primary/5 p-4 shadow-sm"
		>
			<div class="flex flex-col gap-4">
				<!-- Image -->
				<div>
					{#if location.photos && location.photos.length}
						<img
							src={location.photos[0]}
							alt={location.name}
							class="h-48 w-full rounded-lg object-cover"
						/>
					{/if}
				</div>

				<!-- Description -->
				{#if location.description}
					<div>
						<h5 class="mb-2 font-medium text-gray-900">{descriptionLabel}</h5>
						<p class="text-sm leading-relaxed text-gray-600">{location.description}</p>
					</div>
				{/if}

				<!-- Recommended Books -->
				<div>
					<h5 class="mb-2 flex items-center gap-2 font-medium text-gray-900">
						<BookOpen size={18} class="text-brand-primary" />
						{recommendedBooksTitle}
					</h5>
					{#if location.recommended_book}
						<div
							class="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-brand-primary/50 hover:shadow-sm"
						>
							<div class="flex-1">
								<p class="font-medium text-gray-900">{location.recommended_book.title}</p>
								<p class="text-sm text-gray-600">
									{recommendedBooksBy}
									{location.recommended_book.author}
								</p>
							</div>
							{#if location.recommended_book.link}
								<a
									href={location.recommended_book.link}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-1 text-sm text-brand-primary transition-colors hover:text-brand-primary/80"
									on:click={(e) => e.stopPropagation()}
								>
									{recommendedBooksReadMore}
									<ExternalLink size={14} />
								</a>
							{/if}
						</div>
					{:else}
						<p class="text-sm text-gray-500">{recommendedBooksNone}</p>
					{/if}
				</div>

				<!-- Features/Facilities -->
				<div>
					<h5 class="mb-2 font-medium text-gray-900">{featuresTitle}</h5>
					<div class="flex flex-wrap gap-2 text-sm text-gray-700">
						{#if location.amenities && location.amenities.length > 0}
							{facilityLabel}: {location.amenities.join(', ')}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
