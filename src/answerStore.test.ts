import { describe, expect, it } from 'vitest';
import { sanitizeAnswers } from './answerStore';
import { decryptJSON, encryptJSON } from './secureStore';
import { emptyAnswers } from './engine/types';

describe('saved answers', () => {
  it('encrypts and decrypts with AES-GCM; ciphertext hides the answers', async () => {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    const a = { ...emptyAnswers, age: 47, sex: 'female' as const, familyBreastOvarian: true };
    const enc = await encryptJSON(key, a);
    expect(enc).not.toContain('female');
    expect(enc).not.toContain('47');
    expect(await decryptJSON(key, enc)).toEqual(a);
  });
  it('rejects tampered ciphertext', async () => {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    const enc = await encryptJSON(key, { x: 1 });
    const bad = enc.slice(0, -4) + (enc.endsWith('AAAA') ? 'BBBB' : 'AAAA');
    await expect(decryptJSON(key, bad)).rejects.toThrow();
  });
  it('repairs damaged or hostile saved data', () => {
    const a = sanitizeAnswers({ age: 'DROP TABLE', sex: 'robot', symptoms: 'yes', smoking: 'former', psaValue: 1e9, noneOfAbove: { basics: true, breast: 'x' }, __proto__: { evil: 1 } });
    expect(a.age).toBeNull();
    expect(a.sex).toBeNull();
    expect(a.symptoms).toBe(false);
    expect(a.smoking).toBe('former');
    expect(a.psaValue).toBeNull();
    expect(a.noneOfAbove).toEqual({ basics: true });
    expect(sanitizeAnswers(null)).toEqual(emptyAnswers);
    expect(sanitizeAnswers('garbage')).toEqual(emptyAnswers);
  });
});
