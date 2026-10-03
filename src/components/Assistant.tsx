import { useEffect, useRef, useState } from 'react';
import { LANGS, translate, useI18n } from '../i18n';
import { MODELS, streamReply, type ChatTurn } from '../ai/client';
import { systemPrompt } from '../ai/knowledge';
import type { Answers, Assessment } from '../engine/types';

const AGENTS = ['navigator', 'breast', 'cervical', 'colorectal', 'lung', 'prostate'] as const;
const LANG_NAMES: Record<string, string> = {
  en: 'English',
  ar: 'Arabic',
  ckb: 'Central Kurdish (Sorani), in Arabic script',
  kmr: 'Northern Kurdish (Kurmanji), in Latin script',
  badini: 'Kurdish Badini (Behdini dialect of Northern Kurdish, as spoken in Duhok), in Kurdish Arabic script',
};

function load(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: string | null) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function summarize(answers: Answers, assessment: Assessment | null): string {
  const lines = [`Questionnaire answers (JSON): ${JSON.stringify(answers)}`];
  if (assessment) {
    lines.push('Rule-engine screening plan:');
    for (const r of assessment.recommendations) {
      lines.push(`- ${r.cancer}: ${r.status} — ${translate('en', r.headline.key, r.headline.params)}. ${r.details.map((d) => translate('en', d.key, d.params)).join(' ')}`);
    }
  }
  return lines.join('\n');
}

export function Assistant({ answers, assessment }: { answers: Answers; assessment: Assessment | null }) {
  const { t, lang } = useI18n();
  const [apiKey, setApiKey] = useState(() => load('anthropicKey', ''));
  const [draftKey, setDraftKey] = useState('');
  const [model, setModel] = useState(() => load('model', MODELS[0].id));
  const [agent, setAgent] = useState<string>('navigator');
  const [share, setShare] = useState(assessment != null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => save('model', model), [model]);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns]);

  if (!apiKey) {
    return (
      <div>
        <h2>{t('ai.title')}</h2>
        <p className="lead">{t('ai.intro')}</p>
        <section className="card">
          <p>{t('ai.offline')}</p>
          <label className="field">
            <span>{t('ai.key')}</span>
            <input type="password" dir="ltr" autoComplete="off" value={draftKey} onChange={(e) => setDraftKey(e.target.value)} placeholder="sk-ant-..." />
          </label>
          <button
            className="primary"
            disabled={!draftKey.trim()}
            onClick={() => {
              save('anthropicKey', draftKey.trim());
              setApiKey(draftKey.trim());
              setDraftKey('');
            }}
          >
            {t('ai.save')}
          </button>
        </section>
      </div>
    );
  }

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setError('');
    setInput('');
    const history: ChatTurn[] = [...turns, { role: 'user', content: q }];
    setTurns([...history, { role: 'assistant', content: '' }]);
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const langName = LANG_NAMES[lang] ?? LANGS.find((l) => l.id === lang)?.name ?? 'English';
    let system = systemPrompt(agent, langName);
    if (share) system += `\n\nThe user chose to share their questionnaire and the app's rule-based plan:\n${summarize(answers, assessment)}`;
    try {
      await streamReply({
        apiKey,
        model,
        system,
        messages: history,
        signal: ctrl.signal,
        onText: (txt) => setTurns([...history, { role: 'assistant', content: txt }]),
      });
    } catch (e) {
      setTurns(history.slice(0, -1));
      setInput(q);
      setError(t('ai.error', { error: e instanceof Error ? e.message : String(e) }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="assistant">
      <h2>{t('ai.title')}</h2>
      <p className="muted">{t('ai.warning')}</p>
      <div className="row">
        <label className="field">
          <span>{t('ai.agent')}</span>
          <select value={agent} onChange={(e) => setAgent(e.target.value)}>
            {AGENTS.map((a) => (
              <option key={a} value={a}>{t(`agent.${a}`)}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t('ai.model')}</span>
          <select value={model} onChange={(e) => setModel(e.target.value)} dir="ltr">
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="check">
        <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} />
        <span>{t('ai.shareResults')}</span>
      </label>

      <div className="chat-log" ref={logRef} aria-live="polite">
        {turns.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.content || (busy && i === turns.length - 1 ? t('ai.thinking') : '')}
          </div>
        ))}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <textarea
          rows={2}
          value={input}
          placeholder={t('ai.placeholder')}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="submit" className="primary" disabled={busy || !input.trim()}>{t('ai.send')}</button>
      </form>
      <div className="actions">
        <button onClick={() => { abortRef.current?.abort(); setTurns([]); setError(''); }}>{t('ai.newChat')}</button>
        <button onClick={() => { save('anthropicKey', null); setApiKey(''); setTurns([]); }}>{t('ai.clear')}</button>
      </div>
    </div>
  );
}
