import { beforeEach, describe, expect, it } from "vitest";
import { issueCoupon } from "@/domain/coupons";
import { getStore, resetStoreForTests } from "@/server/store";
import { openingTurns } from "@/server/sessions";

beforeEach(() => resetStoreForTests());

describe("memory store and session opening", () => {
  it("creates a session whose opening lines disclose AI", async () => {
    const store = getStore();
    const user = await store.createUser({});
    const s = await store.createSession({
      userId: user.id, venueId: "nile", topic: "قهوة", type: "group", locale: "ar",
      characterIds: ["layla", "hassan"], durationMin: 15, quote: { kind: "free_intro", total: { amount: 0, currency: "EGP" }, minutes: 15 },
    });
    expect(s.status).toBe("active");
    const turns = openingTurns(s, "Medo");
    expect(turns.map((t) => t.speaker)).toEqual(["layla", "hassan"]);
    expect(turns[0].text).toContain("Medo");
    expect(turns[1].text).toContain("ذكاء اصطناعي");
  });

  it("keeps coupons per user", async () => {
    const store = getStore();
    await store.saveCoupon(issueCoupon({ offerId: "of1", venueId: "roastery", userId: "a", validDays: 14 }));
    expect(await store.listCoupons("a")).toHaveLength(1);
    expect(await store.listCoupons("b")).toHaveLength(0);
  });
});
