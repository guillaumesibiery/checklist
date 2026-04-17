import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

const isDev = process.argv.includes('dev');
const base = isDev ? '' : '/checklist';

export default defineConfig({
	plugins: [
		tailwindcss(), 
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			base: isDev ? '/' : '/checklist/',
			manifest: {
				name: 'Checklist',
				short_name: 'Checklist',
				description: 'Application de suivi de checklists hors-ligne',
				theme_color: '#9d50f8',
				background_color: '#ffffff',
				icons: [
					{
						src: 'logo.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'logo.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'logo.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				],
				display: 'standalone',
				start_url: isDev ? '/' : '/checklist/'
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
				cleanupOutdatedCaches: true,
				navigateFallback: isDev ? '/' : '/checklist/index.html'
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	},
});
