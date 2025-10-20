<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { AlertTriangle } from '@lucide/svelte';
</script>

<footer class="bg-brand-primary py-3">
	<div class="mx-10 flex items-center justify-between">
		<div class="text-xs text-white">
			Built by
			<a
				href="https://danielkang.top"
				target="_blank"
				class="font-medium text-white transition-colors hover:text-brand-secondary"
			>
				@danielkang
			</a>
		</div>
		<div class="flex items-center gap-1 text-xs text-white/80">
			<AlertTriangle size={12} class="text-yellow-300" />
			<span>{$_('disclaimer.aiTranslation')}</span>
		</div>
	</div>
</footer>
