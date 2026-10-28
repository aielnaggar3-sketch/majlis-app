import { VENUES } from "@/domain/catalog";
import { searchVenues } from "@/domain/search";
import { json } from "@/server/http";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const list = searchVenues(VENUES, url.searchParams.get("q") ?? "", {
    category: url.searchParams.get("category") ?? undefined,
    access: url.searchParams.get("access") ?? undefined,
  });
  return json({ venues: list });
}
