import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Vendor chunks for better caching
					vendor: ['svelte', '@sveltejs/kit'],
					supabase: ['@supabase/supabase-js', '@supabase/ssr'],
					ui: ['@lucide/svelte', 'svelte-i18n'],
					// Separate chunk for large components
					components: ['$lib/LocationRow.svelte', '$lib/SearchBar.svelte']
				}
			}
		},
		// Enable source maps for debugging
		sourcemap: true,
		// Optimize chunk size
		chunkSizeWarningLimit: 1000
	},
	// Optimize dependencies
	optimizeDeps: {
		include: ['@lucide/svelte', 'svelte-i18n', '@supabase/supabase-js']
	},
	// Server configuration for development
	server: {
		fs: {
			allow: ['..']
		}
	}
});
