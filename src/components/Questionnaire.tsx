import { useState, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { packYears } from '../engine/rules';
import { Hero } from './Hero';
import type { Answers, FormSectionId, YesNoUnknown } from '../engine/types';

type BoolKey = { [K in keyof Answers]: Answers[K] extends boolean ? K : never }[keyof Answers];
type YnuKey = 'lifetimeRisk20' | 'gail5yr17' | 'tammemagi2' | 'sexuallyActive';

/** Health-problem questions per section that "I do not have any of the above" answers with No. */
const NONE_FIELDS: Record<FormSectionId, { bools: BoolKey[]; ynu?: YnuKey[]; extra?: Partial<Answers> }> = {
  basics: { bools: ['symptoms', 'limitedLifeExpectancy'] },
  breast: { bools: ['personalBreastCancer', 'familyBreastOvarian', 'geneticMutation', 'chestRadiation10to30', 'highRiskBreastLesion'], ynu: ['lifetimeRisk20', 'gail5yr17'] },
  cervical: { bools: ['totalHysterectomy', 'immunocompromised', 'previousAbnormalCervical'] },
  colorectal: { bools: ['ibd', 'personalPolypsOrCrc', 'lynchSyndrome'], extra: { crcFamily: 'none', youngestDxAge: null } },
  lung: { bools: ['occupationalExposure', 'copdOrTb', 'personalLungCancer'] },
  prostate: { bools: ['familyProstateOrOther', 'geneticMutation', 'africanAncestry'] },
};

const NONE_LABEL: Record<FormSectionId, string> = {
  basics: 'form.noneBasics',
  breast: 'form.noneBreast',
  cervical: 'form.noneIssues',
  colorectal: 'form.noneIssues',
  lung: 'form.noneIssues',
  prostate: 'form.noneIssues',
};

function Section({ title, children }: { title: string; children: ReactNode }) {
return (
  <section className="card form-section">
    <h3>{title}</h3>
    {children}
  </section>
);
}

export function Questionnaire({ answers, onChange, onSubmit, onReset }: {
  answers: Answers;
  onChange: (a: Answers) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const { t } = useI18n();
  const [error, setError] = useState('');
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    const next = { ...answers, [k]: v };
    if (v !== false && v !== 'no' && !(k === 'crcFamily' && v === 'none')) {
      const cleared = { ...answers.noneOfAbove };
      for (const [id, f] of Object.entries(NONE_FIELDS) as [FormSectionId, (typeof NONE_FIELDS)[FormSectionId]][]) {
        if ((f.bools as string[]).includes(k) || (f.ynu as string[] | undefined)?.includes(k) || (f.extra && k in f.extra)) cleared[id] = false;
      }
      next.noneOfAbove = cleared;
    }
    onChange(next);
  };

  const setNone = (id: FormSectionId, on: boolean) => {
    const next: Answers = { ...answers, noneOfAbove: { ...answers.noneOfAbove, [id]: on } };
    if (on) {
      const f = NONE_FIELDS[id];
      for (const k of f.bools) (next as unknown as Record<string, unknown>)[k] = false;
      for (const k of f.ynu ?? []) next[k] = 'no';
      Object.assign(next, f.extra);
    }
    onChange(next);
  };

  const none = (id: FormSectionId) => (
    <label className={`none-above ${answers.noneOfAbove?.[id] ? 'on' : ''}`}>
      <input type="checkbox" name={`none-${id}`} checked={!!answers.noneOfAbove?.[id]} onChange={(e) => setNone(id, e.target.checked)} />
      <span>{t(NONE_LABEL[id])}</span>
    </label>
  );
  const num = (s: string): number | null => (s.trim() === '' || isNaN(Number(s)) ? null : Number(s));

  // Each risk factor is answered with explicit Yes / No buttons (default No).
  const check = (k: BoolKey, label: string) => (
    <div className="yesno" key={k}>
      <span className="q" id={`q-${k}`}>{label}</span>
      <div className="pills" role="radiogroup" aria-labelledby={`q-${k}`}>
        {([true, false] as const).map((v) => (
          <label key={String(v)} className={`pill ${v ? 'yes' : 'no'}`}>
            <input type="radio" name={k} checked={answers[k] === v} onChange={() => set(k, v as Answers[typeof k])} />
            <span>{t(v ? 'yn.yes' : 'yn.no')}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const ynu = (k: YnuKey, label: string) => (
    <div className="yesno">
      <span className="q" id={`q-${k}`}>{label}</span>
      <div className="pills" role="radiogroup" aria-labelledby={`q-${k}`}>
        {(['yes', 'no', 'unknown'] as YesNoUnknown[]).map((v) => (
          <label key={v} className={`pill ${v === 'yes' ? 'yes' : ''}`}>
            <input type="radio" name={k} checked={answers[k] === v} onChange={() => set(k, v)} />
            <span>{t(`yn.${v}`)}</span>
          </label>
        ))}
      </div>
    </div>
  );


  const submit = () => {
    if (answers.age == null || answers.sex == null) return setError(t('form.needAgeSex'));
    if (answers.age < 18 || answers.age > 100) return setError(t('form.ageRange'));
    setError('');
    onSubmit();
  };

  const py = packYears(answers);
  const female = answers.sex === 'female';
  const male = answers.sex === 'male';

  return (
    <form className="questionnaire" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <Hero caption={t('hero.caption')} />
      <p className="lead">{t('form.intro')}</p>

      <Section title={t('form.basics')}>
        <div className="row">
          <label className="field">
            <span>{t('form.age')}</span>
            <input type="number" inputMode="numeric" min={18} max={100} value={answers.age ?? ''} onChange={(e) => set('age', num(e.target.value))} />
          </label>
          <fieldset className="field">
            <legend>{t('form.sex')}</legend>
            <div className="pills">
              {(['female', 'male'] as const).map((s) => (
                <label key={s} className="pill">
                  <input type="radio" name="sex" checked={answers.sex === s} onChange={() => set('sex', s)} />
                  <span>{t(`sex.${s}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {check('symptoms', t('form.symptoms'))}
        {check('limitedLifeExpectancy', t('form.limited'))}
        {none('basics')}
      </Section>

      {female && (
        <Section title={t('form.breastSection')}>
          {check('personalBreastCancer', t('form.personalBreastCancer'))}
          {check('familyBreastOvarian', t('form.familyBreastOvarian'))}
          {check('geneticMutation', t('form.geneticMutation'))}
          {check('chestRadiation10to30', t('form.chestRadiation'))}
          {check('highRiskBreastLesion', t('form.highRiskLesion'))}
          {ynu('lifetimeRisk20', t('form.lifetimeRisk20'))}
          {ynu('gail5yr17', t('form.gail'))}
          {none('breast')}
        </Section>
      )}

      {female && (
        <Section title={t('form.cervicalSection')}>
          {ynu('sexuallyActive', t('form.sexuallyActive'))}
          {check('totalHysterectomy', t('form.hysterectomy'))}
          {check('immunocompromised', t('form.immuno'))}
          {check('previousAbnormalCervical', t('form.prevAbnormal'))}
          {(answers.age ?? 0) > 69 && check('previousNegativeScreensAfter65', t('form.negativeAfter65'))}
          {none('cervical')}
        </Section>
      )}

      <Section title={t('form.crcSection')}>
        <fieldset className="field">
          <legend>{t('form.crcFamily')}</legend>
          {(['none', 'fdr60plus', 'fdrUnder60', 'twoFdr', 'twoSdr'] as const).map((v) => (
            <label key={v} className="check">
              <input type="radio" name="crcFamily" checked={answers.crcFamily === v} onChange={() => set('crcFamily', v)} />
              <span>{t(`crcFam.${v}`)}</span>
            </label>
          ))}
        </fieldset>
        {(answers.crcFamily === 'fdrUnder60' || answers.crcFamily === 'twoFdr') && (
          <label className="field">
            <span>{t('form.youngestDxAge')}</span>
            <input type="number" inputMode="numeric" min={1} max={100} value={answers.youngestDxAge ?? ''} onChange={(e) => set('youngestDxAge', num(e.target.value))} />
          </label>
        )}
        {check('ibd', t('form.ibd'))}
        {check('personalPolypsOrCrc', t('form.personalPolyps'))}
        {check('lynchSyndrome', t('form.lynch'))}
        {none('colorectal')}
      </Section>

      <Section title={t('form.lungSection')}>
        <fieldset className="field">
          <legend>{t('form.smoking')}</legend>
          <div className="pills">
            {(['never', 'current', 'former'] as const).map((s) => (
              <label key={s} className="pill">
                <input type="radio" name="smoking" checked={answers.smoking === s} onChange={() => set('smoking', s)} />
                <span>{t(`smoking.${s}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {answers.smoking !== 'never' && (
          <div className="row">
            <label className="field">
              <span>{t('form.cigsPerDay')}</span>
              <input type="number" inputMode="numeric" min={0} value={answers.cigarettesPerDay ?? ''} onChange={(e) => set('cigarettesPerDay', num(e.target.value))} />
            </label>
            <label className="field">
              <span>{t('form.smokingYears')}</span>
              <input type="number" inputMode="numeric" min={0} value={answers.smokingYears ?? ''} onChange={(e) => set('smokingYears', num(e.target.value))} />
            </label>
            {answers.smoking === 'former' && (
              <label className="field">
                <span>{t('form.yearsSinceQuit')}</span>
                <input type="number" inputMode="numeric" min={0} value={answers.yearsSinceQuit ?? ''} onChange={(e) => set('yearsSinceQuit', num(e.target.value))} />
              </label>
            )}
          </div>
        )}
        {answers.smoking !== 'never' && py != null && <p className="hint">{t('form.packYearsLive', { py })}</p>}
        {answers.smoking !== 'never' && ynu('tammemagi2', t('form.tammemagi'))}
        {check('occupationalExposure', t('form.occupational'))}
        {check('copdOrTb', t('form.copdTb'))}
        {check('personalLungCancer', t('form.personalLung'))}
        {none('lung')}
      </Section>

      {male && (
        <Section title={t('form.prostateSection')}>
          {check('familyProstateOrOther', t('form.familyProstate'))}
          {check('geneticMutation', t('form.geneticMutation'))}
          {check('africanAncestry', t('form.african'))}
          <div className="row">
            <label className="field">
              <span>{t('form.psa')}</span>
              <input type="number" inputMode="decimal" step="0.1" min={0} value={answers.psaValue ?? ''} onChange={(e) => set('psaValue', num(e.target.value))} />
            </label>
            <fieldset className="field">
              <legend>{t('form.dre')}</legend>
              <div className="pills">
                {(['notDone', 'normal', 'abnormal'] as const).map((s) => (
                  <label key={s} className="pill">
                    <input type="radio" name="dre" checked={answers.dreResult === s} onChange={() => set('dreResult', s)} />
                    <span>{t(`dre.${s}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          {none('prostate')}
        </Section>
      )}

      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        <button type="submit" className="primary">{t('form.submit')}</button>
        <button type="button" onClick={onReset}>{t('form.reset')}</button>
      </div>
    </form>
  );
}
