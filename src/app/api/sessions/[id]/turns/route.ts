import { z } from "zod";
import { getBrain } from "@/server/ai";
import { RefusedError } from "@/server/ai/anthropic";
import type { CharacterTurn } from "@/server/ai/types";
import { screenUserText } from "@/server/ai/safety";
import { getCurrentUser } from "@/server/currentUser";
import { json, problem, readBody } from "@/server/http";
import { contextFor } from "@/server/sessions";
import { getStore } from "@/server/store";

const BodyZ = z.object({ text: z.string() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readBody(req, BodyZ);
  if (!body.ok) return body.res;
  const user = await getCurrentUser();
  const store = getStore();
  const session = await store.getSession(id);
  if (!session || session.userId !== user.id) return problem(404, "not_found");
  if (session.status !== "active") return problem(409, "session_ended");
  const elapsedMin = (Date.now() - session.startedAt.getTime()) / 60_000;
  if (elapsedMin > session.durationMin + 1) return problem(409, "time_up");

  const screened = screenUserText(body.data.text);
  if (!screened.ok) return problem(400, screened.reason);

  const ctx = contextFor(session, user);
  let turns: CharacterTurn[];
  try {
    turns = await getBrain().respond(ctx, screened.text);
  } catch (e) {
    if (e instanceof RefusedError) turns = [];
    else {
      console.error("character turn failed", e);
      return problem(502, "character_unavailable");
    }
  }
  const updated = await store.updateSession(id, { turns: [...session.turns, { speaker: "user", text: screened.text }, ...turns] });
  return json({ turns, crisis: screened.crisis, total: updated.turns.length });
}
