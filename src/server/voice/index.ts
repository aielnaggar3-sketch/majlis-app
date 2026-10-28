import type { SpeechToText, TextToSpeech, VoiceConfig, VoiceProviderId } from "./types";

export const VOICE_CONFIG: VoiceConfig = {
  stt: (process.env.VOICE_STT_PROVIDER as VoiceProviderId) || "browser",
  tts: (process.env.VOICE_TTS_PROVIDER as VoiceProviderId) || "browser",
  sttLanguage: { ar: "ar-EG", en: "en-US" },
};

/** The browser does recognition and synthesis on-device; the server has nothing to mint. */
const browserStt: SpeechToText = {
  id: "browser",
  languages: ["ar-EG", "en-US"],
  createClientToken: async () => null,
};

const browserTts: TextToSpeech = {
  id: "browser",
  synthesize: async () => null,
};

export class VoiceNotConfiguredError extends Error {
  constructor(provider: string, missing: string) {
    super(`Voice provider "${provider}" needs ${missing}. See .env.example.`);
  }
}

export function getSpeechToText(): SpeechToText {
  switch (VOICE_CONFIG.stt) {
    case "browser":
      return browserStt;
    case "azure":
      if (!process.env.AZURE_SPEECH_KEY) throw new VoiceNotConfiguredError("azure", "AZURE_SPEECH_KEY and AZURE_SPEECH_REGION");
      throw new Error("Azure STT adapter lands with the voice milestone (Phase 1, week 3).");
    default:
      throw new Error(`STT provider "${VOICE_CONFIG.stt}" is not implemented yet.`);
  }
}

export function getTextToSpeech(): TextToSpeech {
  switch (VOICE_CONFIG.tts) {
    case "browser":
      return browserTts;
    case "azure":
    case "elevenlabs":
      throw new Error(`TTS provider "${VOICE_CONFIG.tts}" lands with the voice milestone (Phase 1, week 3).`);
    default:
      throw new Error(`TTS provider "${VOICE_CONFIG.tts}" is not implemented yet.`);
  }
}
