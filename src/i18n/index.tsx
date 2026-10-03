import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, type MessageKey } from './en';
import { ar } from './ar';
import { ckb } from './ckb';
import { kmr } from './kmr';
import type { Msg } from '../engine/types';

export type Lang = 'en' | 'ckb' | 'kmr' | 'ar';

export const LANGS: { id: Lang; name: string; dir: 'ltr' | 'rtl'; htmlLang: string }[] = [
  { id: 'ckb', name: 'کوردی (سۆرانی)', dir: 'rtl', htmlLang: 'ckb' },
  { id: 'kmr', name: 'Kurdî (Kurmancî)', dir: 'ltr', htmlLang: 'kmr' },
  { id: 'ar', name: 'العربية', dir: 'rtl', htmlLang: 'ar' },
  { id: 'en', name: 'English', dir: 'ltr', htmlLang: 'en' },
];

export const DICTS: Record<Lang, Record<MessageKey, string>> = { en, ar, ckb, kmr };

export function translate(lang: Lang, key: string, params?: Msg['params']): string {
  const dict = DICTS[lang] as Record<string, string>;
  let s = dict[key] ?? (en as Record<string, string>)[key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

interface I18n {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
  t: (key: MessageKey | string, params?: Msg['params']) => string;
  tm: (m: Msg) => string;
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
  if (nav.startsWith('ku') || nav.startsWith('kmr')) return 'kmr';
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
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
  const value = useMemo<I18n>(
    () => ({
      lang,
      dir: meta.dir,
      setLang: setLangState,
      t: (key, params) => translate(lang, key, params),
      tm: (m) => translate(lang, m.key, m.params),
    }),
    [lang, meta],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n outside provider');
  return v;
}
