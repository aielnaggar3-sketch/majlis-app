// First-line input screening that runs before any model call. The model-side rules in
// prompt.ts and a moderation classifier (Phase 1, week 6) sit behind this.

export const MAX_UTTERANCE_CHARS = 1200;

const CRISIS_PATTERNS = [
  /\b(kill myself|suicide|end my life|self[- ]harm)\b/i,
  /(انتحر|هموت نفسي|أموت نفسي|عايز أموت|عاوز أموت|أأذي نفسي)/,
];

export type Screen = { ok: true; text: string; crisis: boolean } | { ok: false; reason: "empty" | "too_long" };

export function screenUserText(raw: string): Screen {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return { ok: false, reason: "empty" };
  if (text.length > MAX_UTTERANCE_CHARS) return { ok: false, reason: "too_long" };
  return { ok: true, text, crisis: CRISIS_PATTERNS.some((p) => p.test(text)) };
}
