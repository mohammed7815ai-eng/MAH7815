// Two editions are built from this code:
//   krg   Kurdistan Region edition (KRG MOH 2023 guideline), five languages, Kurdistan flag
//   iraq  Iraq national edition (Iraqi MOH national guideline), Arabic and English, Iraqi flag
// Select with the EDITION environment variable at build time (default krg).
export type Edition = 'krg' | 'iraq';
export const EDITION: Edition = __EDITION__;
export const IS_IRAQ = EDITION === 'iraq';

/** Public address of this edition's website, used by the share button (set at build time, see vite.config.ts). */
export const SHARE_URL: string = __SITE_URL__;
