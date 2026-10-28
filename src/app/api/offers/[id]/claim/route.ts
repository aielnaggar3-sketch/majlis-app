import { VENUES } from "@/domain/catalog";
import { issueCoupon } from "@/domain/coupons";
import { getCurrentUser } from "@/server/currentUser";
import { json, problem } from "@/server/http";
import { getStore } from "@/server/store";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venue = VENUES.find((v) => v.offer?.id === id);
  if (!venue?.offer) return problem(404, "not_found");
  const user = await getCurrentUser();
  const store = getStore();
  const existing = (await store.listCoupons(user.id)).find((c) => c.offerId === id && c.status === "claimed");
  if (existing) return json({ coupon: existing });
  const coupon = await store.saveCoupon(issueCoupon({ offerId: id, venueId: venue.id, userId: user.id, validDays: venue.offer.validDays }));
  await store.audit({ actorId: user.id, action: "coupon.claimed", entity: coupon.code });
  return json({ coupon }, 201);
}
