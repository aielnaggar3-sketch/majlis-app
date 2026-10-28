import { randomInt } from "node:crypto";

export type CouponStatus = "claimed" | "redeemed" | "expired";

export interface Coupon {
  code: string;
  offerId: string;
  venueId: string;
  userId: string;
  status: CouponStatus;
  claimedAt: Date;
  expiresAt: Date;
  redeemedAt?: Date;
  redeemedBy?: string;
}

// No 0/O or 1/I so codes read cleanly aloud and on a phone screen.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateCouponCode(rand: (max: number) => number = randomInt): string {
  const block = () => Array.from({ length: 4 }, () => ALPHABET[rand(ALPHABET.length)]).join("");
  return `MJL-${block()}-${block()}`;
}

export function normaliseCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function issueCoupon(args: { offerId: string; venueId: string; userId: string; validDays: number; now?: Date; code?: string }): Coupon {
  const now = args.now ?? new Date();
  return {
    code: args.code ?? generateCouponCode(),
    offerId: args.offerId,
    venueId: args.venueId,
    userId: args.userId,
    status: "claimed",
    claimedAt: now,
    expiresAt: new Date(now.getTime() + args.validDays * 86_400_000),
  };
}

export type RedeemResult =
  | { ok: true; coupon: Coupon }
  | { ok: false; reason: "not_found" | "already_redeemed" | "expired" | "wrong_partner" };

/**
 * Only a partner confirmation moves a coupon to "redeemed"; the consumer app never does.
 * `partnerVenueIds` are the venues the confirming partner account owns.
 */
export function redeemCoupon(coupon: Coupon | undefined, partnerVenueIds: string[], partnerUserId: string, now = new Date()): RedeemResult {
  if (!coupon) return { ok: false, reason: "not_found" };
  if (!partnerVenueIds.includes(coupon.venueId)) return { ok: false, reason: "wrong_partner" };
  if (coupon.status === "redeemed") return { ok: false, reason: "already_redeemed" };
  if (coupon.status === "expired" || now > coupon.expiresAt) return { ok: false, reason: "expired" };
  return { ok: true, coupon: { ...coupon, status: "redeemed", redeemedAt: now, redeemedBy: partnerUserId } };
}
