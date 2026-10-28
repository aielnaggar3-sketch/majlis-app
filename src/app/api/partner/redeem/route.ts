import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { normaliseCode, redeemCoupon } from "@/domain/coupons";
import { json, problem, readBody } from "@/server/http";
import { getStore } from "@/server/store";

const BodyZ = z.object({ code: z.string().min(4).max(40) });

/**
 * Partner confirms a coupon at the till. Until partner accounts land, a single dev token
 * (PARTNER_DEV_TOKEN) stands in for the partner, scoped to PARTNER_DEV_VENUES.
 */
export async function POST(req: Request) {
  const expected = process.env.PARTNER_DEV_TOKEN;
  if (!expected) return problem(503, "partner_auth_not_configured");
  const given = req.headers.get("x-partner-token") ?? "";
  if (given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return problem(401, "unauthorized");

  const body = await readBody(req, BodyZ);
  if (!body.ok) return body.res;
  const venues = (process.env.PARTNER_DEV_VENUES ?? "roastery").split(",");
  const store = getStore();
  const result = redeemCoupon(await store.getCoupon(normaliseCode(body.data.code)), venues, "dev-partner");
  if (!result.ok) return problem(result.reason === "not_found" ? 404 : 409, result.reason);
  await store.saveCoupon(result.coupon);
  await store.audit({ actorId: "dev-partner", action: "coupon.redeemed", entity: result.coupon.code });
  return json({ coupon: result.coupon });
}
