<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { locale } from 'svelte-i18n';
	import type { Database } from '$lib/database.types';

	type Place = Database['public']['Tables']['places']['Row'];
	type PlaceUpdate = Database['public']['Tables']['places']['Update'];

	let isAuthenticated = false;
	let loading = true;
	let errorMessage: string | null = null;
	let submissions: Place[] = [];
	let processingId: number | null = null;

	// Get localized region for display
	$: currentLocale = $locale;
	$: getLocalizedRegion = (submission: Place) => {
		const isKo = currentLocale?.startsWith('ko');
		return isKo
			? (submission.region_ko ?? submission.region_en)
			: (submission.region_en ?? submission.region_ko);
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
		region_en: '',
		region_ko: '',
		original_language: 'en'
	};
	let isEditing = false;

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
			region_en: submission.region_en || '',
			region_ko: submission.region_ko || '',
			original_language: submission.original_language || 'en'
		};
		isEditing = true;
	}

	function cancelEdit() {
		editingSubmission = null;
		isEditing = false;
		editForm = {
			name_en: '',
			name_ko: '',
			description_en: '',
			description_ko: '',
			category: '',
			region_en: '',
			region_ko: '',
			original_language: 'en'
		};
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
					region_en: editForm.region_en,
					region_ko: editForm.region_ko,
					original_language: editForm.original_language
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

<svelte:head>
	<title>Admin Panel - Bookmaru</title>
</svelte:head>

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
														alt="Location photo"
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
								<option value="bookstore">Bookstore</option>
								<option value="library">Library</option>
								<option value="cafe">Cafe</option>
								<option value="restaurant">Restaurant</option>
								<option value="park">Park</option>
								<option value="museum">Museum</option>
								<option value="other">Other</option>
							</select>
						</div>

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
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- English Region -->
						<div>
							<label for="region_en" class="mb-1 block text-sm font-medium text-brand-primary">
								Region (English)
							</label>
							<input
								id="region_en"
								type="text"
								bind:value={editForm.region_en}
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
								placeholder="Enter English region"
							/>
						</div>

						<!-- Korean Region -->
						<div>
							<label for="region_ko" class="mb-1 block text-sm font-medium text-brand-primary">
								Region (Korean)
							</label>
							<input
								id="region_ko"
								type="text"
								bind:value={editForm.region_ko}
								class="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
								placeholder="Enter Korean region"
							/>
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
