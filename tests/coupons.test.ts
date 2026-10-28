import { describe, expect, it } from "vitest";
import { generateCouponCode, issueCoupon, normaliseCode, redeemCoupon } from "@/domain/coupons";

const now = new Date("2026-10-28T12:00:00Z");
const fresh = () => issueCoupon({ offerId: "of1", venueId: "roastery", userId: "u1", validDays: 14, now, code: "MJL-AAAA-BBBB" });

describe("coupons", () => {
  it("generates readable codes without ambiguous characters", () => {
    for (let i = 0; i < 50; i++) expect(generateCouponCode()).toMatch(/^MJL-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  });

  it("normalises codes typed at the counter", () => {
    expect(normaliseCode("  mjl-aaaa- bbbb ")).toBe("MJL-AAAA-BBBB");
  });

  it("issues a claimed coupon with an expiry", () => {
    const c = fresh();
    expect(c.status).toBe("claimed");
    expect(c.expiresAt.toISOString()).toBe("2026-11-11T12:00:00.000Z");
  });

  it("redeems only for the owning partner, once, before expiry", () => {
    expect(redeemCoupon(undefined, ["roastery"], "p1", now)).toEqual({ ok: false, reason: "not_found" });
    expect(redeemCoupon(fresh(), ["other"], "p1", now)).toEqual({ ok: false, reason: "wrong_partner" });
    const r = redeemCoupon(fresh(), ["roastery"], "p1", now);
    expect(r).toMatchObject({ ok: true, coupon: { status: "redeemed", redeemedBy: "p1" } });
    if (r.ok) expect(redeemCoupon(r.coupon, ["roastery"], "p1", now)).toEqual({ ok: false, reason: "already_redeemed" });
    expect(redeemCoupon(fresh(), ["roastery"], "p1", new Date("2026-12-01"))).toEqual({ ok: false, reason: "expired" });
  });
});
