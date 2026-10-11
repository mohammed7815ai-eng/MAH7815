// Saved questionnaire answers: encrypted at rest, validated on load.
import { emptyAnswers, type Answers } from './engine/types';
import { decryptJSON, deviceKey, encryptJSON, secureStorageAvailable } from './secureStore';

const ENC_KEY = 'answers.enc';
const LEGACY_KEY = 'answers'; // plain-text storage used before v1.6.0

const NUMBER_FIELDS = ['age', 'cigarettesPerDay', 'smokingYears', 'yearsSinceQuit', 'psaValue', 'youngestDxAge'] as const;
const ENUMS: Partial<Record<keyof Answers, readonly unknown[]>> = {
  sex: [null, 'female', 'male'],
  smoking: ['never', 'current', 'former'],
  dreResult: ['normal', 'abnormal', 'notDone'],
  crcFamily: ['none', 'fdr60plus', 'fdrUnder60', 'twoFdr', 'twoSdr'],
  lifetimeRisk20: ['yes', 'no', 'unknown'],
  gail5yr17: ['yes', 'no', 'unknown'],
  tammemagi2: ['yes', 'no', 'unknown'],
  sexuallyActive: ['yes', 'no', 'unknown'],
};

/** Keeps only well-formed values; anything damaged or tampered with falls back to the default. */
export function sanitizeAnswers(raw: unknown): Answers {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const out: Record<string, unknown> = { ...emptyAnswers };
  for (const [k, def] of Object.entries(emptyAnswers)) {
    const v = src[k];
    if (v === undefined) continue;
    if ((NUMBER_FIELDS as readonly string[]).includes(k)) {
      out[k] = v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1000) ? v : null;
    } else if (k in ENUMS) {
      if (ENUMS[k as keyof Answers]!.includes(v)) out[k] = v;
    } else if (typeof def === 'boolean') {
      if (typeof v === 'boolean') out[k] = v;
    } else if (k === 'noneOfAbove') {
      if (v && typeof v === 'object') out[k] = Object.fromEntries(Object.entries(v).filter(([, b]) => typeof b === 'boolean'));
    }
  }
  return out as unknown as Answers;
}

export async function loadAnswers(): Promise<Answers> {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy != null) {
      localStorage.removeItem(LEGACY_KEY);
      const a = sanitizeAnswers(JSON.parse(legacy));
      await saveAnswers(a);
      return a;
    }
    const enc = localStorage.getItem(ENC_KEY);
    if (!enc || !secureStorageAvailable()) return emptyAnswers;
    return sanitizeAnswers(await decryptJSON(await deviceKey(), enc));
  } catch {
    return emptyAnswers;
  }
}

let queue: Promise<void> = Promise.resolve();

/** Saves in order; when encryption is not available the answers are simply not kept. */
export function saveAnswers(a: Answers): Promise<void> {
  queue = queue.then(async () => {
    try {
      if (!secureStorageAvailable()) return;
      localStorage.setItem(ENC_KEY, await encryptJSON(await deviceKey(), a));
    } catch {
      /* storage full or blocked: keep working without saving */
    }
  });
  return queue;
}

export function clearSavedAnswers(): void {
  try {
    localStorage.removeItem(ENC_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}
