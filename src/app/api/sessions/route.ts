import { getCurrentUser } from "@/server/currentUser";
import { json, problem, readBody } from "@/server/http";
import { SessionRequestZ, openingTurns, quoteFor, topicText } from "@/server/sessions";
import { getStore } from "@/server/store";

/** Start a session. The quote is recomputed here; the client's copy is never trusted. */
export async function POST(req: Request) {
  const body = await readBody(req, SessionRequestZ);
  if (!body.ok) return body.res;
  const user = await getCurrentUser();
  const quote = quoteFor(user, body.data);
  if (quote.kind === "invalid") return problem(400, "invalid_session", quote.reason);
  if (quote.kind === "pay") return problem(402, "payment_required", quote);

  const store = getStore();
  if (quote.kind === "free_intro") await store.updateUser(user.id, { freeSessionUsed: true });
  if (quote.kind === "subscription") await store.updateUser(user.id, { minutesLeft: quote.minutesLeftAfter });

  const session = await store.createSession({
    userId: user.id,
    venueId: body.data.venueId,
    topic: topicText(body.data, body.data.locale),
    type: body.data.type,
    locale: body.data.locale,
    characterIds: body.data.characterIds,
    durationMin: body.data.durationMin,
    quote,
  });
  const turns = openingTurns(session, user.name || (session.locale === "ar" ? "صاحبي" : "friend"));
  await store.updateSession(session.id, { turns });
  return json({ id: session.id }, 201);
}
