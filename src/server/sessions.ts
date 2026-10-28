import { z } from "zod";
import { characterById, topicById, venueById } from "@/domain/catalog";
import { checkFreeSession } from "@/domain/eligibility";
import { quoteSession, type Entitlements } from "@/domain/pricing";
import type { Locale } from "@/domain/types";
import type { ConversationContext, Turn } from "./ai/types";
import type { SessionRecord, UserRecord } from "./store";

export const SessionRequestZ = z.object({
  venueId: z.string(),
  characterIds: z.array(z.string()).min(1).max(4),
  type: z.enum(["private", "group", "learning", "social"]),
  durationMin: z.number().int(),
  topicId: z.string().optional(),
  customTopic: z.string().max(140).optional(),
  locale: z.enum(["ar", "en"]).default("ar"),
});
export type SessionRequestBody = z.infer<typeof SessionRequestZ>;

export function entitlementsFor(user: UserRecord): Entitlements {
  const free = checkFreeSession({
    freeSessionUsed: user.freeSessionUsed,
    contactVerified: user.contactVerified,
    signedUpAt: user.createdAt,
    region: user.region,
    deviceAlreadyUsed: false,
  });
  return { plan: user.plan, minutesLeft: user.minutesLeft, freeSessionEligible: free.eligible };
}

export function quoteFor(user: UserRecord, body: SessionRequestBody) {
  return quoteSession(
    { venueId: body.venueId, characterIds: body.characterIds, type: body.type, durationMin: body.durationMin },
    entitlementsFor(user),
    user.currency,
  );
}

export function topicText(body: SessionRequestBody, locale: Locale): string {
  const custom = body.customTopic?.trim();
  if (custom) return custom;
  const t = body.topicId ? topicById(body.topicId) : undefined;
  return t ? t.label[locale] : locale === "ar" ? "دردشة مفتوحة" : "Open conversation";
}

export function contextFor(session: SessionRecord, user: UserRecord): ConversationContext {
  return {
    locale: session.locale,
    venue: venueById(session.venueId)!,
    topic: session.topic,
    type: session.type,
    userName: user.name || (session.locale === "ar" ? "صاحبي" : "friend"),
    characters: session.characterIds.map((id) => characterById(id)!).filter(Boolean),
    mutedIds: session.mutedIds,
    history: session.turns,
  };
}

/** Opening lines: every character discloses it is AI before anything else is said. */
export function openingTurns(session: SessionRecord, userName: string): Turn[] {
  const [first, second] = session.characterIds.map((id) => characterById(id)!);
  const turns: Turn[] = [{ speaker: first.id, text: first.greeting[session.locale].replace("{name}", userName), emotion: "joy" }];
  if (second) {
    turns.push({
      speaker: second.id,
      emotion: "joy",
      text:
        session.locale === "ar"
          ? `وأنا ${second.name.ar}، ${second.role.ar}، وبرضه ذكاء اصطناعي. موضوعنا النهارده: «${session.topic}».`
          : `And I'm ${second.name.en}, ${second.role.en.toLowerCase()}, also AI. Today's topic: "${session.topic}".`,
    });
  }
  return turns;
}
