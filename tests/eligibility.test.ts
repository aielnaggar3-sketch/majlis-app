import { describe, expect, it } from "vitest";
import { DEFAULT_FREE_RULES, checkFreeSession } from "@/domain/eligibility";

const now = new Date("2026-10-28T12:00:00Z");
const ok = { freeSessionUsed: false, contactVerified: true, signedUpAt: new Date("2026-10-27T12:00:00Z"), region: "EG", deviceAlreadyUsed: false, now };

describe("checkFreeSession", () => {
  it("allows a fresh verified account", () => {
    expect(checkFreeSession(ok)).toEqual({ eligible: true });
  });

  it.each([
    [{ freeSessionUsed: true }, "already_used"],
    [{ contactVerified: false }, "unverified"],
    [{ email: "x@Mailinator.com" }, "disposable_email"],
    [{ deviceAlreadyUsed: true }, "device_used"],
    [{ signedUpAt: new Date("2026-10-01T00:00:00Z") }, "expired"],
  ])("blocks %o as %s", (patch, reason) => {
    expect(checkFreeSession({ ...ok, ...patch })).toEqual({ eligible: false, reason });
  });

  it("applies region allow-lists case-insensitively", () => {
    const rules = { ...DEFAULT_FREE_RULES, allowedRegions: ["EG", "SA"] };
    expect(checkFreeSession({ ...ok, region: "eg" }, rules)).toEqual({ eligible: true });
    expect(checkFreeSession({ ...ok, region: "US" }, rules)).toEqual({ eligible: false, reason: "region" });
  });

  it("treats expiresAfterDays = 0 as no expiry", () => {
    expect(checkFreeSession({ ...ok, signedUpAt: new Date("2020-01-01") }, { ...DEFAULT_FREE_RULES, expiresAfterDays: 0 })).toEqual({ eligible: true });
  });
});
