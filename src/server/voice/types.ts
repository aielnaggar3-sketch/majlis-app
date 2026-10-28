import type { Locale } from "@/domain/types";

// Provider interfaces for the realtime voice service. Phase 1 ships with the "browser"
// implementation (the client's Web Speech API) so the app works without paid keys;
// production swaps in streaming providers per language without touching the session code.

export type VoiceProviderId = "browser" | "azure" | "elevenlabs" | "google" | "deepgram";

export interface SpeechToText {
  readonly id: VoiceProviderId;
  /** BCP-47 tags this provider recognises well, e.g. "ar-EG", "en-US". */
  readonly languages: string[];
  /** Mint a short-lived token the client uses to stream audio directly to the provider. */
  createClientToken(locale: Locale): Promise<{ token: string; region?: string; expiresAt: Date } | null>;
}

export interface TextToSpeech {
  readonly id: VoiceProviderId;
  /** Return audio for one sentence. Streaming providers return a URL or stream handle. */
  synthesize(input: { text: string; locale: Locale; voiceId?: string }): Promise<{ audio: ArrayBuffer; visemes?: Array<{ t: number; v: number }> } | null>;
}

export interface VoiceConfig {
  stt: VoiceProviderId;
  tts: VoiceProviderId;
  /** Speech recognition language per UI locale. Egyptian Arabic by default. */
  sttLanguage: Record<Locale, string>;
}
