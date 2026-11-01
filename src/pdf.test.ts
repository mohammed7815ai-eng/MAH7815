import { describe, expect, it } from 'vitest';
import { paginate } from './pdf';

describe('PDF pages', () => {
  it('breaks at block edges instead of cutting through text', () => {
    expect(paginate(2500, 1000, { major: [], minor: [300, 900, 1200, 1800, 2400] })).toEqual([[0, 900], [900, 1800], [1800, 2500]]);
  });
  it('keeps a card whole when it can start on the next page', () => {
    expect(paginate(1800, 1000, { major: [700, 1600], minor: [800, 950] })).toEqual([[0, 700], [700, 1600], [1600, 1800]]);
  });
  it('cuts at the page height when no block edge fits', () => {
    expect(paginate(2100, 1000, { major: [], minor: [] })).toEqual([[0, 1000], [1000, 2000], [2000, 2100]]);
  });
  it('makes one page for a short plan', () => {
    expect(paginate(400, 1000, { major: [200], minor: [] })).toEqual([[0, 400]]);
  });
});
