<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { locale } from 'svelte-i18n';
	import type { Database, Json } from '$lib/database.types';
	import { getPageMeta } from '$lib/meta';
	import Seo from '$lib/Seo.svelte';

	type Place = Database['public']['Tables']['places']['Row'];
	type RecommendedBookForm = {
		title: string;
		author: string;
		link: string;
	};

	let isAuthenticated = false;
	let loading = true;
	let errorMessage: string | null = null;
	let submissions: Place[] = [];
	let processingId: number | null = null;

	// Get localized region for display
	$: currentLocale = $locale;

	// Generate meta tags
	$: metaTags = getPageMeta('admin');
	$: getLocalizedRegion = (submission: Place) => {
		const isKo = currentLocale?.startsWith('ko');
		const city = isKo
			? (submission.city_ko ?? submission.city_en)
			: (submission.city_en ?? submission.city_ko);
		const district = isKo
			? (submission.district_ko ?? submission.district_en)
			: (submission.district_en ?? submission.district_ko);
		return [city, district].filter(Boolean).join(' ');
	};
	let password = '';
	let isLoggingIn = false;
	let editingSubmission: Place | null = null;
	let editForm = {
		name_en: '',
		name_ko: '',
		description_en: '',
		description_ko: '',
		category: '',
		city_ko: '',
		city_en: '',
		district_ko: '',
		district_en: '',
		original_language: 'en',
		latitude: '',
		longitude: '',
		quietness: '',
		photos: '',
		recommended_book_en: {
			title: '',
			author: '',
			link: ''
		},
		recommended_book_ko: {
			title: '',
			author: '',
			link: ''
		},
		status: 'pending',
		created_at: ''
	};
	let isEditing = false;

	function recommendedBookToForm(value: Json | null): RecommendedBookForm {
		if (!value) {
			return { title: '', author: '', link: '' };
		}

		let book: Json | null = value;
		if (typeof value === 'string') {
			try {
				book = JSON.parse(value) as Json;
			} catch {
				return { title: value, author: '', link: '' };
			}
		}

		if (!book || typeof book !== 'object' || Array.isArray(book)) {
			return { title: '', author: '', link: '' };
		}

		return {
			title: typeof book.title === 'string' ? book.title : '',
			author: typeof book.author === 'string' ? book.author : '',
			link: typeof book.link === 'string' ? book.link : ''
		};
	}

	function recommendedBookFromForm(book: RecommendedBookForm): Json | null {
		const title = book.title.trim();
		const author = book.author.trim();
		const link = book.link.trim();

		if (!title && !author && !link) {
			return null;
		}

		return {
			title,
			author,
			...(link ? { link } : {})
		};
	}

	function photosToText(photos: string[] | null): string {
		return photos?.join('\n') ?? '';
	}

	function photosFromText(value: string): string[] | null {
		const photos = value
			.split('\n')
			.map((photo) => photo.trim())
			.filter(Boolean);

		return photos.length ? photos : null;
	}

	function numberFromForm(value: string): number | null {
		if (!value.trim()) {
			return null;
		}

		const number = Number(value);
		return Number.isFinite(number) ? number : null;
	}

	function emptyEditForm() {
		return {
			name_en: '',
			name_ko: '',
			description_en: '',
			description_ko: '',
			category: '',
			city_ko: '',
			city_en: '',
			district_ko: '',
			district_en: '',
			original_language: 'en',
			latitude: '',
			longitude: '',
			quietness: '',
			photos: '',
			recommended_book_en: {
				title: '',
				author: '',
				link: ''
			},
			recommended_book_ko: {
				title: '',
				author: '',
				link: ''
			},
			status: 'pending',
			created_at: ''
		};
	}

	onMount(async () => {
		await checkAuth();
		if (isAuthenticated) {
			await loadSubmissions();
		}
	});

	async function checkAuth() {
		try {
			if (browser) {
				const sessionPassword = sessionStorage.getItem('admin_password');
				if (sessionPassword) {
					// Verify password with server
					const response = await fetch('/api/verify-admin', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ password: sessionPassword })
					});

					if (response.ok) {
						isAuthenticated = true;
					} else {
						sessionStorage.removeItem('admin_password');
					}
				}
			}
		} catch (err) {
			errorMessage = 'Authentication error';
			console.error('Auth error:', err);
		} finally {
			loading = false;
		}
	}

	async function loadSubmissions() {
		try {
			// Use API endpoint instead of direct Supabase client
			const response = await fetch('/api/submissions');
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to load submissions');
			}

			submissions = result.submissions || [];
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to load submissions';
			console.error('Error loading submissions:', err);
		}
	}

	async function approveSubmission(id: number) {
		processingId = id;
		try {
			const response = await fetch('/api/approve-submission', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to approve submission');
			}

			// Reload submissions
			await loadSubmissions();
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to approve submission';
			console.error('Error approving submission:', err);
		} finally {
			processingId = null;
		}
	}

	async function denySubmission(id: number) {
		processingId = id;
		try {
			const response = await fetch('/api/delete-submission', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to delete submission');
			}

			// Reload submissions
			await loadSubmissions();
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to deny submission';
			console.error('Error denying submission:', err);
		} finally {
			processingId = null;
		}
	}

	async function signIn() {
		if (!password.trim()) {
			errorMessage = 'Please enter a password';
			return;
		}

		isLoggingIn = true;
		errorMessage = null;

		try {
			const response = await fetch('/api/verify-admin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: password.trim() })
			});

			if (response.ok) {
				// Store password in session storage
				if (browser) {
					sessionStorage.setItem('admin_password', password.trim());
				}
				isAuthenticated = true;
				password = '';
				await loadSubmissions();
			} else {
				const data = await response.json();
				errorMessage = data.error || 'Invalid password';
			}
		} catch (err) {
			errorMessage = 'Login failed. Please try again.';
			console.error('Login error:', err);
		} finally {
			isLoggingIn = false;
		}
	}

	async function signOut() {
		if (browser) {
			sessionStorage.removeItem('admin_password');
		}
		isAuthenticated = false;
		submissions = [];
		password = '';
		errorMessage = null;
	}

	function startEdit(submission: Place) {
		editingSubmission = submission;
		editForm = {
			name_en: submission.name_en || '',
			name_ko: submission.name_ko || '',
			description_en: submission.description_en || '',
			description_ko: submission.description_ko || '',
			category: submission.category || '',
			city_ko: submission.city_ko || '',
			city_en: submission.city_en || '',
			district_ko: submission.district_ko || '',
			district_en: submission.district_en || '',
			original_language: submission.original_language || 'en',
			latitude: submission.latitude?.toString() || '',
			longitude: submission.longitude?.toString() || '',
			quietness: submission.quietness?.toString() || '',
			photos: photosToText(submission.photos),
			recommended_book_en: recommendedBookToForm(submission.recommended_book_en),
			recommended_book_ko: recommendedBookToForm(submission.recommended_book_ko),
			status: submission.status || 'pending',
			created_at: submission.created_at || ''
		};
		isEditing = true;
	}

	function cancelEdit() {
		editingSubmission = null;
		isEditing = false;
		editForm = emptyEditForm();
	}

	async function saveEdit() {
		if (!editingSubmission) return;

		processingId = editingSubmission.id;
		errorMessage = null;

		try {
			const response = await fetch('/api/update-submission', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: editingSubmission.id,
					name_en: editForm.name_en,
					name_ko: editForm.name_ko,
					description_en: editForm.description_en,
					description_ko: editForm.description_ko,
					category: editForm.category,
					city_ko: editForm.city_ko,
					city_en: editForm.city_en,
					district_ko: editForm.district_ko,
					district_en: editForm.district_en,
					original_language: editForm.original_language,
					latitude: numberFromForm(editForm.latitude),
					longitude: numberFromForm(editForm.longitude),
					quietness: numberFromForm(editForm.quietness),
					photos: photosFromText(editForm.photos),
					recommended_book_en: recommendedBookFromForm(editForm.recommended_book_en),
					recommended_book_ko: recommendedBookFromForm(editForm.recommended_book_ko),
					status: editForm.status,
					created_at: editForm.created_at || null
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to update submission');
			}

			// Reload submissions
			await loadSubmissions();
			cancelEdit();
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to update submission';
			console.error('Error updating submission:', err);
		} finally {
			processingId = null;
		}
	}
