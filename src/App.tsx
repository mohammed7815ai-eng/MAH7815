import { useMemo, useState } from 'react';
import { LANGS, useI18n, type Lang } from './i18n';
import { assess } from './engine/rules';
import { emptyAnswers, type Answers } from './engine/types';
import { Questionnaire } from './components/Questionnaire';
import { Results } from './components/Results';
import { Learn } from './components/Learn';
import { Assistant } from './components/Assistant';
import { About } from './components/About';

type Tab = 'check' | 'learn' | 'assistant' | 'about';

function loadAnswers(): Answers {
  try {
    const raw = localStorage.getItem('answers');
    if (raw) return { ...emptyAnswers, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return emptyAnswers;
}

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [tab, setTab] = useState<Tab>('check');
  const [answers, setAnswersState] = useState<Answers>(loadAnswers);
  const [showResults, setShowResults] = useState(false);
  const assessment = useMemo(() => (answers.age != null && answers.sex != null ? assess(answers) : null), [answers]);

  const setAnswers = (a: Answers) => {
    setAnswersState(a);
    try {
      localStorage.setItem('answers', JSON.stringify(a));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden>
            <circle cx="16" cy="16" r="15" fill="var(--accent)" />
            <path d="M16 7c-3 0-5 2.5-5 5.5 0 4 5 8 5 12.5 0-4.5 5-8.5 5-12.5C21 9.5 19 7 16 7z" fill="var(--on-accent)" />
          </svg>
          <div>
            <h1>{t('app.title')}</h1>
            <p className="subtitle">{t('app.subtitle')}</p>
          </div>
        </div>
        <label className="lang">
          <span className="sr-only">{t('lang.label')}</span>
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label={t('lang.label')}>
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>
      </header>

      <nav className="tabs no-print" role="tablist">
        {(['check', 'learn', 'assistant', 'about'] as Tab[]).map((id) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {t(`nav.${id}`)}
          </button>
        ))}
      </nav>

      <div className="disclaimer no-print">{t('disclaimer.short')} {t('privacy.short')}</div>

      <main>
        {tab === 'check' &&
          (showResults && assessment ? (
            <Results
              answers={answers}
              assessment={assessment}
              onEdit={() => setShowResults(false)}
              onAskAi={() => setTab('assistant')}
            />
          ) : (
            <Questionnaire
              answers={answers}
              onChange={setAnswers}
              onSubmit={() => {
                setShowResults(true);
                window.scrollTo({ top: 0 });
              }}
              onReset={() => setAnswers(emptyAnswers)}
            />
          ))}
        {tab === 'learn' && <Learn />}
        {tab === 'assistant' && <Assistant answers={answers} assessment={showResults ? assessment : null} />}
        {tab === 'about' && <About />}
      </main>
    </div>
  );
}
