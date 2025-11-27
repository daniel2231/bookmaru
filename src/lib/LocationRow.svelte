<script lang="ts">
	import { _, locale } from 'svelte-i18n';
	import { Plus, Minus } from '@lucide/svelte';
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
	$: quietnessLabel = $_('table.header.quietness');

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

	<!-- Expand/Collapse Plus/Minus on the right -->
	<td class="px-10 py-2 text-right align-middle">
		<div
			class="inline-block transition-all duration-300 ease-in-out {isExpanded
				? 'rotate-180'
				: 'rotate-0'}"
		>
			{#if isExpanded}
				<Minus size={16} class="text-brand-primary" />
			{:else}
				<Plus size={16} class="text-brand-primary" />
			{/if}
		</div>
	</td>
</tr>

<!-- Mobile card layout -->
<div class="md:hidden">
	<div
		class="cursor-pointer border-b border-brand-primary transition-colors duration-200 hover:bg-brand-primary/10 {isExpanded
			? 'border-b-0 bg-brand-primary/10'
			: 'bg-white'} {index === 0 ? 'border-t border-brand-primary' : ''}"
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
		<!-- Mobile table-like layout -->
		<div class="flex items-center px-4 py-3">
			<!-- Index/ID Column -->
			<div class="flex w-12 items-center gap-2">
				<span class="text-xs font-medium text-brand-primary sm:text-sm">
					{index + 1}
				</span>
			</div>

			<!-- Name Column -->
			<div class="min-w-0 flex-1">
				<h4 class="truncate text-xs font-medium text-brand-primary sm:text-sm">{location.name}</h4>
			</div>

			<!-- City Column -->
			<div
				class="hidden w-40 px-6 text-left text-xs font-medium text-brand-primary sm:block sm:text-sm"
			>
				{location.region ?? '-'}
			</div>

			<!-- Category Column -->
			<div
				class="hidden w-36 px-6 text-left text-xs font-medium text-brand-primary sm:block sm:text-sm"
			>
				{categoryText}
			</div>

			<!-- Quietness Column -->
			<div
				class="hidden w-32 px-6 text-left text-xs font-medium text-brand-primary sm:block sm:text-sm"
			>
				{#if location.quietness}
					{location.quietness}/5
				{:else}
					-
				{/if}
			</div>

			<!-- Expand/Collapse Plus/Minus -->
			<div class="flex w-8 justify-end">
				<div
					class="inline-block transition-all duration-300 ease-in-out {isExpanded
						? 'rotate-180'
						: 'rotate-0'}"
				>
					{#if isExpanded}
						<Minus size={16} class="text-brand-primary" />
					{:else}
						<Plus size={16} class="text-brand-primary" />
					{/if}
				</div>
			</div>
		</div>

		<!-- Mobile info row for smaller screens -->
		<div class="block border-t border-brand-primary/20 px-4 py-2 sm:hidden">
			<div class="grid grid-cols-2 gap-2 text-xs">
				<div>
					<span class="text-brand-primary/70">{$_('table.header.location')}:</span>
					<span class="ml-1 font-medium text-brand-primary">{location.region ?? '-'}</span>
				</div>
				<div>
					<span class="text-brand-primary/70">{$_('table.header.category')}:</span>
					<span class="ml-1 font-medium text-brand-primary">{categoryText}</span>
				</div>
				<div>
					<span class="text-brand-primary/70">{$_('table.header.quietness')}:</span>
					<span class="ml-1 font-medium text-brand-primary">
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
</div>

<!-- Desktop expanded detail row -->
{#if isExpanded}
	<tr class="hidden border-0 md:table-row">
		<td colspan="5" class="p-0">
			<div
				class=" w-screen border-b border-brand-primary bg-brand-primary/10"
				transition:fade={{ duration: 180 }}
			>
				<div class="px-10 py-8" transition:slide={{ duration: 280, easing: cubicOut }}>
					<div class="flex flex-col gap-7 md:flex-row">
						<!-- Left: Image -->
						<div class="md:w-1/3">
							{#if location.photos && location.photos.length}
								<img
									src={location.photos[0]}
									alt={location.name}
									class="h-65 w-full object-cover"
								/>
							{/if}
						</div>

						<!-- Right: Description and Features -->
						<div class="space-y-3 md:w-1/2">
							{#if location.description}
								<div>
									<h5 class="mb-2 font-medium text-brand-primary">{descriptionLabel}</h5>
									<p
										class="text-sm leading-relaxed break-words whitespace-pre-wrap text-brand-primary"
									>
										{location.description}
									</p>
								</div>
							{/if}

							<div>
								<h5 class="mb-2 flex items-center gap-2 font-medium text-brand-primary">
									<BookOpen size={18} class="text-brand-primary" />
									{recommendedBooksTitle}
								</h5>
								{#if location.recommended_book}
									{#if location.recommended_book.link}
										<a
											href={location.recommended_book.link}
											target="_blank"
											rel="noopener noreferrer"
											class="flex cursor-pointer items-start justify-between border border-gray-200 bg-white p-3 transition-all hover:border-brand-primary/50 hover:shadow-sm"
											on:click={(e) => e.stopPropagation()}
										>
											<div class="flex-1">
												<p class="font-medium text-brand-primary">
													{location.recommended_book.title}
												</p>
												<p class="text-sm text-gray-600">
													{recommendedBooksBy}
													{location.recommended_book.author}
												</p>
											</div>
											<div
												class="flex items-center gap-1 text-sm text-brand-primary transition-colors hover:text-brand-primary/80"
											>
												{recommendedBooksReadMore}
												<ExternalLink size={14} />
											</div>
										</a>
									{:else}
										<div
											class="flex items-start justify-between border border-gray-200 bg-white p-3 transition-all hover:border-brand-primary/50 hover:shadow-sm"
										>
											<div class="flex-1">
												<p class="font-medium text-brand-primary">
													{location.recommended_book.title}
												</p>
												<p class="text-sm text-gray-600">
													{recommendedBooksBy}
													{location.recommended_book.author}
												</p>
											</div>
										</div>
									{/if}
								{:else}
									<p class="text-sm text-brand-primary">{recommendedBooksNone}</p>
								{/if}
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
		<div class="overflow-hidden border-b border-brand-primary bg-brand-primary/10 p-0">
			<div transition:fade={{ duration: 180 }}>
				<div class="px-4 py-6" transition:slide={{ duration: 280, easing: cubicOut }}>
					<div class="flex flex-col gap-4">
						<!-- Image -->
						<div>
							{#if location.photos && location.photos.length}
								<img
									src={location.photos[0]}
									alt={location.name}
									class="h-48 w-full object-cover"
								/>
							{/if}
						</div>

						<!-- Description -->
						{#if location.description}
							<div>
								<h5 class="mb-2 font-medium text-brand-primary">{descriptionLabel}</h5>
								<p
									class="text-sm leading-relaxed break-words whitespace-pre-wrap text-brand-primary"
								>
									{location.description}
								</p>
							</div>
						{/if}

						<!-- Recommended Books -->
						<div>
							<h5 class="mb-2 flex items-center gap-2 font-medium text-brand-primary">
								<BookOpen size={18} class="text-brand-primary" />
								{recommendedBooksTitle}
							</h5>
							{#if location.recommended_book}
								{#if location.recommended_book.link}
									<a
										href={location.recommended_book.link}
										target="_blank"
										rel="noopener noreferrer"
										class="flex cursor-pointer items-start justify-between border border-gray-200 bg-white p-3 transition-all hover:border-brand-primary/50 hover:shadow-sm"
										on:click={(e) => e.stopPropagation()}
									>
										<div class="flex-1">
											<p class="font-medium text-brand-primary">
												{location.recommended_book.title}
											</p>
											<p class="text-sm text-gray-600">
												{recommendedBooksBy}
												{location.recommended_book.author}
											</p>
										</div>
										<div
											class="flex items-center gap-1 text-sm text-brand-primary transition-colors hover:text-brand-primary/80"
										>
											{recommendedBooksReadMore}
											<ExternalLink size={14} />
										</div>
									</a>
								{:else}
									<div
										class="flex items-start justify-between border border-gray-200 bg-white p-3 transition-all hover:border-brand-primary/50 hover:shadow-sm"
									>
										<div class="flex-1">
											<p class="font-medium text-brand-primary">
												{location.recommended_book.title}
											</p>
											<p class="text-sm text-gray-600">
												{recommendedBooksBy}
												{location.recommended_book.author}
											</p>
										</div>
									</div>
								{/if}
							{:else}
								<p class="text-sm text-brand-primary">{recommendedBooksNone}</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
