import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

// `--mode electron` builds for file:// loading (no service worker).
export default defineConfig(({ mode }) => {
  const forElectron = mode === 'electron';
  return {
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    !forElectron &&
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png'],
        workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'], maximumFileSizeToCacheInBytes: 5_000_000 },
        manifest: {
          name: 'Cancer Screening Guide – Kurdistan',
          short_name: 'Screening',
          description: 'Cancer screening guidance based on the KRG MOH 2023 guidelines.',
          theme_color: '#b0306a',
          background_color: '#f6f7f9',
          display: 'standalone',
          start_url: './',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
  ],
  test: { environment: 'node' },
  };
});
