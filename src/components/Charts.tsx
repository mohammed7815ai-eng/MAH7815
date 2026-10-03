import { useI18n } from '../i18n';
import { packYears } from '../engine/rules';
import { agePercent, screeningWindows, CHART_MIN_AGE } from '../engine/timeline';
import type { Answers, Assessment, Recommendation } from '../engine/types';

const STATUS_ORDER: Recommendation['status'][] = ['recommended', 'discuss', 'specialist', 'notYet', 'notRecommended'];
const ICON: Record<Recommendation['status'], string> = {
  recommended: '✓',
  discuss: '?',
  specialist: '!',
  notYet: '…',
  notRecommended: '–',
  notApplicable: '–',
};
const TICKS = [20, 30, 40, 50, 60, 70, 80, 90];

/** Share of each result type, as one segmented bar with a labelled legend. */
function Glance({ assessment }: { assessment: Assessment }) {
  const { t, dir } = useI18n();
  const sep = dir === 'rtl' ? '، ' : ', ';
  const recs = assessment.recommendations.filter((r) => r.status !== 'notApplicable');
  const counts = STATUS_ORDER.map((s) => ({ s, n: recs.filter((r) => r.status === s).length })).filter((c) => c.n > 0);
  return (
    <figure className="chart">
      <figcaption>{t('chart.glance')}</figcaption>
      <div className="seg-bar" role="img" aria-label={counts.map((c) => `${t(`status.${c.s}`)}: ${c.n}`).join(', ')}>
        {counts.map((c) => (
          <span key={c.s} className={`seg st-${c.s}`} style={{ flexGrow: c.n }} title={`${t(`status.${c.s}`)}: ${c.n}`} />
        ))}
      </div>
      <ul className="legend">
        {counts.map((c) => (
          <li key={c.s}>
            <span className={`swatch st-${c.s}`} aria-hidden>{ICON[c.s]}</span>
            {t(`status.${c.s}`)} <strong>{c.n}</strong>
            <span className="muted"> · {recs.filter((r) => r.status === c.s).map((r) => t(`cancer.${r.cancer}`)).join(sep)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Age ranges for each screening on a shared age axis, with the person's age marked. */
function AgeTimeline({ answers, assessment }: { answers: Answers; assessment: Assessment }) {
  const { t } = useI18n();
  const rows = screeningWindows(answers, assessment);
  const age = answers.age ?? CHART_MIN_AGE;
  const you = agePercent(age);
  return (
    <figure className="chart">
      <figcaption>{t('chart.ages')}</figcaption>
      <div className="timeline">
        {rows.map((w) => {
          const label = `${t(`cancer.${w.cancer}`)}: ${t('chart.range', { from: w.from, to: w.to })}${w.applies ? '' : ` (${t('chart.ifRisk')})`}`;
          return (
            <div key={w.cancer} className="tl-row">
              <div className="tl-label">
                <span>{t(`cancer.${w.cancer}`)}</span>
                <span className="muted">
                  {t('chart.range', { from: w.from, to: w.to })}
                  {!w.applies && ` · ${t('chart.ifRisk')}`}
                </span>
              </div>
              <div className="tl-track" role="img" aria-label={label}>
                <span
                  className={`tl-bar st-${w.status}${w.applies ? '' : ' faded'}`}
                  style={{ insetInlineStart: `${agePercent(w.from)}%`, width: `${agePercent(w.to) - agePercent(w.from)}%` }}
                  title={label}
                />
                <span className="tl-you" style={{ insetInlineStart: `${you}%` }} aria-hidden />
              </div>
            </div>
          );
        })}
        <div className="tl-row tl-axis" aria-hidden>
          <div className="tl-label" />
          <div className="tl-track">
            {TICKS.map((x) => (
              <span key={x} className="tick" style={{ insetInlineStart: `${agePercent(x)}%` }}>{x}</span>
            ))}
            <span className={`tl-you-label${you < 12 ? ' at-start' : you > 88 ? ' at-end' : ''}`} style={{ insetInlineStart: `${you}%` }}>{t('chart.you', { age })}</span>
          </div>
        </div>
      </div>
      <p className="muted small">{t('chart.agesNote')}</p>
    </figure>
  );
}

/** A value on a scale with labelled zones and an optional threshold. */
function Meter({ title, value, max, zones, threshold, thresholdLabel }: {
  title: string;
  value: number;
  max: number;
  zones: { to: number; cls: string; label: string }[];
  threshold?: number;
  thresholdLabel?: string;
}) {
  const { t } = useI18n();
  const pct = (v: number) => (Math.min(v, max) / max) * 100;
  let from = 0;
  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      <div className="meter" role="img" aria-label={`${title}: ${value}`}>
        {zones.map((z) => {
          const el = (
            <span key={z.label} className={`zone ${z.cls}`} style={{ insetInlineStart: `${pct(from)}%`, width: `${pct(z.to) - pct(from)}%` }} title={z.label} />
          );
          from = z.to;
          return el;
        })}
        {threshold != null && <span className="threshold" style={{ insetInlineStart: `${pct(threshold)}%` }} title={thresholdLabel} />}
        <span className="marker" style={{ insetInlineStart: `${pct(value)}%` }}>
          <span className={`marker-label${pct(value) < 15 ? ' at-start' : pct(value) > 85 ? ' at-end' : ''}`}>{t('chart.yourValue', { v: value })}</span>
        </span>
      </div>
      <ul className="legend">
        {zones.map((z) => (
          <li key={z.label}>
            <span className={`swatch ${z.cls}`} aria-hidden /> {z.label}
          </li>
        ))}
        {thresholdLabel && (
          <li>
            <span className="swatch threshold-swatch" aria-hidden /> {thresholdLabel}
          </li>
        )}
      </ul>
    </figure>
  );
}

export function Charts({ answers, assessment }: { answers: Answers; assessment: Assessment }) {
  const { t } = useI18n();
  const py = answers.smoking !== 'never' ? packYears(answers) : null;
  const psa = answers.sex === 'male' ? answers.psaValue : null;
  return (
    <section className="card charts">
      <Glance assessment={assessment} />
      <AgeTimeline answers={answers} assessment={assessment} />
      {py != null && (
        <Meter
          title={t('chart.packYears')}
          value={py}
          max={Math.max(60, Math.ceil((py * 1.15) / 10) * 10)}
          zones={[
            { to: 30, cls: 'z-neutral', label: '0–30' },
            { to: Math.max(60, Math.ceil((py * 1.15) / 10) * 10), cls: 'z-high', label: '> 30' },
          ]}
          threshold={30}
          thresholdLabel={t('chart.packThreshold')}
        />
      )}
      {psa != null && (
        <Meter
          title={t('chart.psa')}
          value={psa}
          max={Math.max(15, Math.ceil(psa * 1.15))}
          zones={[
            { to: 2.5, cls: 'z-low', label: t('chart.psaZone1') },
            { to: 4, cls: 'z-mid', label: t('chart.psaZone2') },
            { to: 10, cls: 'z-high', label: t('chart.psaZone3') },
            { to: Math.max(15, Math.ceil(psa * 1.15)), cls: 'z-top', label: t('chart.psaZone4') },
          ]}
        />
      )}
    </section>
  );
}

