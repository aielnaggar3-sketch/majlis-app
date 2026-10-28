import type { Character, Venue } from "@/domain/types";

/** What the client may see of a character: everything except the server-side persona prompt. */
export function publicCharacter(c: Character) {
  const { style: _style, ...rest } = c;
  return rest;
}
export type PublicCharacter = ReturnType<typeof publicCharacter>;

export function publicVenue(v: Venue) {
  return v;
}
