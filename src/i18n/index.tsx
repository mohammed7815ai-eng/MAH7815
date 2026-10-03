import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, type MessageKey } from './en';
import ar from './locales/ar.json';
import ckb from './locales/ckb.json';
import kmr from './locales/kmr.json';
import badini from './locales/badini.json';
import type { Msg } from '../engine/types';

// Translations live in ./locales/*.json (one file per language, edit freely).
// English (./en.ts) is the reference and defines the list of keys.
export type Lang = 'en' | 'ckb' | 'kmr' | 'badini' | 'ar';
type Dict = Record<MessageKey, string>;

export const LANGS: { id: Lang; name: string; dir: 'ltr' | 'rtl'; htmlLang: string }[] = [
  { id: 'ckb', name: 'کوردی (سۆرانی)', dir: 'rtl', htmlLang: 'ckb' },
  { id: 'kmr', name: 'Kurdî (Kurmancî)', dir: 'ltr', htmlLang: 'kmr' },
  { id: 'badini', name: 'کوردی (بادینی)', dir: 'rtl', htmlLang: 'kmr-Arab' },
  { id: 'ar', name: 'العربية', dir: 'rtl', htmlLang: 'ar' },
  { id: 'en', name: 'English', dir: 'ltr', htmlLang: 'en' },
];

export const DICTS: Record<Lang, Dict> = { en, ar: ar as Dict, ckb: ckb as Dict, kmr: kmr as Dict, badini: badini as Dict };

// ---- User edits (translation editor). Stored on the device, applied on top of the built-in files.
export type Overrides = Partial<Record<Lang, Record<string, string>>>;
const OVERRIDES_KEY = 'translationOverrides';
let overrides: Overrides = loadOverrides();

function loadOverrides(): Overrides {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(OVERRIDES_KEY) : null;
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function saveOverrides() {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    /* storage unavailable: edits last for this session only */
  }
}

export function getOverrides(lang: Lang): Record<string, string> {
  return overrides[lang] ?? {};
}

/** Set (or with value null, remove) one edited string. */
export function setOverride(lang: Lang, key: string, value: string | null) {
  const cur = { ...getOverrides(lang) };
  if (value == null || value === DICTS[lang][key as MessageKey]) delete cur[key];
  else cur[key] = value;
  overrides = { ...overrides, [lang]: cur };
  saveOverrides();
}

/** Merge a JSON map of key -> text into a language. Unknown keys and non-text values are ignored. Returns how many were applied. */
export function importOverrides(lang: Lang, data: unknown): number {
  const map = (data && typeof data === 'object' && 'strings' in data ? (data as { strings: unknown }).strings : data) as Record<string, unknown>;
  if (!map || typeof map !== 'object' || Array.isArray(map)) throw new Error('not a translation map');
  let n = 0;
  for (const [k, v] of Object.entries(map)) {
    if (k in en && typeof v === 'string' && v.trim()) {
      setOverride(lang, k, v);
      n++;
    }
  }
  return n;
}

export function clearOverrides(lang: Lang) {
  overrides = { ...overrides, [lang]: {} };
  saveOverrides();
}

/** Built-in text merged with the user's edits: the same shape as locales/<lang>.json. */
export function effectiveDict(lang: Lang): Dict {
  return { ...DICTS[lang], ...getOverrides(lang) } as Dict;
}

export function translate(lang: Lang, key: string, params?: Msg['params']): string {
  let s = getOverrides(lang)[key] ?? (DICTS[lang] as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

interface I18n {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
  t: (key: MessageKey | string, params?: Msg['params']) => string;
  tm: (m: Msg) => string;
  /** Call after changing overrides so the screen re-renders with the new text. */
  refresh: () => void;
}

const Ctx = createContext<I18n | null>(null);

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved && saved in DICTS) return saved;
  } catch {
    /* storage unavailable */
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  if (nav.startsWith('ar')) return 'ar';
  if (nav.startsWith('ckb')) return 'ckb';
  if (nav.startsWith('ku-arab') || nav.startsWith('kmr-arab')) return 'badini';
  if (nav.startsWith('ku') || nav.startsWith('kmr')) return 'kmr';
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [version, setVersion] = useState(0);
  const meta = LANGS.find((l) => l.id === lang)!;
  useEffect(() => {
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* ignore */
    }
  }, [lang, meta]);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const value = useMemo<I18n>(
    () => ({
      lang,
      dir: meta.dir,
      setLang: setLangState,
      t: (key, params) => translate(lang, key, params),
      tm: (m) => translate(lang, m.key, m.params),
      refresh,
    }),
    // version: re-create t/tm after edits so consumers re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, meta, refresh, version],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n outside provider');
  return v;
}
