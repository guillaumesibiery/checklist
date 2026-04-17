import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

const isDev = process.argv.includes('dev');
const base = isDev ? '/' : '/checklist/';

const getBuildVersion = () => {
	const now = new Date();
	const parts = new Intl.DateTimeFormat('fr-FR', {
		year: 'numeric', month: '2-digit', day: '2-digit',
		hour: '2-digit', minute: '2-digit', second: '2-digit',
		hour12: false, timeZone: 'Europe/Paris'
	}).formatToParts(now);
	const p = (type: string) => parts.find(part => part.type === part.type && part.type === type)?.value || '';
	return `BUILD ${p('year')}${p('month')}${p('day')}-${p('hour')}${p('minute')}${p('second')}`;
};

export default defineConfig({
	base,
	plugins: [
		tailwindcss(), 
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg', 'logo.png', 'robots.txt'],
			base,
			manifest: {
				name: 'Checklist',
				short_name: 'Checklist',
				description: 'Application de suivi de checklists hors-ligne',
				theme_color: '#9d50f8',
				background_color: '#ffffff',
				display: 'standalone',
				scope: base,
				start_url: base,
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
				]
			},
			kit: {
				adapterFallback: 'index.html',
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
				cleanupOutdatedCaches: true,
				navigateFallbackDenylist: [/^\/api/],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				]
			},
			devOptions: {
				enabled: true,
				suppressWarnings: true,
				type: 'module'
			}
		})
	],
	define: {
		__APP_VERSION__: JSON.stringify(getBuildVersion())
	},
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
