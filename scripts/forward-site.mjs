// Builds the stand-in GitHub Pages site used once the real website is on Cloudflare Pages:
// every page forwards the visitor to the same page on the new address, and the old offline copy
// (service worker) installed by earlier visits removes itself, so no one stays on the GitHub address.
// Usage: node scripts/forward-site.mjs <output dir> <new site url>
import fs from 'fs';
import path from 'path';

const [out, raw] = process.argv.slice(2);
if (!out || !raw) throw new Error('usage: node scripts/forward-site.mjs <output dir> <new site url>');
const target = new URL(raw).href.replace(/\/*$/, '/');
const BASE = '/MAH7815/'; // path of the GitHub Pages site

const page = (to) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="robots" content="noindex">
<link rel="canonical" href="${to}">
<meta http-equiv="refresh" content="0; url=${to}">
<title>Cancer Screening Guide</title>
<script>
(function () {
  var p = location.pathname, b = ${JSON.stringify(BASE)};
  var rest = p.indexOf(b) === 0 ? p.slice(b.length) : p.replace(/^\\//, '');
  location.replace(${JSON.stringify(target)} + rest + location.search + location.hash);
})();
</script></head>
<body style="font-family:sans-serif;text-align:center;padding:3em">
<p>The Cancer Screening Guide has moved. <a href="${to}">Open it here</a>.</p>
</body></html>
`;

const killSwitch = `// The website moved; remove the old offline copy and reload open pages so they forward to the new address.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(c.url);
})()));
`;

const write = (rel, text) => {
  const f = path.join(out, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
};
write('index.html', page(target));
write('iraq/index.html', page(`${target}iraq/`));
write('404.html', page(target));
write('sw.js', killSwitch);
write('iraq/sw.js', killSwitch);
write('.nojekyll', '');
console.log('forwarding site written to', out, '->', target);
