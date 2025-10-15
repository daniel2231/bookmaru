import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Create vendor chunks for better caching
					if (id.includes('node_modules')) {
						if (id.includes('@supabase')) {
							return 'supabase';
						}
						if (id.includes('@lucide') || id.includes('svelte-i18n')) {
							return 'ui';
						}
						if (id.includes('svelte') && !id.includes('@sveltejs/kit')) {
							return 'svelte';
						}
						// Group other node_modules into vendor chunk
						return 'vendor';
					}
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
