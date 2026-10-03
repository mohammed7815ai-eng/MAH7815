// Smoke test: fill the questionnaire in each language and screenshot the results.
import { chromium } from 'playwright';
const out = process.argv[2] || '.';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const errors = [];
for (const [lang, w] of [['en', 1100], ['ckb', 390], ['kmr', 390], ['badini', 390], ['ar', 1100]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  p.on('pageerror', (e) => errors.push(`${lang}: ${e.message}`));
  await p.goto('http://localhost:4173/');
  await p.evaluate((l) => { localStorage.clear(); localStorage.setItem('lang', l); }, lang);
  await p.reload();
  await p.waitForLoadState('networkidle');
  await p.fill('input[type=number]', '52');
  await p.locator('input[name=sex]').first().check({ force: true });
  await p.locator('label.check').nth(3).click(); // family history breast
  await p.locator('input[name=smoking]').nth(1).check({ force: true });
  const nums = p.locator('input[type=number]');
  await nums.nth(1).fill('30');
  await nums.nth(2).fill('25');
  await p.waitForLoadState('networkidle');
  await p.locator('button.primary').click();
  await p.waitForSelector('.rec', { timeout: 5000 }).catch(() => {});
  await p.screenshot({ path: `${out}/results-${lang}.png`, fullPage: true });
  console.log(lang, 'error:', await p.locator('.error').allTextContents(), 'age:', await p.locator('input[type=number]').first().inputValue().catch(()=>'-'));
  const dir = await p.evaluate(() => document.documentElement.dir);
  const cards = await p.locator('.rec').count();
  console.log(lang, 'bg=', await p.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rows=', await p.locator('.tl-row').count());
  console.log(lang, 'dir=', dir, 'cards=', cards, 'scrollW=', await p.evaluate(() => document.documentElement.scrollWidth), 'w=', w);
  await p.close();
}
// Translation editor (desktop/Android builds only): edit a Sorani string, check it is used and survives a reload.
if (process.env.EDITOR === '1') {
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  p.on('pageerror', (e) => errors.push(`editor: ${e.message}`));
  await p.goto('http://localhost:4173/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lang', 'ckb'); });
  await p.reload();
  await p.locator('[role=tab]').nth(3).click();
  await p.locator('input[type=search]').fill('nav.learn');
  await p.locator('.tr-row textarea').first().fill('فێربوون - تاقیکردنەوە');
  const tab = await p.locator('[role=tab]').nth(1).textContent();
  await p.reload();
  await p.locator('[role=tab]').nth(3).click();
  const after = await p.locator('[role=tab]').nth(1).textContent();
  await p.screenshot({ path: `${out}/editor-ckb.png` });
  console.log('editor: live=', tab, 'afterReload=', after, 'rows=', await p.locator('.tr-row').count(), 'scrollW=', await p.evaluate(() => document.documentElement.scrollWidth));
  await p.close();
}
// Man with PSA and smoking: blue theme, PSA and pack-year charts.
for (const [lang, w] of [['ar', 390], ['en', 1100]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  p.on('pageerror', (e) => errors.push(`male ${lang}: ${e.message}`));
  await p.goto('http://localhost:4173/');
  await p.evaluate((l) => { localStorage.clear(); localStorage.setItem('lang', l); }, lang);
  await p.reload();
  await p.fill('input[type=number]', '62');
  await p.locator('input[name=sex]').nth(1).check({ force: true });
  await p.locator('input[name=smoking]').nth(1).check({ force: true });
  const nums = p.locator('input[type=number]');
  await nums.nth(1).fill('30');
  await nums.nth(2).fill('40');
  await p.locator('input[step="0.1"]').fill('6.2');
  await p.locator('button.primary').click();
  await p.waitForSelector('.rec', { timeout: 5000 }).catch(() => {});
  await p.screenshot({ path: `${out}/male-${lang}.png`, fullPage: true });
  const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log('male', lang, 'bg=', bg, 'meters=', await p.locator('.meter').count(), 'care=', await p.locator('.care').textContent(), 'thanks=', await p.locator('.thanks').count(), 'tabs=', await p.locator('[role=tab]').allTextContents(), 'scrollW=', await p.evaluate(() => document.documentElement.scrollWidth));
  await p.close();
}
console.log('errors:', errors);
await b.close();
