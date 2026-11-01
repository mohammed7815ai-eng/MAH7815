// Builds the Arabic "how to fill in the form" guide (A4 PDF) with screenshots of the running app.
// Usage: serve a web build, then  node scripts/make-guide.mjs <app url> <output.pdf>
//   e.g. node scripts/make-guide.mjs http://localhost:4173/ public/guide-ar.pdf
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const [url, out] = process.argv.slice(2);
if (!url || !out) throw new Error('usage: node scripts/make-guide.mjs <app url> <output.pdf>');
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const p = await b.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await p.goto(url);
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lang', 'ar'); });
await p.reload();
await p.waitForLoadState('networkidle');
await p.addStyleTag({ content: '.hl{outline:4px solid #e11d48 !important;outline-offset:4px;border-radius:12px} .guide{display:none!important}' });

const shots = {};
const unmark = () => p.evaluate(() => document.querySelectorAll('.hl').forEach((e) => e.classList.remove('hl')));
const mark = (loc) => loc.evaluate((e) => e.classList.add('hl'));
// Screenshot of the area from the top of one element to the bottom of another (both inside the same card).
async function shot(name, top, bottom = top, pad = 12) {
  await top.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const a = await top.boundingBox();
  const z = await bottom.boundingBox();
  const card = await top.evaluate((e) => { const r = (e.closest('.card, .topbar, .actions') ?? e).getBoundingClientRect(); return { x: r.x, width: r.width }; });
  const buf = await p.screenshot({ clip: { x: Math.max(0, card.x - pad), y: Math.max(0, a.y - pad), width: Math.min(420, card.width + 2 * pad), height: z.y + z.height - a.y + 2 * pad } });
  shots[name] = `data:image/png;base64,${buf.toString('base64')}`;
}

await mark(p.locator('.lang select'));
await shot('lang', p.locator('.topbar'), p.locator('.topbar'), 6);
const langs = await p.locator('.lang option').allTextContents();
await unmark();

await p.fill('input[type=number]', '50');
await p.locator('input[name=sex]').first().check({ force: true });
const basics = p.locator('.form-section').first();
const row = basics.locator('.row').first();
await mark(row);
await shot('basics', row, row, 14);
await unmark();

await mark(basics.locator('.pills').last());
await mark(basics.locator('.none-above'));
await shot('answers', basics.locator('.yesno').last(), basics.locator('.none-above'), 12);
await unmark();

await mark(p.locator('form .actions button.primary'));
await shot('submit', p.locator('form .actions'));
await p.locator('form .actions button.primary').click();
await p.waitForSelector('.rec');
await unmark();
await mark(p.locator('.results .actions button.primary'));
await shot('save', p.locator('.results .actions'));
await p.close();

const font = (f) => `data:font/woff2;base64,${fs.readFileSync(path.resolve('node_modules/@fontsource/noto-sans-arabic/files', f)).toString('base64')}`;
const steps = [
  {
    title: 'اختر اللغة أولاً',
    text: 'في أعلى الصفحة يوجد <b>مربع اللغة</b> (المحاط باللون الأحمر في الصورة). اضغط عليه ثم اختر <b>«العربية»</b> أو أي لغة تفضّلها من القائمة. تتغيّر جميع الأسئلة والنتائج فوراً إلى اللغة التي اخترتها، ويتذكّر التطبيق اختيارك في المرة القادمة.',
    extra: `<div class="langs"><span>اللغات المتوفرة:</span>${langs.map((l) => `<em>${l}</em>`).join('')}</div><p class="tip">يمكنك تغيير اللغة في أي وقت، ولن تُحذف إجاباتك.</p>`,
    img: 'lang',
  },
  { title: 'اكتب معلوماتك', text: 'اكتب <b>عمرك بالأرقام</b> (بالسنوات)، ثم اضغط <b>«ذكر»</b> أو <b>«أنثى»</b>. تظهر لك بعدها الأسئلة المناسبة لك فقط.', img: 'basics' },
  {
    title: 'أجب بـ «نعم» أو «لا»',
    text: 'تحت كل سؤال زرّان: <b>«نعم»</b> و<b>«لا»</b>. الإجابة المختارة مسبقاً هي «لا»، فاضغط «نعم» فقط إذا كان السؤال ينطبق عليك. إذا لم ينطبق عليك أي سؤال في القسم، اضغط المربع في آخر القسم: <b>«ليس لدي أيٌّ…»</b>.',
    img: 'answers',
  },
  { title: 'اعرض خطتك', text: 'بعد الانتهاء من جميع الأقسام، اضغط الزر <b>«اعرض خطة الفحص الخاصة بي»</b> في أسفل الصفحة.', img: 'submit' },
  {
    title: 'احفظ خطتك',
    text: 'تظهر خطتك مع الفحوصات الموصى بها لك. اضغط <b>«احفظ خطتي (PDF)»</b> لحفظها كملف. في <b>الهاتف</b> تظهر قائمة المشاركة: اختر مكان الحفظ أو أرسل الملف عبر واتساب. في <b>الحاسوب</b> اختر المكان الذي تريد حفظ الملف فيه. اعرض الخطة على طبيب العائلة أو أقرب مركز صحي.',
    img: 'save',
  },
];

