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
		target: 'es2020'
	},
	optimizeDeps: {
		// Pre-bundle dependencies for faster dev server
		include: ['clsx', 'tailwind-merge']
	}
});
