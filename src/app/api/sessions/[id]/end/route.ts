import { getBrain } from "@/server/ai";
import { getCurrentUser } from "@/server/currentUser";
import { json, problem } from "@/server/http";
import { contextFor } from "@/server/sessions";
import { getStore } from "@/server/store";
import { ScriptedBrain } from "@/server/ai/scripted";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const store = getStore();
  const session = await store.getSession(id);
  if (!session || session.userId !== user.id) return problem(404, "not_found");
  if (session.summary) return json({ summary: session.summary });
  const ctx = contextFor(session, user);
  let summary;
  try {
    summary = await getBrain().summarise(ctx);
  } catch (e) {
    console.error("summary failed", e);
    summary = await new ScriptedBrain().summarise(ctx);
  }
  await store.updateSession(id, { status: "ended", endedAt: new Date(), summary });
  return json({ summary });
}
