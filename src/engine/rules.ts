/**
 * Deterministic screening rule engine.
 *
 * All five cancers encode the Kurdistan Regional Government (KRG) Ministry of Health
 * "Cancer Screening Clinical Practice Guidelines" 2023 (V01). Where the KRG text is
 * silent (e.g. upper age limits, immunocompromise), the gap is filled from WHO /
 * IARC / NHS / USPSTF evidence and the message says so.
 *
 * Every rule returns message keys (translated in src/i18n) and source ids
 * (listed in src/engine/sources.ts) so each recommendation can be traced.
 */
import type { Answers, Assessment, Msg, Recommendation } from './types';

const m = (key: string, params?: Msg['params']): Msg => ({ key, params });

export function packYears(a: Answers): number | null {
  if (a.smoking === 'never') return 0;
  if (a.cigarettesPerDay == null || a.smokingYears == null) return null;
  return Math.round((a.cigarettesPerDay / 20) * a.smokingYears * 10) / 10;
}

export function breast(a: Answers): Recommendation {
  const base = { cancer: 'breast' as const, krgBased: true, sources: ['krg2023', 'who_breast', 'uspstf_breast2024', 'nhs'] as Recommendation['sources'] };
  const intl = [m('breast.intl')];
  const age = a.age ?? 0;
  if (a.sex !== 'female') {
    return { ...base, status: 'notApplicable', headline: m('breast.na'), details: [m('breast.maleNote')] };
  }
  if (a.personalBreastCancer) {
    return { ...base, status: 'specialist', headline: m('breast.personalHistory'), details: [m('breast.personalHistoryDetail')] };
  }

  const groupA = a.lifetimeRisk20 === 'yes' || a.chestRadiation10to30;
  const groupB = (a.gail5yr17 === 'yes' && age >= 35) || (a.highRiskBreastLesion && a.lifetimeRisk20 === 'yes');
  const groupC = a.geneticMutation;
  const highRisk = groupA || groupB || groupC;
  const possibleHigh = !highRisk && (a.familyBreastOvarian || a.highRiskBreastLesion);

  if (highRisk) {
    const groups = [groupA && 'A', groupB && 'B', groupC && 'C'].filter(Boolean).join(', ');
    const details: Msg[] = [m('breast.high.groups', { groups }), m('breast.awareness')];
    if (groupC) details.push(m('breast.high.genetic'));
    let status: Recommendation['status'] = 'recommended';
    if (age < 30) {
      status = 'notYet';
      details.push(m('breast.high.under30'));
    } else if (age < 35) {
      details.push(m('breast.high.bseCbe'));
    } else if (age <= 40) {
      details.push(m('breast.high.bseCbe'), m('breast.high.mri35to40'));
    } else if (age < 45) {
      details.push(m('breast.high.bseCbe'), m('breast.high.gap41to44'));
    } else if (age <= 69) {
      details.push(m('breast.high.bseCbe'), m('breast.high.annualMammo'));
    } else {
      status = 'discuss';
      details.push(m('breast.over69'));
    }
    return { ...base, status, headline: m('breast.high.headline'), details, international: intl };
  }

  const details: Msg[] = [m('breast.awareness')];
  if (possibleHigh) details.unshift(m('breast.possibleHigh'));
  if (age < 45) {
    details.push(m('breast.avg.startAt45'));
    return { ...base, status: possibleHigh ? 'specialist' : 'notYet', headline: m(possibleHigh ? 'breast.possibleHighHeadline' : 'breast.avg.notYet'), details, international: intl };
  }
  if (age <= 69) {
    details.push(m('breast.avg.biennial'));
    return { ...base, status: 'recommended', headline: m('breast.avg.headline'), details, international: intl };
  }
  details.push(m('breast.over69'));
  return { ...base, status: 'discuss', headline: m('breast.avg.over69Headline'), details, international: intl };
}

