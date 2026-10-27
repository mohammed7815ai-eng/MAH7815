import { describe, expect, it } from 'vitest';
import { editionDicts } from './index';

// Words that must not appear anywhere in the Iraq edition (English and Arabic).
export const FORBIDDEN = /kurd|krg|erbil|duhok|sulaymaniyah|کورد|كورد|كرد|إقليم|الإقليم|حكومة الإقليم/i;

describe('Iraq edition wording', () => {
  const iraq = editionDicts(true);
  it('keeps the Kurdistan edition unchanged', () => {
    expect(editionDicts(false).en['app.subtitle']).toMatch(/Kurdistan/);
  });
  it('has no Kurdistan or Kurdish terms in its general texts', () => {
    for (const lang of ['en', 'ar'] as const) {
      for (const k of ['app.subtitle', 'form.intro', 'results.krg', 'results.footer', 'about.body', 'about.translation', 'share.text', 'tr.review'] as const) {
        expect(iraq[lang][k], `${lang}:${k}`).not.toMatch(FORBIDDEN);
      }
    }
  });
});
