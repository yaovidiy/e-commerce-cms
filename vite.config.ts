import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	build: {
		// Enable minification
		minify: 'esbuild',
		// Target modern browsers for smaller bundles
		target: 'es2020',
		// Enable tree-shaking
		rollupOptions: {
			output: {
				// Manual chunks for better code splitting
				manualChunks: (id) => {
					// Vendor chunks
					if (id.includes('node_modules')) {
						// Large UI libraries
						if (id.includes('@radix-ui') || id.includes('lucide-svelte')) {
							return 'vendor-ui';
						}
						// Editor libraries
						if (id.includes('@tiptap') || id.includes('prosemirror')) {
							return 'vendor-editor';
						}
						// Other vendor code
						return 'vendor';
					}
					
					// Admin features (lazy loaded)
					if (id.includes('/src/lib/components/admin/')) {
						return 'admin';
					}
				}
			}
		},
		// Chunk size warning limit
		chunkSizeWarningLimit: 600
	},
	optimizeDeps: {
		// Pre-bundle dependencies for faster dev server
		include: ['clsx', 'tailwind-merge']
	}
});
