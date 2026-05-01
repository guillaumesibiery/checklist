import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

const isDev = process.argv.includes('dev');
// Pour GitHub Pages, la base doit être le nom du dépôt. 
// SvelteKit gère le trailing slash différemment de Vite PWA.
const base = isDev ? '/' : '/checklist/';

const getBuildVersion = () => {
	const now = new Date();
	const parts = new Intl.DateTimeFormat('fr-FR', {
		year: 'numeric', month: '2-digit', day: '2-digit',
		hour: '2-digit', minute: '2-digit', second: '2-digit',
		hour12: false, timeZone: 'Europe/Paris'
	}).formatToParts(now);
	const p = (type: string) => parts.find(part => part.type === type)?.value || '';
	return `BUILD ${p('year')}${p('month')}${p('day')}-${p('hour')}${p('minute')}${p('second')}`;
};

export default defineConfig({
	plugins: [
		tailwindcss(), 
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			includeAssets: ['favicon.svg', 'icon.png', 'robots.txt', 'models/*.json'],
			manifest: {
				name: 'Checklist',
				short_name: 'Checklist',
				description: 'Application de suivi de checklists hors-ligne',
				theme_color: '#9d50f8',
				background_color: '#ffffff',
				display: 'standalone',
				scope: base,
				start_url: base,
				launch_handler: {
					client_mode: 'navigate-existing'
				},
				icons: [
					{
						src: 'icon.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'icon.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'icon.png',
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
				clientsClaim: true,
				skipWaiting: true,
				navigateFallback: `${base}index.html`,
				navigateFallbackDenylist: [/^\/api/],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365
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
		__APP_VERSION__: JSON.stringify(getBuildVersion()),
		__PACKAGE_VERSION__: JSON.stringify(pkg.version)
	},
	test: {
		expect: { requireAssertions: true },
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
	},
});

