import { useI18n } from '../i18n';
import { SOURCES } from '../engine/sources';
import { Charts } from './Charts';
import type { Answers, Assessment, Recommendation } from '../engine/types';
import type { SendStatus } from '../server';

const ICON: Record<Recommendation['status'], string> = {
  recommended: '✓',
  discuss: '?',
  specialist: '!',
  notYet: '…',
  notRecommended: '–',
  notApplicable: '–',
};

export function Results({ answers, assessment, sendStatus, onEdit, onAskAi }: {
  answers: Answers;
  assessment: Assessment;
  sendStatus?: SendStatus | null;
  onEdit: () => void;
  onAskAi: () => void;
}) {
  const { t, tm } = useI18n();
  const recs = assessment.recommendations.filter((r) => r.status !== 'notApplicable');

  return (
    <div className="results">
      <div className="results-head">
        <h2>{t('results.title')}</h2>
        <p className="muted">{t('results.for', { age: answers.age ?? '', sex: t(`sex.${answers.sex}`) })}</p>
      </div>

      {assessment.urgentSeeDoctor && (
        <div className="alert" role="alert">
          <strong>⚠</strong> {t('results.urgent')}
        </div>
      )}

      <Charts answers={answers} assessment={assessment} />

      {recs.map((r) => (
        <article key={r.cancer} className={`card rec status-${r.status}`}>
          <header>
            <span className="status-icon" aria-hidden>{ICON[r.status]}</span>
            <div>
              <h3>{t(`cancer.${r.cancer}`)}</h3>
              <span className="badge">{t(`status.${r.status}`)}</span>
              <span className={`src-tag ${r.krgBased ? 'krg' : 'intl'}`}>{r.krgBased ? t('results.krg') : t('results.intlBased')}</span>
            </div>
          </header>
          <p className="headline">{tm(r.headline)}</p>
          <ul>
            {r.details.map((d, i) => (
              <li key={i}>{tm(d)}</li>
            ))}
          </ul>
          {r.international && (
            <details>
              <summary>{t('results.intlCompare')}</summary>
              {r.international.map((d, i) => (
                <p key={i}>{tm(d)}</p>
              ))}
            </details>
          )}
          <details>
            <summary>{t('results.sources')}</summary>
            <ul className="sources">
              {r.sources.map((s) => {
                const src = SOURCES[s];
                return (
                  <li key={s} dir="ltr">
                    {src.url ? <a href={src.url} target="_blank" rel="noreferrer">{src.org}</a> : src.org} — {src.title} ({src.year})
                  </li>
                );
              })}
            </ul>
          </details>
        </article>
      ))}

      <div className="card thanks" role="status">
        <span aria-hidden>♥</span>
        <p>{t(answers.sex === 'male' ? 'thanks.male' : 'thanks.female')}</p>
      </div>

      {sendStatus && <p className={`sync sync-${sendStatus}`} role="status">{t(`sync.${sendStatus}`)}</p>}

      <p className="muted small">{t('results.footer')}</p>
      <p className="muted small">{t('about.disclaimer')}</p>

      <div className="actions no-print">
        <button className="primary" onClick={onEdit}>{t('results.edit')}</button>
        <button onClick={() => window.print()}>{t('results.print')}</button>
        {__AI_ASSISTANT__ && <button onClick={onAskAi}>{t('results.askAi')}</button>}
      </div>
    </div>
  );
}
