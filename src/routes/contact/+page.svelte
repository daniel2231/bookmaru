<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import HeroHeader from '$lib/HeroHeader.svelte';
	import { goto } from '$app/navigation';

	let email: string = '';
	let message: string = '';
	let sending = false;
	let success: string | null = null;
	let error: string | null = null;

	async function send() {
		error = null;
		success = null;

		if (!message.trim()) {
			error = $_('contact.validation.messageRequired') || 'Message is required';
			return;
		}

		sending = true;
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email || null, message })
			});

			const data = await res.json();
			if (!res.ok) {
				error = data.error || $_('contact.errors.sending') || 'Failed to send';
			} else {
				success = $_('contact.success') || 'Message sent. Thank you!';
				// clear form
				email = '';
				message = '';
			}
		} catch (err) {
			console.error(err);
			error = $_('contact.errors.sending') || 'Failed to send';
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head>
	<title>{$_('contact.title') || 'Contact'}</title>
</svelte:head>

<HeroHeader />

<main class="mx-10 my-10 max-w-3xl">
	<h1 class="mb-4 text-2xl font-semibold text-brand-primary">{$_('contact.title')}</h1>
	<p class="mb-6 text-sm text-brand-primary">{$_('contact.subtitle')}</p>

	<div class="space-y-4 rounded-lg bg-white p-6 shadow-sm">
		{#if success}
			<div class="rounded border border-green-100 bg-green-50 p-3 text-green-700">{success}</div>
		{/if}
		{#if error}
			<div class="rounded border border-red-100 bg-red-50 p-3 text-red-700">{error}</div>
		{/if}

		<div>
			<label for="email" class="mb-1 block text-sm font-medium text-brand-primary">
				{$_('contact.fields.email')}
			</label>
			<input
				type="email"
				class="w-full rounded border border-brand-primary px-3 py-2 text-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus:outline-none"
				placeholder={$_('contact.placeholders.email')}
				bind:value={email}
			/>
			<p class="mt-1 text-xs text-brand-primary">{$_('contact.hints.emailOptional')}</p>
		</div>

		<div>
			<label for="message" class="mb-1 block text-sm font-medium text-brand-primary">
				{$_('contact.fields.message')}
			</label>
			<textarea
				rows={6}
				class="w-full rounded border border-brand-primary px-3 py-2 text-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus:outline-none"
				placeholder={$_('contact.placeholders.message')}
				bind:value={message}
			>
			</textarea>
		</div>

		<div class="flex items-center gap-3">
			<button
				on:click|preventDefault={send}
				class="rounded bg-brand-primary px-4 py-2 text-white hover:opacity-95 disabled:opacity-60"
				disabled={sending}
			>
				{sending ? $_('contact.sending') : $_('contact.send')}
			</button>
			<button class="text-sm text-gray-600" on:click={() => goto('/')}
				>{$_('contact.cancel')}
			</button>
		</div>
	</div>
</main>

<style>
	/* small local adjustments if needed */
</style>
