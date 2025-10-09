<script>
	import { writable } from 'svelte/store';
	import { _ } from 'svelte-i18n';
	import { Search } from '@lucide/svelte';

	export let value = '';
	const { subscribe, set } = writable(value);

	$: (value, set(value));
</script>

<div>
	<div class="relative">
		<input
			type="text"
			bind:value
			placeholder={$_('search.placeholder')}
			class="mb-5 w-full border-y-1 border-brand-primary bg-brand-primary/20 px-5 py-2 pl-10 text-brand-primary transition-all duration-200 outline-none focus:bg-white"
		/>
	</div>
</div>
