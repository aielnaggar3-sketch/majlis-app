import { z } from "zod";
import { getCurrentUser } from "@/server/currentUser";
import { json, problem, readBody } from "@/server/http";
import { getStore } from "@/server/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const session = await getStore().getSession(id);
  if (!session || session.userId !== user.id) return problem(404, "not_found");
  return json({ session, brain: process.env.ANTHROPIC_API_KEY ? "claude" : "scripted" });
}

const PatchZ = z.object({ mutedIds: z.array(z.string()).optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readBody(req, PatchZ);
  if (!body.ok) return body.res;
  const user = await getCurrentUser();
  const store = getStore();
  const session = await store.getSession(id);
  if (!session || session.userId !== user.id) return problem(404, "not_found");
  const mutedIds = (body.data.mutedIds ?? session.mutedIds).filter((m) => session.characterIds.includes(m));
  return json({ session: await store.updateSession(id, { mutedIds }) });
}
