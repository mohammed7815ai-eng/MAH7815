import Anthropic from '@anthropic-ai/sdk';

export const MODELS = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
] as const;

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

/**
 * Streams one assistant reply. The API key never leaves the device except in
 * the request to api.anthropic.com.
 */
export async function streamReply(opts: {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatTurn[];
  onText: (fullText: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const client = new Anthropic({ apiKey: opts.apiKey, dangerouslyAllowBrowser: true });
  const supportsFallbacks = opts.model !== 'claude-haiku-4-5';

  const params: Record<string, unknown> = {
    model: opts.model,
    max_tokens: 4000,
    system: opts.system,
    messages: opts.messages,
  };
  if (supportsFallbacks) {
    // Re-run a safety-declined request on Anthropic's recommended fallback model.
    params.betas = ['server-side-fallback-2026-07-01'];
    params.fallbacks = 'default';
    // Patient-facing Q&A: medium effort balances care and response time.
    params.output_config = { effort: 'medium' };
  }

  let text = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = (client.beta.messages as any).stream(params, { signal: opts.signal });
  stream.on('text', (delta: string) => {
    text += delta;
    opts.onText(text);
  });
  const final = await stream.finalMessage();
  if (final.stop_reason === 'refusal' && !text) {
    throw new Error('The request was declined. Please rephrase your question.');
  }
  return text;
}
