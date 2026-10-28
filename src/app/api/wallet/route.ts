import { getCurrentUser } from "@/server/currentUser";
import { json } from "@/server/http";
import { getStore } from "@/server/store";

export async function GET() {
  const user = await getCurrentUser();
  return json({ coupons: await getStore().listCoupons(user.id) });
}
