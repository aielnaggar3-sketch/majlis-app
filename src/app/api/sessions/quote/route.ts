import { getCurrentUser } from "@/server/currentUser";
import { json, readBody } from "@/server/http";
import { SessionRequestZ, quoteFor } from "@/server/sessions";

export async function POST(req: Request) {
  const body = await readBody(req, SessionRequestZ);
  if (!body.ok) return body.res;
  const user = await getCurrentUser();
  return json({ quote: quoteFor(user, body.data) });
}
