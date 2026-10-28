import Anthropic from "@anthropic-ai/sdk";
import { SUMMARY_SCHEMA, SummaryZ, TURNS_SCHEMA, buildSystemPrompt, parseTurns, renderHistory } from "./prompt";
import type { CharacterBrain, CharacterTurn, ConversationContext, SessionSummary } from "./types";

const FALLBACK_BETA = "server-side-fallback-2026-07-01";

export class RefusedError extends Error {
  constructor(readonly category: string | null) {
    super(`Model declined the request${category ? ` (${category})` : ""}`);
  }
}

/**
 * Characters voiced by Claude. Uses structured output so every turn arrives as
 * {speaker, emotion, text}, low effort for conversational latency, and the server-side
 * refusal fallback so a declined turn is retried on Anthropic's recommended model.
 */
export class ClaudeBrain implements CharacterBrain {
  readonly name = "claude";
  private client: Anthropic;

  constructor(
    private model = process.env.CLAUDE_MODEL || "claude-opus-5-5",
    client?: Anthropic,
  ) {
    this.client = client ?? new Anthropic();
  }

  async respond(ctx: ConversationContext, userText: string): Promise<CharacterTurn[]> {
    const history = renderHistory(ctx);
    const content = `${history ? `Conversation so far:\n${history}\n\n` : ""}User: ${userText}`;
    const json = await this.call(buildSystemPrompt(ctx), content, TURNS_SCHEMA, 2000);
    return parseTurns(json, ctx);
  }

  async summarise(ctx: ConversationContext): Promise<SessionSummary> {
    const lang = ctx.locale === "ar" ? "Egyptian colloquial Arabic (عامية مصرية)" : "English";
    const json = await this.call(
      `You write short, warm end-of-session summaries for the user of Majlis, an AI conversation app. Write in ${lang}. summary: 2 sentences. covered: up to 3 short bullets. next: 2 short, concrete next steps.`,
      `Venue: ${ctx.venue.name.en}. Topic: ${ctx.topic}.\n\nTranscript:\n${renderHistory(ctx)}`,
      SUMMARY_SCHEMA,
      2000,
    );
    return SummaryZ.parse(json);
  }

  private async call(system: string, user: string, schema: Record<string, unknown>, maxTokens: number): Promise<unknown> {
    const response = await this.client.beta.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: user }],
      output_config: { effort: "low", format: { type: "json_schema", schema } },
    });
    if (response.stop_reason === "refusal") {
      throw new RefusedError(response.stop_details?.category ?? null);
    }
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return null;
    try {
      return JSON.parse(text.text);
    } catch {
      return null;
    }
  }
}
