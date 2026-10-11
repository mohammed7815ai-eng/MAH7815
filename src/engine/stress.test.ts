import { describe, expect, it } from 'vitest';
import { assess } from './rules';
import { sanitizeAnswers } from '../answerStore';
import { emptyAnswers, type Answers } from './types';

// Simulates many different people using the tool: random (including extreme and damaged) answers
// must never crash the guideline engine or produce an invalid result.
// Default run: 20,000 people. Full run: STRESS=1000000 npx vitest run src/engine/stress.test.ts
const N = Number(process.env.STRESS ?? 20000);
const STATUSES = new Set(['recommended', 'discuss', 'specialist', 'notYet', 'notRecommended', 'notApplicable']);

let seed = 12345;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)];
const num = (max: number) => (rnd() < 0.15 ? null : Math.round(rnd() * max * 10) / 10);

function randomPerson(): Answers {
  const raw: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(emptyAnswers)) {
    if (typeof v === 'boolean') raw[k] = rnd() < 0.2;
  }
  Object.assign(raw, {
    age: rnd() < 0.02 ? pick([-5, 0, 17, 101, 999, NaN, 'abc']) : 18 + Math.floor(rnd() * 83),
    sex: pick(['female', 'male']),
    smoking: pick(['never', 'current', 'former']),
    cigarettesPerDay: num(80), smokingYears: num(70), yearsSinceQuit: num(60),
    psaValue: rnd() < 0.5 ? null : num(50),
    dreResult: pick(['normal', 'abnormal', 'notDone']),
    crcFamily: pick(['none', 'fdr60plus', 'fdrUnder60', 'twoFdr', 'twoSdr']),
    youngestDxAge: num(90),
    lifetimeRisk20: pick(['yes', 'no', 'unknown']), gail5yr17: pick(['yes', 'no', 'unknown']),
    tammemagi2: pick(['yes', 'no', 'unknown']), sexuallyActive: pick(['yes', 'no', 'unknown']),
  });
  return sanitizeAnswers(raw);
}

describe(`stability with ${N.toLocaleString('en')} simulated users`, () => {
  it('every assessment completes with valid results', () => {
    const t0 = performance.now();
    let checked = 0;
    for (let i = 0; i < N; i++) {
      const a = randomPerson();
      if (a.age == null || a.sex == null) continue;
      const r = assess(a);
      if (r.recommendations.length !== 5 || !r.recommendations.every((x) => STATUSES.has(x.status) && x.headline?.key)) {
        throw new Error(`invalid result for ${JSON.stringify(a)}`);
      }
      checked++;
    }
    const ms = performance.now() - t0;
    console.log(`${checked.toLocaleString('en')} assessments in ${(ms / 1000).toFixed(1)} s (${Math.round((checked / ms) * 1000).toLocaleString('en')} per second, ${((ms / checked) * 1000).toFixed(1)} µs each)`);
    expect(checked).toBeGreaterThan(N * 0.9);
  }, 600_000);
});
