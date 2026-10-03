import { crcHighRiskStart } from './rules';
import type { Answers, Assessment, Recommendation } from './types';

/** One row of the "screening ages" chart: the age range in which a screening applies. */
export interface ScreeningWindow {
  cancer: Recommendation['cancer'];
  from: number;
  to: number;
  /** false: the range only applies if the person meets risk criteria they don't currently meet. */
  applies: boolean;
  status: Recommendation['status'];
}

export const CHART_MIN_AGE = 20;
export const CHART_MAX_AGE = 90;

/** Age ranges from the KRG 2023 rules, personalised from the answers. Cancers that don't apply to this sex are left out. */
export function screeningWindows(a: Answers, assessment: Assessment): ScreeningWindow[] {
  const status = (c: Recommendation['cancer']) => assessment.recommendations.find((r) => r.cancer === c)!.status;
  const rows: ScreeningWindow[] = [];

  if (a.sex === 'female') {
    const breastHigh =
      a.geneticMutation || a.chestRadiation10to30 || a.lifetimeRisk20 === 'yes' || (a.gail5yr17 === 'yes' && (a.age ?? 0) >= 35);
    rows.push({ cancer: 'breast', from: breastHigh ? 30 : 45, to: 69, applies: !a.personalBreastCancer, status: status('breast') });
    rows.push({
      cancer: 'cervical',
      from: 30,
      to: 69,
      applies: !a.totalHysterectomy && a.sexuallyActive !== 'no',
      status: status('cervical'),
    });
  }

  const crcHigh = a.crcFamily === 'fdrUnder60' || a.crcFamily === 'twoFdr';
  const crcModerate = a.crcFamily === 'fdr60plus' || a.crcFamily === 'twoSdr';
  rows.push({
    cancer: 'colorectal',
    from: crcHigh ? crcHighRiskStart(a) : crcModerate ? 40 : 45,
    to: 75,
    applies: !a.limitedLifeExpectancy,
    status: status('colorectal'),
  });

  const lungStatus = status('lung');
  rows.push({ cancer: 'lung', from: 55, to: 70, applies: lungStatus === 'recommended', status: lungStatus });

  if (a.sex === 'male') {
    const risk = a.familyProstateOrOther || a.geneticMutation || a.lynchSyndrome || a.africanAncestry;
    rows.push({ cancer: 'prostate', from: risk ? 45 : 55, to: 72, applies: !a.limitedLifeExpectancy, status: status('prostate') });
  }
  return rows;
}

/** Position of an age on the chart, 0–100 %. */
export function agePercent(age: number): number {
  const clamped = Math.min(CHART_MAX_AGE, Math.max(CHART_MIN_AGE, age));
  return ((clamped - CHART_MIN_AGE) / (CHART_MAX_AGE - CHART_MIN_AGE)) * 100;
}
