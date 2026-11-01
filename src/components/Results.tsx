import { useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useI18n } from '../i18n';
import { deliverPdf, pdfFileName, planPdf } from '../pdf';
import { Flag } from './Flag';
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
  const ref = useRef<HTMLDivElement>(null);
  const [pdfState, setPdfState] = useState<'idle' | 'working' | 'saved' | 'error'>('idle');
  const today = new Date().toLocaleDateString('en-GB');

  const savePdf = async () => {
    if (!ref.current || pdfState === 'working') return;
    setPdfState('working');
    try {
      const blob = await planPdf(ref.current, t('results.title'));
      const r = await deliverPdf(blob, pdfFileName());
      setPdfState(r === 'cancelled' ? 'idle' : 'saved');
    } catch (e) {
      console.warn('PDF', e);
      setPdfState('error');
    }
  };

  return (
    <div className="results" ref={ref}>
      {/* Shown only in the PDF and on paper: who made the plan and when. */}
      <div className="print-head">
        <Flag width={46} />
        <div>
          <strong>{t('app.title')}</strong>
          <span>{t('app.subtitle')}</span>
          <span>{t('pdf.date', { date: today })}</span>
        </div>
      </div>
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
        <button onClick={onEdit}>{t('results.edit')}</button>
        <button className="primary" onClick={savePdf} disabled={pdfState === 'working'} aria-busy={pdfState === 'working'}>
          {pdfState === 'working' ? t('results.pdfWorking') : t('results.savePdf')}
        </button>
        {!Capacitor.isNativePlatform() && <button onClick={() => window.print()}>{t('results.printOnly')}</button>}
        {__AI_ASSISTANT__ && <button onClick={onAskAi}>{t('results.askAi')}</button>}
      </div>
      {(pdfState === 'saved' || pdfState === 'error') && (
        <p className={`notice no-print ${pdfState === 'error' ? 'error' : ''}`} role="status">
          {t(pdfState === 'saved' ? 'results.pdfSaved' : 'results.pdfError')}
        </p>
      )}
    </div>
  );
}
