import { describe, expect, it } from 'vitest';
import { shareLinks } from './Footer';

describe('share buttons', () => {
  it('fill in the message and link for each app', () => {
    const links = shareLinks('اعرف فحوصاتك', 'https://example.org/iraq/', 'Guide');
    expect(links.map((l) => l.id)).toEqual(['whatsapp', 'telegram', 'facebook', 'viber', 'email']);
    for (const l of links) expect(decodeURIComponent(l.href)).toContain('https://example.org/iraq/');
    expect(links[0].href.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(links[0].href)).toContain('اعرف فحوصاتك');
  });
});
