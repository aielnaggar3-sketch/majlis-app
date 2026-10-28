import type { CharacterBrain, CharacterTurn, ConversationContext, SessionSummary } from "./types";

/** Keyless fallback used in development and tests. Clearly generic; never pretends to understand. */
export class ScriptedBrain implements CharacterBrain {
  readonly name = "scripted";

  async respond(ctx: ConversationContext, _userText: string): Promise<CharacterTurn[]> {
    const active = ctx.characters.filter((c) => !ctx.mutedIds.includes(c.id));
    if (!active.length) return [];
    const n = ctx.history.filter((t) => t.speaker === "user").length;
    const first = active[n % active.length];
    const lines =
      ctx.locale === "ar"
        ? [
            `سؤال حلو. خليني أقولك اللي أعرفه عن «${ctx.topic}»، وبعدين قولي إنت شايف إيه.`,
            "فاهمك. طب إيه أكتر حاجة شاغلاك في الموضوع ده بالظبط؟",
            "مش متأكد ١٠٠٪، بس فيه أكتر من رأي هنا. تحب نبص على كل رأي؟",
          ]
        : [
            `Good question. Let me tell you what I know about "${ctx.topic}", then I want your take.`,
            "I hear you. What part of this matters most to you right now?",
            "I'm not fully sure, and there's more than one view here. Want to go through them?",
          ];
    const turns: CharacterTurn[] = [{ speaker: first.id, emotion: "curious", text: lines[n % lines.length] }];
    if (ctx.type === "group" && active.length > 1) {
      const second = active.find((c) => c.id !== first.id)!;
      turns.push({
        speaker: second.id,
        emotion: "thoughtful",
        text: ctx.locale === "ar" ? "هزوّد حاجة صغيرة: جرّب تبص عليها من ناحية تانية كمان." : "Let me add one thing: it's worth looking at it from another angle too.",
      });
    }
    return turns;
  }

  async summarise(ctx: ConversationContext): Promise<SessionSummary> {
    const userTurns = ctx.history.filter((t) => t.speaker === "user").map((t) => t.text);
    return ctx.locale === "ar"
      ? {
          summary: `اتكلمتوا عن «${ctx.topic}» في ${ctx.venue.name.ar}.`,
          covered: userTurns.slice(0, 3),
          next: ["كمّل نفس الموضوع مع شخصية تانية", "جرّب نقاش جماعي في نفس المكان"],
        }
      : {
          summary: `You talked about "${ctx.topic}" at ${ctx.venue.name.en}.`,
          covered: userTurns.slice(0, 3),
          next: ["Continue the topic with another character", "Try a group discussion in the same venue"],
        };
  }
}
