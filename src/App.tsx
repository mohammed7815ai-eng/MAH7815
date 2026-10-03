import { useEffect, useMemo, useState } from 'react';
import { LANGS, useI18n, type Lang } from './i18n';
import { assess } from './engine/rules';
import { emptyAnswers, type Answers } from './engine/types';
import { Questionnaire } from './components/Questionnaire';
import { Results } from './components/Results';
import { Learn } from './components/Learn';
import { Assistant } from './components/Assistant';
import { About } from './components/About';
import { TranslationEditor } from './components/TranslationEditor';
import { KurdistanFlag } from './components/KurdistanFlag';
import { Footer } from './components/Footer';

type Tab = 'check' | 'learn' | 'assistant' | 'translate' | 'about';

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

  // Pink theme for women, blue for men (set on <html> so the whole page background changes).
  useEffect(() => {
    if (answers.sex) document.documentElement.dataset.sex = answers.sex;
    else delete document.documentElement.dataset.sex;
  }, [answers.sex]);

  const tabs: Tab[] = ['check', 'learn', ...(__AI_ASSISTANT__ ? (['assistant'] as Tab[]) : []), ...(__TRANSLATION_EDITOR__ ? (['translate'] as Tab[]) : []), 'about'];

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <KurdistanFlag className="flag" width={54} />
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
        {tabs.map((id) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {t(`nav.${id}`)}
          </button>
        ))}
      </nav>

      {answers.sex && (
        <p className="care no-print" role="note">
          <span aria-hidden>♥</span> {t(answers.sex === 'male' ? 'care.male' : 'care.female')}
        </p>
      )}

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
        {__AI_ASSISTANT__ && tab === 'assistant' && <Assistant answers={answers} assessment={showResults ? assessment : null} />}
        {__TRANSLATION_EDITOR__ && tab === 'translate' && <TranslationEditor />}
        {tab === 'about' && <About />}
      </main>

      <Footer />
    </div>
  );
}
