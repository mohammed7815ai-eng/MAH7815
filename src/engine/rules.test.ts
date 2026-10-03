import { describe, expect, it } from 'vitest';
import { assess, breast, cervical, colorectal, lung, packYears, prostate } from './rules';
import { emptyAnswers, type Answers, type Msg } from './types';
import { en } from '../i18n/en';
import { DICTS, clearOverrides, effectiveDict, importOverrides, setOverride, translate } from '../i18n';

const A = (o: Partial<Answers>): Answers => ({ ...emptyAnswers, ...o });

describe('breast (KRG 2023)', () => {
  it('average-risk woman 50: mammogram every 2 years', () => {
    const r = breast(A({ age: 50, sex: 'female' }));
    expect(r.status).toBe('recommended');
    expect(r.headline.key).toBe('breast.avg.headline');
    expect(r.krgBased).toBe(true);
  });
  it('average-risk woman 40: not yet (starts at 45)', () => {
    expect(breast(A({ age: 40, sex: 'female' })).status).toBe('notYet');
  });
  it('average-risk woman 72: discuss', () => {
    expect(breast(A({ age: 72, sex: 'female' })).status).toBe('discuss');
  });
  it('BRCA carrier 37: high-risk, annual MRI/mammogram and genetic referral', () => {
    const r = breast(A({ age: 37, sex: 'female', geneticMutation: true }));
    const keys = r.details.map((d) => d.key);
    expect(r.headline.key).toBe('breast.high.headline');
    expect(keys).toContain('breast.high.mri35to40');
    expect(keys).toContain('breast.high.genetic');
  });
  it('chest radiation 10-30 at age 50: annual mammogram', () => {
    const r = breast(A({ age: 50, sex: 'female', chestRadiation10to30: true }));
    expect(r.details.map((d) => d.key)).toContain('breast.high.annualMammo');
  });
  it('Gail >= 1.7% only counts from age 35', () => {
    expect(breast(A({ age: 33, sex: 'female', gail5yr17: 'yes' })).headline.key).not.toBe('breast.high.headline');
    expect(breast(A({ age: 36, sex: 'female', gail5yr17: 'yes' })).headline.key).toBe('breast.high.headline');
  });
  it('family history alone prompts risk assessment', () => {
    const r = breast(A({ age: 40, sex: 'female', familyBreastOvarian: true }));
    expect(r.status).toBe('specialist');
  });
  it('not applicable to men', () => {
    expect(breast(A({ age: 50, sex: 'male' })).status).toBe('notApplicable');
  });
});

describe('lung (KRG 2023)', () => {
  it('computes pack-years', () => {
    expect(packYears(A({ smoking: 'current', cigarettesPerDay: 20, smokingYears: 35 }))).toBe(35);
  });
  it('60-year-old current smoker with 40 pack-years: LDCT', () => {
    const r = lung(A({ age: 60, sex: 'male', smoking: 'current', cigarettesPerDay: 40, smokingYears: 20 }));
    expect(r.status).toBe('recommended');
  });
  it('former smoker quit 12 years ago: not eligible on smoking alone', () => {
    const r = lung(A({ age: 60, sex: 'male', smoking: 'former', cigarettesPerDay: 40, smokingYears: 20, yearsSinceQuit: 12 }));
    expect(r.status).toBe('notRecommended');
  });
  it('exactly 30 pack-years is not "more than 30"', () => {
    const r = lung(A({ age: 60, sex: 'male', smoking: 'current', cigarettesPerDay: 20, smokingYears: 30 }));
    expect(r.status).toBe('notRecommended');
  });
  it('Tammemagi > 2% age 60: LDCT', () => {
    expect(lung(A({ age: 60, sex: 'male', smoking: 'former', cigarettesPerDay: 10, smokingYears: 20, yearsSinceQuit: 15, tammemagi2: 'yes' })).status).toBe('recommended');
  });
  it('occupational exposure age 58: LDCT referral', () => {
    expect(lung(A({ age: 58, sex: 'female', occupationalExposure: true })).status).toBe('recommended');
  });
  it('previous lung cancer excluded', () => {
    expect(lung(A({ age: 60, sex: 'male', personalLungCancer: true })).status).toBe('specialist');
  });
  it('limited life expectancy excluded', () => {
    expect(lung(A({ age: 60, sex: 'male', smoking: 'current', cigarettesPerDay: 40, smokingYears: 30, limitedLifeExpectancy: true })).status).toBe('notRecommended');
  });
});

