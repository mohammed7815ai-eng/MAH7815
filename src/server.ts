// Optional reporting server: when a link is saved in Settings, each completed
// assessment is sent there as one anonymous JSON record (no name, phone or ID).
import type { Answers, Assessment } from './engine/types';

const KEY = 'serverLink';

export function getServerLink(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

/** Returns the cleaned link, or null when it is not a valid http(s) URL. */
export function normalizeServerLink(raw: string): string | null {
  const s = raw.trim();
  if (s === '') return '';
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

export function saveServerLink(link: string): void {
  try {
    if (link) localStorage.setItem(KEY, link);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

export function buildRecord(answers: Answers, assessment: Assessment, language: string) {
  return {
    app: 'cancer-screening-guide',
    version: __APP_VERSION__,
    language,
    submittedAt: new Date().toISOString(),
    answers,
    urgentSeeDoctor: assessment.urgentSeeDoctor,
    packYears: assessment.packYears,
    results: assessment.recommendations.map((r) => ({ cancer: r.cancer, status: r.status, krgBased: r.krgBased })),
  };
}

export type SendStatus = 'sending' | 'sent' | 'failed';

export async function sendAssessment(link: string, answers: Answers, assessment: Assessment, language: string): Promise<SendStatus> {
  try {
    const res = await fetch(link, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildRecord(answers, assessment, language)),
    });
    return res.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}
