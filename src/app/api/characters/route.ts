import { CHARACTERS } from "@/domain/catalog";
import { json } from "@/server/http";
import { publicCharacter } from "@/server/public";

export async function GET() {
  return json({ characters: CHARACTERS.map(publicCharacter) });
}
