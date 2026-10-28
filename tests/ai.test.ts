import { describe, expect, it } from "vitest";
import { CHARACTERS, venueById } from "@/domain/catalog";
import { buildSystemPrompt, parseTurns, renderHistory, HISTORY_WINDOW } from "@/server/ai/prompt";
import { screenUserText, MAX_UTTERANCE_CHARS } from "@/server/ai/safety";
import { ScriptedBrain } from "@/server/ai/scripted";
import type { ConversationContext } from "@/server/ai/types";

const ctx = (patch: Partial<ConversationContext> = {}): ConversationContext => ({
  locale: "ar",
  venue: venueById("nile")!,
  topic: "قهوة",
  type: "group",
  userName: "Medo",
  characters: CHARACTERS.filter((c) => ["layla", "hassan"].includes(c.id)),
  mutedIds: [],
  history: [],
  ...patch,
});

describe("system prompt", () => {
  it("asks for Egyptian Arabic, AI disclosure and two group turns", () => {
    const p = buildSystemPrompt(ctx());
    expect(p).toContain("Egyptian colloquial Arabic");
    expect(p).toContain("They are AI");
    expect(p).toContain("Reply with 2 turns");
  });

  it("leaves muted characters out of the cast", () => {
    const p = buildSystemPrompt(ctx({ mutedIds: ["hassan"] }));
    expect(p).not.toContain('id "hassan"');
    expect(p).toContain("exactly 1 turn");
  });

  it("only sends the recent history window", () => {
    const history = Array.from({ length: 40 }, (_, i) => ({ speaker: "user", text: `m${i}` }));
    expect(renderHistory(ctx({ history })).split("\n")).toHaveLength(HISTORY_WINDOW);
  });
});

describe("parseTurns", () => {
  it("drops unknown and muted speakers and caps at two turns", () => {
    const raw = { turns: [
      { speaker: "layla", emotion: "joy", text: "أهلاً" },
      { speaker: "intruder", emotion: "joy", text: "x" },
      { speaker: "hassan", emotion: "neutral", text: "y" },
      { speaker: "layla", emotion: "joy", text: "z" },
    ] };
    expect(parseTurns(raw, ctx()).map((t) => t.speaker)).toEqual(["layla", "hassan"]);
    expect(parseTurns(raw, ctx({ mutedIds: ["hassan"] })).map((t) => t.speaker)).toEqual(["layla", "layla"]);
  });

  it("returns nothing for malformed output", () => {
    expect(parseTurns({ turns: [{ speaker: "layla", emotion: "angry", text: "x" }] }, ctx())).toEqual([]);
    expect(parseTurns("nope", ctx())).toEqual([]);
  });
});

describe("safety screen", () => {
  it("rejects empty and over-long input", () => {
    expect(screenUserText("   ")).toEqual({ ok: false, reason: "empty" });
    expect(screenUserText("a".repeat(MAX_UTTERANCE_CHARS + 1))).toEqual({ ok: false, reason: "too_long" });
  });

  it("flags crisis language in English and Egyptian Arabic", () => {
    expect(screenUserText("I want to end my life")).toMatchObject({ ok: true, crisis: true });
    expect(screenUserText("أنا عايز أموت")).toMatchObject({ ok: true, crisis: true });
    expect(screenUserText("عامل إيه النهارده؟")).toMatchObject({ ok: true, crisis: false });
  });
});

describe("ScriptedBrain", () => {
  it("answers in the session language with the active cast", async () => {
    const brain = new ScriptedBrain();
    const turns = await brain.respond(ctx(), "إزيك");
    expect(turns).toHaveLength(2);
    expect(turns.every((t) => /[؀-ۿ]/.test(t.text))).toBe(true);
    expect(await brain.respond(ctx({ mutedIds: ["layla", "hassan"] }), "x")).toEqual([]);
  });
});
