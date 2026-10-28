import type { Character, Emotion, Locale, SessionType, Venue } from "@/domain/types";

export interface Turn {
  speaker: "user" | string;
  text: string;
  emotion?: Emotion;
}

export interface ConversationContext {
  locale: Locale;
  venue: Venue;
  topic: string;
  type: SessionType;
  userName: string;
  characters: Character[];
  /** Characters the user muted: present, but they don't speak. */
  mutedIds: string[];
  history: Turn[];
}

export interface CharacterTurn {
  speaker: string;
  emotion: Emotion;
  text: string;
}

export interface SessionSummary {
  summary: string;
  covered: string[];
  next: string[];
}

/** Anything that can voice the characters. Swappable so tests and keyless dev never call a paid API. */
export interface CharacterBrain {
  readonly name: string;
  respond(ctx: ConversationContext, userText: string): Promise<CharacterTurn[]>;
  summarise(ctx: ConversationContext): Promise<SessionSummary>;
}
