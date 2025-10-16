<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { locale } from 'svelte-i18n';
	import { get as getStore } from 'svelte/store';
	import { onDestroy } from 'svelte';
	import type { PlaceInsert, Language } from '$lib/types';
	import { generateSimpleId, parseCommaSeparated } from '$lib/utils';
	import { getPageMeta } from '$lib/meta';
	import CascadingRegionDropdown from '$lib/CascadingRegionDropdown.svelte';
	import '$lib/i18n';

	// Form model adapted for `places` table
	let formData = {
		name: '',
		description: '',
		region: '',
		district: '',
		category: '',
		quietness: '', // string select 1-5, converted to number on submit
		bookTitle: '',
		bookAuthor: '',
		bookLink: ''
	};

	// Bilingual region data from cascading dropdown
	let regionData: { ko: string; en: string } | null | undefined = null;
	let districtData: { ko: string; en: string } | null | undefined = null;

	let submitting = false;
	let error: string | null = null;
	let submitted = false;

	let selectedFiles: File[] = [];
	let previewUrl: string | null = null;

	$: previewUrl = selectedFiles[0] ? URL.createObjectURL(selectedFiles[0]) : null;

	onDestroy(() => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
	});

	const t = (key: string, fallback: string): string => {
		const formatter = getStore(_);
		const text = formatter(key) as string;
		return text === key ? fallback : text;
	};

	async function uploadImages(files: File[]): Promise<string[]> {
		if (!files?.length) return [];
		const uploads = files.map(async (file) => {
			const ext = file.name.split('.').pop() || 'jpg';
			const fileName = (crypto as any).randomUUID
				? (crypto as any).randomUUID() + '.' + ext
				: `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
			const path = `public/${fileName}`;

			const { error: upErr } = await (supabase as any).storage
				.from('place-images')
				.upload(path, file, { cacheControl: '3600', upsert: false });

			if (upErr) throw upErr;

			const { data } = (supabase as any).storage.from('place-images').getPublicUrl(path);
			return data.publicUrl as string;
		});
		return Promise.all(uploads);
	}

	async function handleSubmit(): Promise<void> {
		if (!formData.name.trim()) {
			error = $_('form.validation.nameRequired');
			return;
		}

		try {
			const currentLocale = getStore(locale) || 'en';
			submitting = true;
			error = null;

			const isKo = currentLocale.startsWith('ko');
			const original_language: Language = isKo ? 'ko' : 'en';

			const quietness = formData.quietness ? Number(formData.quietness) : null;

			const imageUrls = await uploadImages(selectedFiles);

			// Build recommended book object if title and author are provided
			let recommendedBook = null;
			if (formData.bookTitle.trim() && formData.bookAuthor.trim()) {
				recommendedBook = {
					title: formData.bookTitle.trim(),
					author: formData.bookAuthor.trim(),
					...(formData.bookLink.trim() && { link: formData.bookLink.trim() })
				};
			}

			// Store city and district separately with bilingual support
			const insertPayload: PlaceInsert = {
				original_language,
				name_en: isKo ? null : formData.name || null,
				name_ko: isKo ? formData.name || null : null,
				description_en: isKo ? null : formData.description || null,
				description_ko: isKo ? formData.description || null : null,
				// New bilingual city and district fields
				city_ko: regionData?.ko || null,
				city_en: regionData?.en || null,
				district_ko: districtData?.ko || null,
				district_en: districtData?.en || null,
				// Old region fields removed - using city/district instead
				category: formData.category || null,
				quietness,
				photos: imageUrls.length ? imageUrls : null,
				recommended_book_en: isKo ? null : recommendedBook,
				recommended_book_ko: isKo ? recommendedBook : null,
				status: 'pending'
			};

			const rows: PlaceInsert[] = [insertPayload];
			const { error: supabaseError } = await (supabase as any).from('places').insert(rows);

			if (supabaseError) throw supabaseError;

			// Show success message instead of redirecting
			submitted = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
			console.error('Error submitting location:', err);
		} finally {
			submitting = false;
		}
	}

	function resetForm(): void {
		formData = {
			name: '',
			description: '',
			region: '',
			district: '',
			category: '',
			quietness: '',
			bookTitle: '',
			bookAuthor: '',
			bookLink: ''
		};
		submitted = false;
		error = null;
	}

	// Generate meta tags
	$: metaTags = getPageMeta('submit');
</script>

<svelte:head>
	{@html metaTags}
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8">
	{#if submitted}
		<!-- Success Message -->
		<div class="flex min-h-[60vh] items-center justify-center">
			<div class="w-full max-w-lg rounded-none bg-white p-10 text-center shadow-lg">
				<h1 class="mb-5 text-2xl font-semibold text-brand-primary">{$_('form.success.title')}</h1>
				<p class="mb-8 text-lg leading-relaxed text-brand-secondary">
					{$_('form.success.message')}
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<button
						on:click={() => goto('/')}
						class="rounded-none bg-brand-primary px-5 py-2.5 text-sm text-white transition-colors hover:bg-brand-secondary"
					>
						{$_('form.success.backHome')}
					</button>
					<button
						on:click={resetForm}
						class="rounded-none bg-gray-500 px-5 py-2.5 text-sm text-white transition-colors hover:bg-gray-600"
					>
						{$_('nav.addLocation')}
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Form -->
		<div class="mb-10 text-center">
			<h1 class="mb-2.5 text-2xl font-semibold text-brand-primary">{$_('form.title')}</h1>
			<p class="mb-5 text-brand-secondary">{$_('form.subtitle')}</p>
			<div class="mx-auto mb-5 max-w-2xl rounded-none border border-green-200 bg-green-50 p-4">
				<p class="m-0 font-medium text-brand-primary">{$_('form.moderationNotice')}</p>
			</div>
		</div>

		<form
			on:submit|preventDefault={handleSubmit}
			class="mx-auto max-w-2xl rounded-none bg-white p-8 shadow-sm"
		>
			<div class="mb-5">
				<label for="images" class="mb-1.5 block font-medium text-brand-primary"
					>{t('form.fields.images', 'Images')}</label
				>
				<div class="rounded-none border border-dashed border-slate-300 bg-slate-50 p-4">
					<input
						id="images"
						type="file"
						accept="image/*"
						class="absolute h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap [-webkit-clip-path:inset(50%)] [clip-path:inset(50%)]"
						on:change={(e) =>
							(selectedFiles = Array.from((e.currentTarget as HTMLInputElement).files || []).slice(
								0,
								1
							))}
					/>

					{#if previewUrl}
						<div class="flex items-center gap-3">
							<img
								src={previewUrl}
								alt="Selected preview"
								class="h-24 w-24 rounded-none border border-gray-200 bg-white object-cover"
							/>
							<div class="flex flex-col gap-2">
								<div class="font-medium text-brand-primary">{selectedFiles[0].name}</div>
								<div class="text-xs text-brand-secondary">
									{Math.ceil(selectedFiles[0].size / 1024)} KB
								</div>
								<div class="flex gap-2">
									<button
										type="button"
										class="rounded-none bg-gray-500 px-5 py-2.5 text-sm text-white transition-colors hover:bg-gray-600"
										on:click={() => document.getElementById('images')?.click()}
									>
										{t('form.buttons.change', 'Change')}
									</button>
									<button
										type="button"
										class="rounded-none bg-gray-500 px-5 py-2.5 text-sm text-white transition-colors hover:bg-gray-600"
										on:click={() => (selectedFiles = [])}
									>
										{t('form.buttons.remove', 'Remove')}
									</button>
								</div>
							</div>
						</div>
					{:else}
						<label
							class="flex cursor-pointer items-center gap-3 rounded-none border-2 border-dashed border-slate-300 bg-white p-5 transition-colors hover:border-brand-primary hover:bg-slate-50"
							for="images"
							on:dragover|preventDefault
							on:drop={(e) => {
								e.preventDefault();
								const dt = e.dataTransfer;
								if (!dt) return;
								const file = Array.from(dt.files || []).find((f) => f.type.startsWith('image/'));
								if (file) selectedFiles = [file];
							}}
						>
							<div class="text-2xl">📷</div>
							<div class="flex flex-col gap-0.5 text-brand-secondary">
								<strong>{t('form.fields.imagesDropTitle', 'Click to upload')}</strong>
								<span>{t('form.fields.imagesDropSub', 'or drag and drop')}</span>
								<small>{t('form.fields.imagesHint', 'One JPG/PNG image, max 5MB.')}</small>
							</div>
						</label>
					{/if}
				</div>
			</div>

			<div class="mb-5">
				<label for="name" class="mb-1.5 block font-medium text-brand-primary"
					>{$_('form.fields.nameRequired')}</label
				>
				<input
					id="name"
					type="text"
					bind:value={formData.name}
					placeholder={$_('form.fields.namePlaceholder')}
					class="w-full rounded-none border border-gray-300 px-2.5 py-2.5 text-sm transition-colors focus:border-brand-primary focus:outline-none"
					required
				/>
			</div>

			<div class="mb-5">
				<label for="description" class="mb-1.5 block font-medium text-brand-primary"
					>{$_('form.fields.description')}</label
				>
				<textarea
					id="description"
					bind:value={formData.description}
					placeholder={$_('form.fields.descriptionPlaceholder')}
					class="w-full rounded-none border border-gray-300 px-2.5 py-2.5 text-sm transition-colors focus:border-brand-primary focus:outline-none"
					rows="3"
				></textarea>
			</div>

			<div class="mb-5">
				<CascadingRegionDropdown
					bind:selectedRegion={formData.region}
					bind:selectedDistrict={formData.district}
					on:regionChange={(e) => {
						formData.region = e.detail.region;
						formData.district = e.detail.district;
						regionData = e.detail.regionData || null;
						districtData = e.detail.districtData || null;
					}}
				/>
			</div>

			<div class="mb-5">
				<label for="category" class="mb-1.5 block font-medium text-brand-primary"
					>{$_('form.fields.category')}</label
				>
				<div class="flex flex-col gap-1.5">
					<div class="mt-0 grid grid-cols-4 gap-3" role="radiogroup" aria-labelledby="category">
						<label
							class="flex h-12 cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-1 py-2 text-center text-xs leading-tight transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="category"
								value="studycafe"
								bind:group={formData.category}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>{$_('categories.studycafe')}</span>
						</label>
						<label
							class="flex h-12 cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-1 py-2 text-center text-xs leading-tight transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="category"
								value="cafe"
								bind:group={formData.category}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>{$_('categories.cafe')}</span>
						</label>
						<label
							class="flex h-12 cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-1 py-2 text-center text-xs leading-tight transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="category"
								value="library"
								bind:group={formData.category}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>{$_('categories.library')}</span>
						</label>
						<label
							class="flex h-12 cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-1 py-2 text-center text-xs leading-tight transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="category"
								value="public_space"
								bind:group={formData.category}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>{$_('categories.public_space')}</span>
						</label>
						<label
							class="flex h-12 cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-1 py-2 text-center text-xs leading-tight transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="category"
								value="university"
								bind:group={formData.category}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>{$_('categories.university')}</span>
						</label>
						<label
							class="flex h-12 cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-1 py-2 text-center text-xs leading-tight transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="category"
								value="community_center"
								bind:group={formData.category}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>{$_('categories.community_center')}</span>
						</label>
						<label
							class="flex h-12 cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-1 py-2 text-center text-xs leading-tight transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="category"
								value="bookstore"
								bind:group={formData.category}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>{$_('categories.bookstore')}</span>
						</label>
						<label
							class="flex h-12 cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-1 py-2 text-center text-xs leading-tight transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="category"
								value="other"
								bind:group={formData.category}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>{$_('categories.other')}</span>
						</label>
					</div>
				</div>
			</div>

			<div class="mb-5">
				<label for="quietness" class="mb-1.5 block font-medium text-brand-primary"
					>{$_('form.fields.quietness')}</label
				>
				<div class="flex flex-col gap-1.5">
					<div class="grid grid-cols-5 gap-3" role="radiogroup" aria-labelledby="quietness">
						<label
							class="flex cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-2 py-2.5 transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="quietness"
								value="1"
								bind:group={formData.quietness}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>1</span>
						</label>
						<label
							class="flex cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-2 py-2.5 transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="quietness"
								value="2"
								bind:group={formData.quietness}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>2</span>
						</label>
						<label
							class="flex cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-2 py-2.5 transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="quietness"
								value="3"
								bind:group={formData.quietness}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>3</span>
						</label>
						<label
							class="flex cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-2 py-2.5 transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="quietness"
								value="4"
								bind:group={formData.quietness}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>4</span>
						</label>
						<label
							class="flex cursor-pointer items-center justify-center gap-1.5 border border-slate-300 px-2 py-2.5 transition-all duration-200 select-none has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:font-semibold has-[:checked]:text-green-800"
						>
							<input
								type="radio"
								name="quietness"
								value="5"
								bind:group={formData.quietness}
								class="h-4 w-4 appearance-none border-2 border-slate-300 bg-white checked:border-green-500 checked:bg-green-500 checked:ring-2 checked:ring-green-200"
							/>
							<span>5</span>
						</label>
					</div>
					<div class="grid grid-cols-5 gap-3 text-xs text-brand-secondary">
						<span class="col-start-1 text-center font-medium"
							>{$_('form.fields.quietnessLabels.noisy')}</span
						>
						<span class="col-start-5 text-center font-medium"
							>{$_('form.fields.quietnessLabels.quiet')}</span
						>
					</div>
				</div>
			</div>

			<!-- Recommended Book Section -->
			<div class="my-8 rounded-none border-l-4 border-brand-primary bg-slate-50 p-5">
				<h3 class="mb-2 text-lg font-medium text-brand-primary">
					{$_('form.fields.recommendedBook')}
				</h3>
				<small class="mb-4 block text-brand-secondary"
					>{$_('form.fields.recommendedBookHint')}</small
				>

				<div class="mb-5">
					<label for="bookTitle" class="mb-1.5 block font-medium text-brand-primary"
						>{$_('form.fields.bookTitle')}</label
					>
					<input
						id="bookTitle"
						type="text"
						bind:value={formData.bookTitle}
						placeholder={$_('form.fields.bookTitlePlaceholder')}
						class="w-full rounded-none border border-gray-300 px-2.5 py-2.5 text-sm transition-colors focus:border-brand-primary focus:outline-none"
					/>
				</div>

				<div class="mb-5">
					<label for="bookAuthor" class="mb-1.5 block font-medium text-brand-primary"
						>{$_('form.fields.bookAuthor')}</label
					>
					<input
						id="bookAuthor"
						type="text"
						bind:value={formData.bookAuthor}
						placeholder={$_('form.fields.bookAuthorPlaceholder')}
						class="w-full rounded-none border border-gray-300 px-2.5 py-2.5 text-sm transition-colors focus:border-brand-primary focus:outline-none"
					/>
				</div>

				<div class="mb-5">
					<label for="bookLink" class="mb-1.5 block font-medium text-brand-primary"
						>{$_('form.fields.bookLink')}</label
					>
					<input
						id="bookLink"
						type="url"
						bind:value={formData.bookLink}
						placeholder={$_('form.fields.bookLinkPlaceholder')}
						class="w-full rounded-none border border-gray-300 px-2.5 py-2.5 text-sm transition-colors focus:border-brand-primary focus:outline-none"
					/>
					<small class="block text-sm text-brand-secondary">{$_('form.fields.bookLinkHint')}</small>
				</div>
			</div>

			{#if error}
				<div class="mb-5 rounded-none bg-red-50 p-2.5 text-red-600">{error}</div>
			{/if}

			<div class="flex justify-end gap-2.5">
				<button
					type="button"
					on:click={() => goto('/')}
					class="rounded-none bg-gray-500 px-5 py-2.5 text-sm text-white transition-colors hover:bg-gray-600"
				>
					{$_('form.buttons.cancel')}
				</button>
				<button
					type="submit"
					disabled={submitting}
					class="rounded-none bg-brand-primary px-5 py-2.5 text-sm text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:bg-gray-500"
				>
					{submitting ? $_('form.buttons.submitting') : $_('form.buttons.submit')}
				</button>
			</div>
		</form>
	{/if}
</div>
