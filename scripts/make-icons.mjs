import { chromium } from 'playwright';
import fs from 'fs';
const svg = fs.readFileSync('public/icon.svg','utf8');
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const p = await b.newPage();
for (const [s, out] of [[192,'public/icon-192.png'],[512,'public/icon-512.png'],[1024,'build/icon.png'],[180,'public/apple-touch-icon.png']]) {
  await p.setViewportSize({width:s,height:s});
  await p.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ','<svg width="'+s+'" height="'+s+'" ')}</body></html>`);
  await p.screenshot({path: out, omitBackground: true});
}
await b.close();
