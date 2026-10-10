import { describe, expect, it } from 'vitest';
import { buildRecord, normalizeServerLink } from './server';
import { assess } from './engine/rules';
import { emptyAnswers } from './engine/types';

describe('server link', () => {
  it('accepts http(s) links and empty, rejects others', () => {
    expect(normalizeServerLink('  https://moh.example/api ')).toBe('https://moh.example/api');
    expect(normalizeServerLink('')).toBe('');
    expect(normalizeServerLink('ftp://x.org')).toBeNull();
    expect(normalizeServerLink('not a link')).toBeNull();
  });
  it('builds an anonymous record', () => {
    const a = { ...emptyAnswers, age: 50, sex: 'female' as const };
    const r = buildRecord(a, assess(a), 'ckb');
    expect(r.language).toBe('ckb');
    expect(r.results).toHaveLength(5);
    expect(Object.keys(r.answers)).not.toContain('name');
  });
});