</script>

<Seo meta={metaTags} />

<div class="min-h-screen bg-background">
	<div class="mx-auto max-w-7xl px-4 py-8">
		{#if loading}
			<div class="flex min-h-[60vh] items-center justify-center">
				<div class="text-lg text-brand-primary">Loading...</div>
			</div>
		{:else if !isAuthenticated}
			<div class="flex min-h-[60vh] items-center justify-center">
				<div class="w-full max-w-md rounded-none bg-white p-8 shadow-lg">
					<h1 class="mb-6 text-2xl font-bold text-brand-primary">Admin Login</h1>
					<p class="mb-6 text-brand-secondary">Enter the admin password to access the panel.</p>

					{#if errorMessage}
						<div class="mb-4 rounded-none bg-red-50 p-3 text-red-600">
							{errorMessage}
						</div>
					{/if}

					<form on:submit|preventDefault={signIn}>
						<div class="mb-4">
							<label for="password" class="mb-2 block text-sm font-medium text-brand-primary">
								Password
							</label>
							<input
								id="password"
								type="password"
								bind:value={password}
								placeholder="Enter admin password"
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
								disabled={isLoggingIn}
							/>
						</div>
						<button
							type="submit"
							disabled={isLoggingIn}
							class="w-full rounded-none bg-brand-primary px-4 py-2 text-white hover:bg-brand-secondary disabled:opacity-50"
						>
							{isLoggingIn ? 'Signing in...' : 'Sign In'}
						</button>
					</form>
				</div>
			</div>
		{:else}
			<div class="mb-8 flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-brand-primary">Admin Panel</h1>
					<p class="text-brand-secondary">Manage location submissions</p>
				</div>
				<button
					on:click={signOut}
					class="rounded-none bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
				>
					Sign Out
				</button>
			</div>

			{#if errorMessage}
				<div class="mb-6 rounded-none bg-red-50 p-4 text-red-600">
					{errorMessage}
				</div>
			{/if}

			{#if submissions.length === 0}
				<div class="rounded-none bg-white p-8 text-center shadow">
					<h2 class="text-xl font-semibold text-brand-primary">No pending submissions</h2>
					<p class="text-brand-secondary">All submissions have been processed.</p>
				</div>
			{:else}
				<div class="rounded-none bg-white shadow">
					<div class="border-b border-gray-200 px-6 py-4">
						<h2 class="text-lg font-semibold text-brand-primary">
							Pending Submissions ({submissions.length})
						</h2>
					</div>
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-gray-50">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-brand-primary uppercase"
									>
										Location
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-brand-primary uppercase"
									>
										Category
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-brand-primary uppercase"
									>
										Language
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-brand-primary uppercase"
									>
										Submitted
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-brand-primary uppercase"
									>
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 bg-white">
								{#each submissions as submission}
									<tr class="hover:bg-gray-50">
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="flex items-center">
												{#if submission.photos && submission.photos.length > 0}
													<img
														src={submission.photos[0]}
														alt=""
														class="mr-4 h-12 w-12 rounded-none object-cover"
													/>
												{/if}
												<div>
													<div class="text-sm font-medium text-gray-900">
														{submission.original_language === 'ko'
															? submission.name_ko
															: submission.name_en}
													</div>
													<div class="text-sm text-gray-500">
														{getLocalizedRegion(submission)}
													</div>
												</div>
											</div>
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
											{submission.category}
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
											{submission.original_language === 'ko' ? 'Korean' : 'English'}
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
											{new Date(submission.created_at || '').toLocaleDateString()}
										</td>
										<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
											<div class="flex space-x-2">
												<button
													on:click={() => startEdit(submission)}
													disabled={processingId === submission.id}
													class="rounded-none bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
												>
													Edit
												</button>
												<button
													on:click={() => approveSubmission(submission.id)}
													disabled={processingId === submission.id}
													class="rounded-none bg-brand-primary px-3 py-1 text-white hover:bg-brand-secondary disabled:opacity-50"
												>
													{processingId === submission.id ? 'Processing...' : 'Approve'}
												</button>
												<button
													on:click={() => denySubmission(submission.id)}
													disabled={processingId === submission.id}
													class="rounded-none bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
												>
													Deny
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Edit Modal -->
	{#if isEditing && editingSubmission}
		<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
			<div
				class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-none bg-white p-6 shadow-lg"
			>
				<div class="mb-6 flex items-center justify-between">
					<h2 class="text-2xl font-bold text-brand-primary">Edit Submission</h2>
					<button
						on:click={cancelEdit}
						class="text-gray-500 hover:text-gray-700"
						aria-label="Close edit modal"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</button>
				</div>

				<form on:submit|preventDefault={saveEdit} class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- English Name -->
						<div>
							<label for="name_en" class="mb-1 block text-sm font-medium text-brand-primary">
								Name (English)
							</label>
							<input
								id="name_en"
								type="text"
								bind:value={editForm.name_en}
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
								placeholder="Enter English name"
							/>
						</div>

						<!-- Korean Name -->
						<div>
							<label for="name_ko" class="mb-1 block text-sm font-medium text-brand-primary">
								Name (Korean)
							</label>
							<input
								id="name_ko"
								type="text"
								bind:value={editForm.name_ko}
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
								placeholder="Enter Korean name"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- English Description -->
						<div>
							<label for="description_en" class="mb-1 block text-sm font-medium text-brand-primary">
								Description (English)
							</label>
							<textarea
								id="description_en"
								bind:value={editForm.description_en}
								rows="3"
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
								placeholder="Enter English description"
							></textarea>
						</div>

						<!-- Korean Description -->
						<div>
							<label for="description_ko" class="mb-1 block text-sm font-medium text-brand-primary">
								Description (Korean)
							</label>
							<textarea
								id="description_ko"
								bind:value={editForm.description_ko}
								rows="3"
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
								placeholder="Enter Korean description"
							></textarea>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- Category -->
						<div>
							<label for="category" class="mb-1 block text-sm font-medium text-brand-primary">
								Category
							</label>
							<select
								id="category"
								bind:value={editForm.category}
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
							>
								<option value="">Select category</option>
								<option value="studycafe">Study cafe</option>
								<option value="cafe">Cafe</option>
								<option value="library">Library</option>
								<option value="bookstore">Bookstore</option>
								<option value="public_space">Public space</option>
								<option value="university">University</option>
								<option value="community_center">Community center</option>
								<option value="other">Other</option>
							</select>
						</div>

						<!-- Status -->
						<div>
							<label for="status" class="mb-1 block text-sm font-medium text-brand-primary">
								Status
							</label>
							<select
								id="status"
								bind:value={editForm.status}
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
							>
								<option value="pending">Pending</option>
								<option value="approved">Approved</option>
								<option value="rejected">Rejected</option>
							</select>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- Original Language -->
						<div>
							<label
								for="original_language"
								class="mb-1 block text-sm font-medium text-brand-primary"
							>
								Original Language
							</label>
							<select
								id="original_language"
								bind:value={editForm.original_language}
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
							>
								<option value="en">English</option>
								<option value="ko">Korean</option>
							</select>
						</div>

						<!-- Created At -->
						<div>
							<label for="created_at" class="mb-1 block text-sm font-medium text-brand-primary">
								Created At
							</label>
							<input
								id="created_at"
								type="text"
								bind:value={editForm.created_at}
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
								placeholder="ISO timestamp"
							/>
						</div>
					</div>

					<!-- New City and District Fields -->
					<div class="space-y-4">
						<h4 class="text-lg font-medium text-brand-primary">City & District (New Structure)</h4>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<!-- Korean City -->
							<div>
								<label for="city_ko" class="mb-1 block text-sm font-medium text-brand-primary">
									City (Korean)
								</label>
								<input
									id="city_ko"
									type="text"
									bind:value={editForm.city_ko}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="e.g., 서울특별시"
								/>
							</div>

							<!-- English City -->
							<div>
								<label for="city_en" class="mb-1 block text-sm font-medium text-brand-primary">
									City (English)
								</label>
								<input
									id="city_en"
									type="text"
									bind:value={editForm.city_en}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="e.g., Seoul Special Metropolitan City"
								/>
							</div>

							<!-- Korean District -->
							<div>
								<label for="district_ko" class="mb-1 block text-sm font-medium text-brand-primary">
									District (Korean)
								</label>
								<input
									id="district_ko"
									type="text"
									bind:value={editForm.district_ko}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="e.g., 강남구"
								/>
							</div>

							<!-- English District -->
							<div>
								<label for="district_en" class="mb-1 block text-sm font-medium text-brand-primary">
									District (English)
								</label>
								<input
									id="district_en"
									type="text"
									bind:value={editForm.district_en}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="e.g., Gangnam-gu"
								/>
							</div>
						</div>
					</div>

					<div class="space-y-4">
						<h4 class="text-lg font-medium text-brand-primary">Location Details</h4>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div>
								<label for="latitude" class="mb-1 block text-sm font-medium text-brand-primary">
									Latitude
								</label>
								<input
									id="latitude"
									type="number"
									step="any"
									bind:value={editForm.latitude}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="37.5665"
								/>
							</div>

							<div>
								<label for="longitude" class="mb-1 block text-sm font-medium text-brand-primary">
									Longitude
								</label>
								<input
									id="longitude"
									type="number"
									step="any"
									bind:value={editForm.longitude}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="126.9780"
								/>
							</div>

							<div>
								<label for="quietness" class="mb-1 block text-sm font-medium text-brand-primary">
									Quietness
								</label>
								<input
									id="quietness"
									type="number"
									min="1"
									max="5"
									step="1"
									bind:value={editForm.quietness}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="1-5"
								/>
							</div>
						</div>

						<div>
							<label for="photos" class="mb-1 block text-sm font-medium text-brand-primary">
								Photos
							</label>
							<textarea
								id="photos"
								bind:value={editForm.photos}
								rows="4"
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
								placeholder="One image URL per line"
							></textarea>
						</div>
					</div>

					<div class="space-y-4">
						<h4 class="text-lg font-medium text-brand-primary">Recommended Book</h4>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-3">
								<h5 class="text-sm font-semibold text-brand-primary">English</h5>
								<input
									type="text"
									bind:value={editForm.recommended_book_en.title}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="Title"
									aria-label="Recommended book English title"
								/>
								<input
									type="text"
									bind:value={editForm.recommended_book_en.author}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="Author"
									aria-label="Recommended book English author"
								/>
								<input
									type="url"
									bind:value={editForm.recommended_book_en.link}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="Link"
									aria-label="Recommended book English link"
								/>
							</div>

							<div class="space-y-3">
								<h5 class="text-sm font-semibold text-brand-primary">Korean</h5>
								<input
									type="text"
									bind:value={editForm.recommended_book_ko.title}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="Title"
									aria-label="Recommended book Korean title"
								/>
								<input
									type="text"
									bind:value={editForm.recommended_book_ko.author}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="Author"
									aria-label="Recommended book Korean author"
								/>
								<input
									type="url"
									bind:value={editForm.recommended_book_ko.link}
									class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
									placeholder="Link"
									aria-label="Recommended book Korean link"
								/>
							</div>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex justify-end space-x-3 pt-4">
						<button
							type="button"
							on:click={cancelEdit}
							class="rounded-none bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={processingId === editingSubmission.id}
							class="rounded-none bg-brand-primary px-4 py-2 text-white hover:bg-brand-secondary disabled:opacity-50"
						>
							{processingId === editingSubmission.id ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
