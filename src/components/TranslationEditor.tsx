import { useMemo, useRef, useState } from 'react';
import { en, type MessageKey } from '../i18n/en';
import { DICTS, LANGS, clearOverrides, effectiveDict, getOverrides, importOverrides, setOverride, useI18n, type Lang } from '../i18n';

const KEYS = Object.keys(en) as MessageKey[];
const placeholders = (s: string) => s.match(/\{\w+\}/g) ?? [];

function download(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function TranslationEditor() {
  const { t, lang: uiLang, refresh } = useI18n();
  const [lang, setLang] = useState<Lang>(uiLang === 'en' ? 'ckb' : uiLang);
  const [query, setQuery] = useState('');
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [notice, setNotice] = useState('');
  const [, bump] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const meta = LANGS.find((l) => l.id === lang)!;
  const edits = getOverrides(lang);
  const changed = Object.keys(edits).length;

  const update = () => {
    bump((v) => v + 1);
    refresh();
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return KEYS.filter((k) => {
      if (onlyChanged && !(k in edits)) return false;
      if (!q) return true;
      return [k, en[k], DICTS[lang][k], edits[k] ?? ''].some((s) => s.toLowerCase().includes(q));
    });
  }, [query, onlyChanged, lang, edits]);

  const onImport = async (file: File) => {
    try {
      const n = importOverrides(lang, JSON.parse(await file.text()));
      setNotice(t('tr.imported', { n }));
      update();
    } catch {
      setNotice(t('tr.importError'));
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(effectiveDict(lang), null, 2));
      setNotice(t('tr.copied'));
    } catch {
      download(`${lang}.json`, effectiveDict(lang));
    }
  };

  return (
    <section className="translator">
      <h2>{t('tr.title')}</h2>
      <p className="lead">{t('tr.intro')}</p>
      <p className="hint">{t('tr.review')}</p>

      <div className="card tr-toolbar">
        <div className="row">
          <label className="field">
            <span>{t('tr.language')}</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('tr.search')}</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
        <label className="check">
          <input type="checkbox" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} />
          <span>{t('tr.onlyChanged')}</span>
        </label>
        <p className="hint">
          {t('tr.shown', { n: rows.length })} · {t('tr.changedCount', { n: changed })}
        </p>
        <div className="actions wrap">
          <button type="button" className="primary" onClick={() => download(`${lang}.json`, effectiveDict(lang))}>{t('tr.exportFull')}</button>
          <button type="button" disabled={!changed} onClick={() => download(`${lang}-changes.json`, edits)}>{t('tr.export')}</button>
          <button type="button" onClick={copy}>{t('tr.copy')}</button>
          <button type="button" onClick={() => fileRef.current?.click()}>{t('tr.import')}</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImport(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="danger"
            disabled={!changed}
            onClick={() => {
              if (confirm(t('tr.confirmResetAll'))) {
                clearOverrides(lang);
                update();
              }
            }}
          >
            {t('tr.resetAll')}
          </button>
        </div>
        {notice && <p className="notice" role="status">{notice}</p>}
        <p className="hint">{t('tr.placeholderHint')}</p>
      </div>

      <ol className="tr-list">
        {rows.map((k) => {
          const value = edits[k] ?? DICTS[lang][k];
          const missing = placeholders(en[k]).filter((ph) => !value.includes(ph));
          return (
            <li key={k} className={`card tr-row${k in edits ? ' edited' : ''}`}>
              <div className="tr-head">
                <code dir="ltr">{k}</code>
                {k in edits && (
                  <>
                    <span className="tag">{t('tr.edited')}</span>
                    <button type="button" className="link" onClick={() => { setOverride(lang, k, null); update(); }}>{t('tr.undo')}</button>
                  </>
                )}
              </div>
              {lang !== 'en' && (
                <p className="tr-ref" dir="ltr" lang="en"><span className="sr-only">{t('tr.reference')}: </span>{en[k]}</p>
              )}
              <textarea
                dir={meta.dir}
                lang={meta.htmlLang}
                aria-label={`${k}`}
                rows={Math.min(8, Math.max(1, Math.ceil(value.length / 70)))}
                value={value}
                onChange={(e) => { setOverride(lang, k, e.target.value); update(); }}
              />
              {missing.map((ph) => (
                <p key={ph} className="error">{t('tr.missing', { ph })}</p>
              ))}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
