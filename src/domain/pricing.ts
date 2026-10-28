import { FREE_INTRO, PASS, characterById, planById, venueById } from "./catalog";
import type { Currency, Money, PlanId, SessionType } from "./types";

export interface SessionRequest {
  venueId: string;
  characterIds: string[];
  type: SessionType;
  durationMin: number;
}

export interface Entitlements {
  plan: PlanId;
  minutesLeft: number;
  freeSessionEligible: boolean;
}

export type Quote =
  | { kind: "free_intro"; total: Money; minutes: number }
  | { kind: "subscription"; total: Money; minutes: number; minutesLeftAfter: number }
  | { kind: "pay"; total: Money; passes: number; minutes: number; reason: PayReason }
  | { kind: "invalid"; reason: InvalidReason };

export type PayReason = "no_plan" | "premium_content" | "too_many_characters" | "out_of_minutes" | "too_long_for_free";
export type InvalidReason = "unknown_venue" | "unknown_character" | "no_characters" | "group_needs_two" | "bad_duration" | "over_plan_limit";

export const DURATIONS = [15, 30, 45, 60] as const;

/**
 * Decide how a session is paid for, before the user enters. Pure function: the same
 * inputs always give the same quote, and the server re-runs it when the session starts.
 */
export function quoteSession(req: SessionRequest, ent: Entitlements, currency: Currency): Quote {
  const venue = venueById(req.venueId);
  if (!venue) return { kind: "invalid", reason: "unknown_venue" };
  if (req.characterIds.length === 0) return { kind: "invalid", reason: "no_characters" };
  const chars = req.characterIds.map(characterById);
  if (chars.some((c) => !c)) return { kind: "invalid", reason: "unknown_character" };
  if (req.type === "group" && req.characterIds.length < 2) return { kind: "invalid", reason: "group_needs_two" };
  if (!(DURATIONS as readonly number[]).includes(req.durationMin)) return { kind: "invalid", reason: "bad_duration" };

  const plan = planById(ent.plan)!;
  const premium = venue.access === "premium" || chars.some((c) => c!.premium);
  const zero = { amount: 0, currency };

  if (ent.plan !== "free") {
    if (req.characterIds.length > plan.maxCharacters) return { kind: "invalid", reason: "over_plan_limit" };
    if (ent.minutesLeft >= req.durationMin) {
      return { kind: "subscription", total: zero, minutes: req.durationMin, minutesLeftAfter: ent.minutesLeft - req.durationMin };
    }
    return payQuote(req, currency, "out_of_minutes");
  }

  if (ent.freeSessionEligible) {
    if (premium) return payQuote(req, currency, "premium_content");
    if (req.characterIds.length > FREE_INTRO.maxCharacters) return payQuote(req, currency, "too_many_characters");
    if (req.durationMin > FREE_INTRO.minutes) return payQuote(req, currency, "too_long_for_free");
    return { kind: "free_intro", total: zero, minutes: req.durationMin };
  }
  return payQuote(req, currency, premium ? "premium_content" : "no_plan");
}

function payQuote(req: SessionRequest, currency: Currency, reason: PayReason): Quote {
  if (req.characterIds.length > PASS.maxCharacters) return { kind: "invalid", reason: "over_plan_limit" };
  const passes = Math.ceil(req.durationMin / PASS.minutes);
  return { kind: "pay", total: { amount: PASS.price[currency] * passes, currency }, passes, minutes: req.durationMin, reason };
}