const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>
@font-face{font-family:NA;src:url(${font('noto-sans-arabic-arabic-400-normal.woff2')});font-weight:400}
@font-face{font-family:NA;src:url(${font('noto-sans-arabic-arabic-700-normal.woff2')});font-weight:700}
@font-face{font-family:NA;src:url(${font('noto-sans-arabic-latin-400-normal.woff2')});font-weight:400;unicode-range:U+0000-00FF}
@font-face{font-family:NA;src:url(${font('noto-sans-arabic-latin-700-normal.woff2')});font-weight:700;unicode-range:U+0000-00FF}
@page{size:A4;margin:10mm 13mm 8mm}
body{font-family:NA,sans-serif;color:#1b2430;margin:0;font-size:11pt;line-height:1.55}
h1{font-size:21pt;color:#b0306a;margin:0 0 4px;line-height:1.35}
.intro{color:#4a5563;margin:0 0 14px;padding-bottom:12px;border-bottom:3px solid #b0306a}
.step{display:grid;grid-template-columns:34px 1fr 62mm;gap:12px;align-items:start;padding:9px 0;border-bottom:1px solid #e3e6ea;break-inside:avoid}
.num{width:32px;height:32px;border-radius:50%;background:#b0306a;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:14pt}
h2{font-size:14.5pt;margin:0 0 4px;color:#b0306a}
p{margin:0}
.step img{width:100%;border:1px solid #d5d9df;border-radius:8px}
.step.first{background:#fff4f8;border:2px solid #b0306a;border-radius:12px;padding:12px;margin-bottom:6px}
.langs{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.langs span{font-weight:700}
.langs em{font-style:normal;border:1px solid #b0306a;border-radius:999px;padding:0 10px;background:#fff}
.tip{margin-top:6px;color:#2f7a43;font-weight:700}
.note{margin-top:10px;padding:10px 14px;border-radius:10px;background:#fff7e6;color:#7a4b00;font-size:11pt}
.credit{margin-top:4px;color:#6b7280;font-size:10pt}
</style></head><body>
<h1>دليل تعبئة استمارة الكشف المبكر عن السرطان</h1>
<p class="intro">تساعدك هذه الأداة على معرفة فحوصات الكشف المبكر عن السرطان المناسبة لك. تستغرق التعبئة بضع دقائق فقط. اتبع الخطوات الخمس التالية:</p>
${steps.map((s, i) => `<div class="step${i === 0 ? ' first' : ''}"><div class="num">${i + 1}</div><div><h2>${s.title}</h2><p>${s.text}</p>${s.extra ?? ''}</div><img src="${shots[s.img]}" alt=""></div>`).join('')}
<p class="note"><b>ملاحظة:</b> هذه الأداة تقدّم معلومات عامة ولا تغني عن استشارة الطبيب. إذا كانت لديك أعراض تقلقك فراجع الطبيب فوراً.</p>
<p class="credit">إعداد: <span dir="ltr">Dr. Mohammed A Hassan</span></p>
</body></html>`;

const doc = await b.newPage();
await doc.setContent(html, { waitUntil: 'load' });
await doc.evaluate(() => document.fonts.ready);
await doc.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
await b.close();
console.log('wrote', out, 'languages:', langs.join(', '));
