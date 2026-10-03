export type Sex = 'female' | 'male';
export type YesNoUnknown = 'yes' | 'no' | 'unknown';
export type SmokingStatus = 'never' | 'current' | 'former';

export interface Answers {
  age: number | null;
  sex: Sex | null;
  /** Any current symptom that could be cancer (lump, bleeding, persistent cough...). Screening is for people WITHOUT symptoms. */
  symptoms: boolean;
  /** Serious illness that would make curative treatment impossible / life expectancy < 10 years */
  limitedLifeExpectancy: boolean;

  // Breast
  personalBreastCancer: boolean;
  familyBreastOvarian: boolean; // first-degree relative or multiple relatives, or male relative with breast cancer
  geneticMutation: boolean; // BRCA1/2 or other known pathogenic variant (self or relative)
  chestRadiation10to30: boolean;
  highRiskBreastLesion: boolean; // ADH, LCIS, ALH on previous biopsy
  lifetimeRisk20: YesNoUnknown; // clinician-estimated residual lifetime risk >= 20%
  gail5yr17: YesNoUnknown; // Gail model 5-year risk >= 1.7%

  // Lung
  smoking: SmokingStatus;
  cigarettesPerDay: number | null;
  smokingYears: number | null;
  yearsSinceQuit: number | null;
  occupationalExposure: boolean;
  copdOrTb: boolean;
  personalLungCancer: boolean;
  tammemagi2: YesNoUnknown; // Tammemagi PLCOm2012 6-year risk > 2%

  // Prostate
  familyProstateOrOther: boolean;
  africanAncestry: boolean;
  lynchSyndrome: boolean;
  psaValue: number | null;
  dreResult: 'normal' | 'abnormal' | 'notDone';

  // Cervical
  totalHysterectomy: boolean;
  immunocompromised: boolean; // incl. HIV
  previousAbnormalCervical: boolean;
  previousNegativeScreensAfter65: boolean;
  sexuallyActive: YesNoUnknown; // married or ever sexually active

  // Colorectal
  /** KRG risk strata by family history of CRC / advanced adenoma */
  crcFamily: 'none' | 'fdr60plus' | 'fdrUnder60' | 'twoFdr' | 'twoSdr';
  youngestDxAge: number | null;
  ibd: boolean;
  personalPolypsOrCrc: boolean;
}

export const emptyAnswers: Answers = {
  age: null,
  sex: null,
  symptoms: false,
  limitedLifeExpectancy: false,
  personalBreastCancer: false,
  familyBreastOvarian: false,
  geneticMutation: false,
  chestRadiation10to30: false,
  highRiskBreastLesion: false,
  lifetimeRisk20: 'unknown',
  gail5yr17: 'unknown',
  smoking: 'never',
  cigarettesPerDay: null,
  smokingYears: null,
  yearsSinceQuit: null,
  occupationalExposure: false,
  copdOrTb: false,
  personalLungCancer: false,
  tammemagi2: 'unknown',
  familyProstateOrOther: false,
  africanAncestry: false,
  lynchSyndrome: false,
  psaValue: null,
  dreResult: 'notDone',
  totalHysterectomy: false,
  immunocompromised: false,
  previousAbnormalCervical: false,
  previousNegativeScreensAfter65: false,
  sexuallyActive: 'unknown',
  crcFamily: 'none',
  youngestDxAge: null,
  ibd: false,
  personalPolypsOrCrc: false,
};

export type CancerId = 'breast' | 'lung' | 'prostate' | 'cervical' | 'colorectal';

/**
 * recommended: screening is due/recommended
 * discuss: shared decision with a doctor (benefits and harms)
 * specialist: higher than average risk, needs specialist assessment / surveillance rather than routine screening
 * notYet: below the starting age
 * notRecommended: screening not recommended for this person
 * notApplicable: does not apply (e.g. sex)
 */
export type Status = 'recommended' | 'discuss' | 'specialist' | 'notYet' | 'notRecommended' | 'notApplicable';

/** A translatable message: key into the dictionary plus interpolation params. */
export interface Msg {
  key: string;
  params?: Record<string, string | number>;
}

export type SourceId =
  | 'krg2023'
  | 'who_cervical2021'
  | 'who_breast'
  | 'iarc'
  | 'uspstf_breast2024'
  | 'uspstf_crc2021'
  | 'uspstf_lung2021'
  | 'uspstf_prostate2018'
  | 'uspstf_cervical2018'
  | 'nhs'
  | 'cdc'
  | 'acr_lungrads2022'
  | 'usmstf_crc2017'
  | 'nccn_breast';

export interface Recommendation {
  cancer: CancerId;
  status: Status;
  /** true when the rule comes from the KRG MOH 2023 guideline; false when from international evidence because KRG text is not available */
  krgBased: boolean;
  headline: Msg;
  details: Msg[];
  /** International comparison shown alongside, for transparency */
  international?: Msg[];
  sources: SourceId[];
}

export interface Assessment {
  urgentSeeDoctor: boolean;
  recommendations: Recommendation[];
  packYears: number | null;
}
