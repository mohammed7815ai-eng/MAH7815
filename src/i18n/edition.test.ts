import { describe, expect, it } from 'vitest';
import { editionDicts } from './index';

// Words that must not appear anywhere in the Iraq edition (English and Arabic).
export const FORBIDDEN = /kurd|krg|erbil|duhok|sulaymaniyah|کورد|كورد|كرد|إقليم|الإقليم|حكومة الإقليم|هەرێم|ھەرێم|ھەرێمێ/i;

describe('Iraq edition wording', () => {
  const iraq = editionDicts(true);
  it('keeps the Kurdistan edition unchanged', () => {
    expect(editionDicts(false).en['app.subtitle']).toMatch(/Kurdistan/);
  });
  it('has no Kurdistan or Kurdish terms in any text', () => {
    for (const lang of ['en', 'ar', 'ckb', 'badini'] as const) {
      for (const [k, v] of Object.entries(iraq[lang])) {
        expect(v, `${lang}:${k}`).not.toMatch(FORBIDDEN);
      }
    }
  });
});