describe('prostate (KRG 2023)', () => {
  it('50 without risk factors: not recommended', () => {
    expect(prostate(A({ age: 50, sex: 'male' })).status).toBe('notRecommended');
  });
  it('47 with family history: discuss', () => {
    expect(prostate(A({ age: 47, sex: 'male', familyProstateOrOther: true })).status).toBe('discuss');
  });
  it('60: shared decision', () => {
    expect(prostate(A({ age: 60, sex: 'male' })).status).toBe('discuss');
  });
  it('PSA 12: refer to urologist', () => {
    const r = prostate(A({ age: 60, sex: 'male', psaValue: 12 }));
    expect(r.status).toBe('specialist');
    expect(r.details.map((d) => d.key)).toContain('prostate.psa.over10');
  });
  it('PSA 1.8 normal DRE: retest in 2 years', () => {
    const r = prostate(A({ age: 60, sex: 'male', psaValue: 1.8, dreResult: 'normal' }));
    expect(r.details.map((d) => d.key)).toContain('prostate.psa.under2_5');
  });
  it('PSA 3 abnormal DRE: biopsy pathway', () => {
    const r = prostate(A({ age: 60, sex: 'male', psaValue: 3, dreResult: 'abnormal' }));
    expect(r.status).toBe('specialist');
  });
  it('limited life expectancy: never screen', () => {
    expect(prostate(A({ age: 65, sex: 'male', limitedLifeExpectancy: true })).status).toBe('notRecommended');
  });
});

describe('cervical (KRG 2023)', () => {
  it('35: HPV every 5-10 y or Pap every 3 y', () => {
    const r = cervical(A({ age: 35, sex: 'female' }));
    expect(r.status).toBe('recommended');
    expect(r.krgBased).toBe(true);
    expect(r.details.map((d) => d.key)).toContain('cervical.methods');
  });
  it('55: Pap every 5 years', () => {
    expect(cervical(A({ age: 55, sex: 'female' })).details.map((d) => d.key)).toContain('cervical.methods50');
  });
  it('never sexually active: not yet', () => {
    expect(cervical(A({ age: 40, sex: 'female', sexuallyActive: 'no' })).status).toBe('notYet');
  });
  it('26: discuss (MoH from 30, private from 25)', () => {
    expect(cervical(A({ age: 26, sex: 'female' })).status).toBe('discuss');
  });
  it('72 with normal history: can stop', () => {
    expect(cervical(A({ age: 72, sex: 'female', previousNegativeScreensAfter65: true })).status).toBe('notRecommended');
  });
  it('hysterectomy: not needed', () => {
    expect(cervical(A({ age: 40, sex: 'female', totalHysterectomy: true })).status).toBe('notRecommended');
  });
});

describe('colorectal (KRG 2023)', () => {
  it('46 average risk: colonoscopy every 10 years', () => {
    const r = colorectal(A({ age: 46, sex: 'male' }));
    expect(r.status).toBe('recommended');
    expect(r.headline.key).toBe('crc.headline');
    expect(r.krgBased).toBe(true);
  });
  it('42 with FDR diagnosed at 65: moderate risk, 10-yearly from 40', () => {
    expect(colorectal(A({ age: 42, sex: 'female', crcFamily: 'fdr60plus' })).headline.key).toBe('crc.moderateHeadline');
  });
  it('FDR diagnosed at 45: start at 35, every 5 years', () => {
    const r = colorectal(A({ age: 36, sex: 'female', crcFamily: 'fdrUnder60', youngestDxAge: 45 }));
    expect(r.status).toBe('recommended');
    expect(r.details[0].params?.start).toBe(35);
  });
  it('FDR diagnosed at 55, age 38: not yet, start 40', () => {
    const r = colorectal(A({ age: 38, sex: 'female', crcFamily: 'fdrUnder60', youngestDxAge: 55 }));
    expect(r.status).toBe('notYet');
    expect(r.details[0].params?.start).toBe(40);
  });
  it('80 average risk: individual decision', () => {
    expect(colorectal(A({ age: 80, sex: 'male' })).status).toBe('discuss');
  });
  it('IBD: specialist', () => {
    expect(colorectal(A({ age: 30, sex: 'female', ibd: true })).status).toBe('specialist');
  });
});

