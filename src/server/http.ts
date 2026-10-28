import { NextResponse } from "next/server";
import type { z } from "zod";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const problem = (status: number, code: string, detail?: unknown) => NextResponse.json({ error: code, detail }, { status });

export async function readBody<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<{ ok: true; data: z.infer<T> } | { ok: false; res: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, res: problem(400, "invalid_json") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, res: problem(400, "invalid_body", parsed.error.issues) };
  return { ok: true, data: parsed.data };
}
