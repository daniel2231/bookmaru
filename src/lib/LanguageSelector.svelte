<script lang="ts">
	import { locale } from 'svelte-i18n';
	import { Globe } from '@lucide/svelte';

	const languageCodes: Record<string, string> = {
		en: 'EN',
		ko: 'KO'
	};

	function toggleLanguage(): void {
		const currentLang = $locale || 'en';
		const newLang = currentLang === 'en' ? 'ko' : 'en';
		locale.set(newLang);
		// Save preference to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('language', newLang);
		}
	}

	$: currentLang = $locale || 'en';
	$: nextLang = currentLang === 'en' ? 'ko' : 'en';
</script>

<button
	class="language-selector font-inherit flex cursor-pointer items-center gap-2 border border-brand-primary bg-transparent px-3 py-3 transition-all duration-200 hover:border-brand-primary hover:bg-brand-primary/10 active:scale-105"
	on:click={toggleLanguage}
>
	<Globe
		size={16}
		class="text-brand-primary transition-transform duration-200 hover:rotate-[15deg]"
	/>
	<div class="language-display flex items-center gap-1.5 font-medium">
		<span
			class="current-lang animate-[slideInLeft_0.4s_ease-out] font-semibold text-brand-primary transition-all duration-300 ease-out"
			>{languageCodes[currentLang]}</span
		>
		<span
			class="divider animate-[fadeIn_0.3s_ease-out_0.2s_both] font-light text-gray-300 transition-all duration-300 ease-out"
			>|</span
		>
		<span
			class="next-lang animate-[slideInRight_0.4s_ease-out_0.1s_both] text-gray-400 transition-all duration-300 ease-out"
			>{languageCodes[nextLang]}</span
		>
	</div>
</button>

<style>
	@keyframes slideInLeft {
		from {
			opacity: 0;
			transform: translateX(-12px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateX(12px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