export function lung(a: Answers): Recommendation {
  const base = { cancer: 'lung' as const, krgBased: true, sources: ['krg2023', 'acr_lungrads2022', 'uspstf_lung2021'] as Recommendation['sources'] };
  const intl = [m('lung.intl')];
  const age = a.age ?? 0;
  const py = packYears(a);
  const details: Msg[] = [];
  if (py != null && a.smoking !== 'never') details.push(m('lung.packYears', { py }));

  if (a.personalLungCancer) {
    return { ...base, status: 'specialist', headline: m('lung.previous'), details: [m('lung.previousDetail')] };
  }
  if (a.limitedLifeExpectancy) {
    return { ...base, status: 'notRecommended', headline: m('lung.excluded'), details: [m('lung.excludedDetail')] };
  }

  const recentSmoker = a.smoking === 'current' || (a.smoking === 'former' && a.yearsSinceQuit != null && a.yearsSinceQuit <= 10);
  const heavySmoker = py != null && py > 30 && recentSmoker;
  const otherRisk = a.occupationalExposure || a.copdOrTb || a.tammemagi2 === 'yes';
  const quit = a.smoking === 'current' ? [m('lung.quit')] : [];

  if (age >= 55 && age <= 70 && (heavySmoker || otherRisk)) {
    if (heavySmoker) details.push(m('lung.criteriaSmoking'));
    if (a.occupationalExposure) details.push(m('lung.criteriaOccupational'));
    if (a.copdOrTb) details.push(m('lung.criteriaCopd'));
    if (a.tammemagi2 === 'yes') details.push(m('lung.criteriaTammemagi'));
    details.push(m('lung.ldct'), m('lung.negative'), m('lung.teamReview'), ...quit);
    return { ...base, status: 'recommended', headline: m('lung.headline'), details, international: intl };
  }
  if (age > 70 && (heavySmoker || otherRisk)) {
    details.push(m('lung.over70'), ...quit);
    return { ...base, status: 'discuss', headline: m('lung.over70Headline'), details, international: intl };
  }
  if (age < 55 && (heavySmoker || otherRisk)) {
    details.push(m('lung.under55'), ...quit);
    return { ...base, status: 'notYet', headline: m('lung.notYet'), details, international: intl };
  }
  if (a.smoking !== 'never' && py == null) {
    details.push(m('lung.needPackYears'));
  }
  details.push(m('lung.notEligible'), ...quit);
  return { ...base, status: 'notRecommended', headline: m('lung.notRecommended'), details, international: intl };
}

export function prostatePsa(a: Answers): Msg[] {
  const psa = a.psaValue;
  if (psa == null) return [];
  const dre = a.dreResult;
  const out: Msg[] = [m('prostate.psa.value', { psa })];
  if (psa > 10) out.push(m('prostate.psa.over10'));
  else if (psa >= 4) {
    if (dre === 'abnormal') out.push(m('prostate.psa.4to10Abnormal'));
    else if (dre === 'normal') out.push(m('prostate.psa.4to10Normal'));
    else out.push(m('prostate.psa.needDre'));
  } else {
    if (dre === 'abnormal') out.push(m('prostate.psa.under4Abnormal'));
    else if (psa < 2.5) out.push(m('prostate.psa.under2_5'));
    else out.push(m('prostate.psa.2_5to4'));
  }
  return out;
}

export function prostate(a: Answers): Recommendation {
  const base = { cancer: 'prostate' as const, krgBased: true, sources: ['krg2023', 'uspstf_prostate2018', 'nhs'] as Recommendation['sources'] };
  const intl = [m('prostate.intl')];
  const age = a.age ?? 0;
  if (a.sex !== 'male') return { ...base, status: 'notApplicable', headline: m('prostate.na'), details: [] };
  if (a.limitedLifeExpectancy) {
    return { ...base, status: 'notRecommended', headline: m('prostate.lifeExpectancy'), details: [m('prostate.lifeExpectancyDetail')], international: intl };
  }
  const risk = a.familyProstateOrOther || a.geneticMutation || a.lynchSyndrome || a.africanAncestry;
  const psa = prostatePsa(a);
  const psaHigh = a.psaValue != null && (a.psaValue >= 4 || a.dreResult === 'abnormal');
  const details: Msg[] = [];
  if (risk) details.push(m('prostate.riskFactors'));

  let status: Recommendation['status'];
  let headline: Msg;
  if (age < 45) {
    status = 'notYet';
    headline = m('prostate.notYet');
    details.push(m(risk ? 'prostate.riskStart45' : 'prostate.noRiskUnder55'));
  } else if (age < 55) {
    if (risk) {
      status = 'discuss';
      headline = m('prostate.discussHeadline');
      details.push(m('prostate.riskStart45'), m('prostate.counselling'));
    } else {
      status = 'notRecommended';
      headline = m('prostate.notRecommendedUnder55');
      details.push(m('prostate.noRiskUnder55'));
    }
  } else if (age <= 72) {
    status = 'discuss';
    headline = m('prostate.discussHeadline');
    details.push(m('prostate.age55to72'), m('prostate.counselling'));
  } else {
    status = 'discuss';
    headline = m('prostate.over72Headline');
    details.push(m('prostate.over72'));
  }
  if (psa.length) {
    details.push(...psa);
    if (psaHigh) {
      status = 'specialist';
      headline = m('prostate.referHeadline');
    }
  } else if (status === 'discuss') {
    details.push(m('prostate.interval'));
  }
  return { ...base, status, headline, details, international: intl };
}

