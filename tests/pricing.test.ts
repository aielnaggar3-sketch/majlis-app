import { describe, expect, it } from "vitest";
import { quoteSession, type Entitlements } from "@/domain/pricing";

const freeNew: Entitlements = { plan: "free", minutesLeft: 0, freeSessionEligible: true };
const freeUsed: Entitlements = { plan: "free", minutesLeft: 0, freeSessionEligible: false };
const plus: Entitlements = { plan: "plus", minutesLeft: 40, freeSessionEligible: false };
const base = { venueId: "nile", characterIds: ["layla"], type: "private" as const, durationMin: 15 };

describe("quoteSession", () => {
  it("gives a new user the free intro in a free venue", () => {
    expect(quoteSession(base, freeNew, "EGP")).toEqual({ kind: "free_intro", total: { amount: 0, currency: "EGP" }, minutes: 15 });
  });

  it("charges for premium content even when the free intro is unused", () => {
    const q = quoteSession({ ...base, venueId: "loft", characterIds: ["hassan"] }, freeNew, "EGP");
    expect(q).toMatchObject({ kind: "pay", reason: "premium_content", total: { amount: 7900, currency: "EGP" } });
    expect(quoteSession({ ...base, characterIds: ["karim"] }, freeNew, "USD")).toMatchObject({ kind: "pay", reason: "premium_content" });
  });

  it("enforces the free intro limits", () => {
    expect(quoteSession({ ...base, durationMin: 30 }, freeNew, "EGP")).toMatchObject({ kind: "pay", reason: "too_long_for_free" });
    expect(quoteSession({ ...base, characterIds: ["layla", "hassan", "mariam"] }, freeNew, "EGP")).toMatchObject({ kind: "pay", reason: "too_many_characters" });
  });

  it("prices pay-per-session in whole passes", () => {
    expect(quoteSession({ ...base, durationMin: 45 }, freeUsed, "EGP")).toMatchObject({ kind: "pay", reason: "no_plan", passes: 2, total: { amount: 15800 } });
    expect(quoteSession({ ...base, durationMin: 60 }, freeUsed, "USD")).toMatchObject({ passes: 2, total: { amount: 598, currency: "USD" } });
  });

  it("draws subscription minutes and falls back to paying when they run out", () => {
    expect(quoteSession({ ...base, durationMin: 30 }, plus, "EGP")).toMatchObject({ kind: "subscription", minutesLeftAfter: 10 });
    expect(quoteSession({ ...base, durationMin: 45 }, plus, "EGP")).toMatchObject({ kind: "pay", reason: "out_of_minutes" });
  });

  it("rejects malformed requests", () => {
    expect(quoteSession({ ...base, venueId: "nowhere" }, freeNew, "EGP")).toEqual({ kind: "invalid", reason: "unknown_venue" });
    expect(quoteSession({ ...base, characterIds: [] }, freeNew, "EGP")).toEqual({ kind: "invalid", reason: "no_characters" });
    expect(quoteSession({ ...base, characterIds: ["ghost"] }, freeNew, "EGP")).toEqual({ kind: "invalid", reason: "unknown_character" });
    expect(quoteSession({ ...base, type: "group" }, freeNew, "EGP")).toEqual({ kind: "invalid", reason: "group_needs_two" });
    expect(quoteSession({ ...base, durationMin: 20 }, freeNew, "EGP")).toEqual({ kind: "invalid", reason: "bad_duration" });
    expect(quoteSession({ ...base, characterIds: ["layla", "hassan", "mariam", "dina", "yusuf"] }, plus, "EGP")).toEqual({ kind: "invalid", reason: "over_plan_limit" });
  });
});
