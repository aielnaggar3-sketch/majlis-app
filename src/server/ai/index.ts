import { ClaudeBrain } from "./anthropic";
import { ScriptedBrain } from "./scripted";
import type { CharacterBrain } from "./types";

let brain: CharacterBrain | undefined;

/** Claude when a key is configured, scripted replies otherwise. */
export function getBrain(): CharacterBrain {
  if (!brain) brain = process.env.ANTHROPIC_API_KEY ? new ClaudeBrain() : new ScriptedBrain();
  return brain;
}

export function setBrainForTests(b: CharacterBrain) {
  brain = b;
}
