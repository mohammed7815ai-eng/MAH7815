// Draft Badini (Behdini) strings by transliterating Kurmanji (Latin) into Kurdish Arabic script.
// The output is a starting point only: Badini vocabulary differs in places and a native speaker must review it.
// Usage: node scripts/kmr-to-badini.mjs  (rewrites src/i18n/locales/badini.json, keeping keys already edited by hand)
import fs from 'fs';

const KEEP_LATIN = new Set(['Gail', 'Tyrer', 'Cuzick', 'Claus', 'BOADICEA', 'CanRisk', 'BRCAPRO', 'Hodgkin', 'Lynch', 'Tammemagi', 'Lung', 'Claude', 'Anthropic', 'mpMRI', 'ng', 'mL', 'mGy', 'sk', 'ant', 'api']);
const VOWELS = 'aeêiîoûu';
const MAP = { a: 'ا', b: 'ب', c: 'ج', ç: 'چ', d: 'د', e: 'ە', ê: 'ێ', f: 'ف', g: 'گ', h: 'ھ', ḧ: 'ح', i: '', î: 'ی', j: 'ژ', k: 'ک', l: 'ل', m: 'م', n: 'ن', o: 'ۆ', p: 'پ', q: 'q', r: 'ر', s: 'س', ş: 'ش', t: 'ت', u: 'و', û: 'وو', v: 'ڤ', w: 'و', x: 'خ', y: 'ی', z: 'ز' };
MAP.q = 'ق';
// Common words where Badini usage differs from a letter-by-letter transliteration.
const WORDS = { û: 'و', an: 'یان', de: 'دا', re: 'را' };
const DIGITS = '٠١٢٣٤٥٦٧٨٩';

function word(w) {
  const lower = w.toLowerCase();
  if (lower in WORDS) return WORDS[lower];
  if (KEEP_LATIN.has(w) || (/[A-Z]/.test(w.slice(1)) && w.length > 1)) return w; // acronyms like PSA, LDCT, BRCA
  const s = w.toLowerCase().replace(/['’]/g, '');
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const prev = s[i - 1];
    const isV = VOWELS.includes(ch);
    if (isV && (i === 0 || VOWELS.includes(prev))) out += 'ئ';
    out += MAP[ch] ?? ch;
  }
  return out;
}

export function toBadini(text) {
  return text
    .replace(/\{\w+\}|https?:\/\/\S+|[A-Za-zÇçÊêÎîŞşÛûḦḧ'’]+|\d+(?:[.,]\d+)?/g, (tok) => {
      if (tok.startsWith('{') || tok.startsWith('http')) return tok;
      if (/^\d/.test(tok)) return tok.replace(/\d/g, (d) => DIGITS[+d]).replace(/[.,]/, '٫');
      return word(tok);
    })
    .replace(/%/g, '٪')
    .replace(/,/g, '،')
    .replace(/\?/g, '؟')
    .replace(/;/g, '؛');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const kmr = JSON.parse(fs.readFileSync('src/i18n/locales/kmr.json', 'utf8'));
  const out = {};
  for (const [k, v] of Object.entries(kmr)) out[k] = toBadini(v);
  out['lang.label'] = 'زمان';
  fs.writeFileSync('src/i18n/locales/badini.json', JSON.stringify(out, null, 2) + '\n');
  console.log('wrote', Object.keys(out).length, 'keys');
}