export function cervical(a: Answers): Recommendation {
  const base = { cancer: 'cervical' as const, krgBased: true, sources: ['krg2023', 'who_cervical2021', 'iarc', 'nhs', 'uspstf_cervical2018'] as Recommendation['sources'] };
  const age = a.age ?? 0;
  const intl = [m('cervical.intl')];
  if (a.sex !== 'female') return { ...base, status: 'notApplicable', headline: m('cervical.na'), details: [] };
  if (a.totalHysterectomy) {
    return { ...base, status: 'notRecommended', headline: m('cervical.hysterectomy'), details: [m('cervical.hysterectomyDetail')], international: intl };
  }
  if (a.previousAbnormalCervical) {
    return { ...base, status: 'specialist', headline: m('cervical.abnormalHeadline'), details: [m('cervical.abnormal')], international: intl };
  }
  if (a.sexuallyActive === 'no') {
    return { ...base, status: 'notYet', headline: m('cervical.notYet'), details: [m('cervical.notActive')], international: intl };
  }
  const details: Msg[] = [];
  if (a.immunocompromised) details.push(m('cervical.immuno'));
  if (age < 30) {
    details.unshift(m('cervical.under30'));
    details.push(m('cervical.unscheduled'));
    return { ...base, status: 'discuss', headline: m('cervical.discussHeadline'), details, international: intl };
  }
  if (age <= 49) {
    details.unshift(m('cervical.methods'));
    details.push(m('cervical.unscheduled'));
    return { ...base, status: 'recommended', headline: m('cervical.headline'), details, international: intl };
  }
  if (age <= 69) {
    details.unshift(m('cervical.methods50'));
    details.push(m('cervical.unscheduled'));
    return { ...base, status: 'recommended', headline: m('cervical.headline'), details, international: intl };
  }
  if (a.previousNegativeScreensAfter65) {
    details.unshift(m('cervical.over69Stop'));
    return { ...base, status: 'notRecommended', headline: m('cervical.over69StopHeadline'), details, international: intl };
  }
  details.unshift(m('cervical.over69'));
  return { ...base, status: 'discuss', headline: m('cervical.over69Headline'), details, international: intl };
}

/** Age at which colonoscopy starts for KRG high-risk family history. */
export function crcHighRiskStart(a: Answers): number {
  return a.youngestDxAge != null && a.youngestDxAge - 10 < 40 ? Math.max(a.youngestDxAge - 10, 18) : 40;
}

export function colorectal(a: Answers): Recommendation {
  const base = { cancer: 'colorectal' as const, krgBased: true, sources: ['krg2023', 'iarc', 'nhs', 'uspstf_crc2021', 'usmstf_crc2017'] as Recommendation['sources'] };
  const age = a.age ?? 0;
  const intl = [m('crc.intl')];
  if (a.personalPolypsOrCrc || a.ibd || a.lynchSyndrome) {
    const details: Msg[] = [m('crc.highRiskConditions')];
    if (a.personalPolypsOrCrc) details.push(m('crc.polyps'));
    return { ...base, status: 'specialist', headline: m('crc.specialistHeadline'), details, international: intl };
  }
  if (a.limitedLifeExpectancy) {
    return { ...base, status: 'notRecommended', headline: m('crc.notRecommended'), details: [m('crc.lifeExpectancy')], international: intl };
  }
  const high = a.crcFamily === 'fdrUnder60' || a.crcFamily === 'twoFdr';
  const moderate = a.crcFamily === 'fdr60plus' || a.crcFamily === 'twoSdr';
  if (high || moderate) {
    const start = high ? crcHighRiskStart(a) : 40;
    const details: Msg[] = [m(high ? 'crc.high' : 'crc.moderate', { start })];
    if (age < start) {
      details.push(m('crc.notYetFamily', { start }));
      return { ...base, status: 'notYet', headline: m('crc.notYet'), details, international: intl };
    }
    if (age > 75) {
      details.push(m('crc.age76to85'));
      return { ...base, status: 'discuss', headline: m('crc.discussHeadline'), details, international: intl };
    }
    return { ...base, status: 'recommended', headline: m(high ? 'crc.highHeadline' : 'crc.moderateHeadline', { start }), details, international: intl };
  }
  if (age < 45) {
    return { ...base, status: 'notYet', headline: m('crc.notYet'), details: [m('crc.start')], international: intl };
  }
  if (age <= 75) {
    return { ...base, status: 'recommended', headline: m('crc.headline'), details: [m('crc.options')], international: intl };
  }
  if (age <= 85) {
    return { ...base, status: 'discuss', headline: m('crc.discussHeadline'), details: [m('crc.age76to85')], international: intl };
  }
  return { ...base, status: 'notRecommended', headline: m('crc.notRecommended'), details: [m('crc.over85')], international: intl };
}

export function assess(a: Answers): Assessment {
  return {
    urgentSeeDoctor: a.symptoms,
    packYears: packYears(a),
    recommendations: [breast(a), cervical(a), colorectal(a), lung(a), prostate(a)],
  };
}