describe('i18n', () => {
  it('every message the engine can emit exists in English', () => {
    const msgs: Msg[] = [];
    const ages = [20, 27, 32, 37, 42, 47, 52, 57, 62, 68, 71, 74, 78, 80, 90];
    const flags: Partial<Answers>[] = [
      {}, { geneticMutation: true }, { familyBreastOvarian: true }, { personalBreastCancer: true },
      { smoking: 'current', cigarettesPerDay: 40, smokingYears: 30 }, { smoking: 'former' }, { occupationalExposure: true },
      { personalLungCancer: true }, { limitedLifeExpectancy: true }, { psaValue: 2 }, { psaValue: 3 }, { psaValue: 6 },
      { psaValue: 6, dreResult: 'normal' }, { psaValue: 6, dreResult: 'abnormal' }, { psaValue: 3, dreResult: 'abnormal' }, { psaValue: 15 },
      { familyProstateOrOther: true }, { immunocompromised: true }, { totalHysterectomy: true }, { previousAbnormalCervical: true },
      { previousNegativeScreensAfter65: true }, { sexuallyActive: 'no' }, { crcFamily: 'fdr60plus' }, { crcFamily: 'twoFdr', youngestDxAge: 42 }, { crcFamily: 'twoSdr' }, { ibd: true }, { personalPolypsOrCrc: true }, { tammemagi2: 'yes' },
    ];
    for (const sex of ['female', 'male'] as const)
      for (const age of ages)
        for (const f of flags)
          for (const r of assess(A({ age, sex, ...f })).recommendations) msgs.push(r.headline, ...r.details, ...(r.international ?? []));
    const missing = [...new Set(msgs.map((m) => m.key))].filter((k) => !(k in en));
    expect(missing).toEqual([]);
  });
  it('all languages define every key and keep placeholders', () => {
    for (const [lang, dict] of Object.entries(DICTS)) {
      for (const [k, v] of Object.entries(en)) {
        expect(dict[k as keyof typeof en], `${lang}:${k}`).toBeTruthy();
        for (const ph of v.match(/\{\w+\}/g) ?? []) expect(dict[k as keyof typeof en], `${lang}:${k} ${ph}`).toContain(ph);
      }
    }
  });
  it('Badini is written in Arabic script (Latin only for acronyms and names)', () => {
    const latinWords = Object.values(DICTS.badini).join(' ').replace(/\{\w+\}/g, '').match(/\b[a-zçêîşû]{3,}\b/g) ?? [];
    expect(latinWords).toEqual([]);
  });
});

describe('translation editor overrides', () => {
  it('an edit replaces the built-in text and can be undone', () => {
    setOverride('ckb', 'nav.learn', 'فێربوون');
    expect(translate('ckb', 'nav.learn')).toBe('فێربوون');
    setOverride('ckb', 'nav.learn', null);
    expect(translate('ckb', 'nav.learn')).toBe(DICTS.ckb['nav.learn']);
  });
  it('import accepts a plain map or {strings}, ignores unknown keys and non-text', () => {
    expect(importOverrides('ar', { 'nav.learn': 'تعلّم', 'no.such.key': 'x', 'nav.about': 5 })).toBe(1);
    expect(importOverrides('ar', { strings: { 'nav.about': 'حول' } })).toBe(1);
    expect(effectiveDict('ar')['nav.about']).toBe('حول');
    clearOverrides('ar');
    expect(translate('ar', 'nav.learn')).toBe(DICTS.ar['nav.learn']);
  });
  it('rejects files that are not a translation map', () => {
    expect(() => importOverrides('kmr', [1, 2])).toThrow();
  });
});
