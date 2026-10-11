import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

const NOTICE = `/*! Cancer Screening Guide v${pkg.version} - Copyright (c) 2026 Dr. Mohammed A Hassan. All rights reserved. Unauthorised copying, modification or redistribution is prohibited. */`;

// Strict Content-Security-Policy for the public website: only this site's own files may run or be fetched.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  'upgrade-insecure-requests',
].join('; ');

function webSecurity(enabled: boolean): Plugin {
  return {
    name: 'web-security',
    apply: 'build',
    transformIndexHtml(html) {
      if (!enabled) return html;
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="no-referrer" />`,
      );
    },
  };
}

// Modes:
//   (default)  public website: installable PWA, no translation editor
//   electron   Windows and Android apps: loaded from file, no service worker, translation editor on
//   embed      single-page preview (claude.ai artifact): no service worker, no translation editor
export default defineConfig(({ mode }) => {
  const forElectron = mode === 'electron' || mode === 'embed';
  return {
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __TRANSLATION_EDITOR__: JSON.stringify(mode === 'electron'),
    __SERVER_SETTINGS__: JSON.stringify(mode === 'electron'),
    // The AI assistant needs a personal API key; hidden for now (code kept in src/components/Assistant.tsx).
    __AI_ASSISTANT__: JSON.stringify(false),
  },
  build: {
    sourcemap: false,
    rollupOptions: { output: { postBanner: NOTICE } },
  },
  plugins: [
    react(),
    webSecurity(mode !== 'electron' && mode !== 'embed'),
    !forElectron &&
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png'],
        workbox: { globPatterns: ['**/*.{js,css,html,svg,png}', '**/noto-sans-{arabic-arabic,arabic-latin,latin,latin-ext}-*.woff2'], globIgnores: ['og-image.png'], maximumFileSizeToCacheInBytes: 5_000_000 },
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
