// Seed a fresh database with the starter catalogue: `DATABASE_URL=... npx tsx src/db/seed.ts`
import { CHARACTERS, TOPICS, VENUES } from "../domain/catalog";
import { getDb } from "./client";
import { characters, topics, venueCharacters, venues } from "./schema";

async function main() {
  const db = getDb();
  if (!db) throw new Error("Set DATABASE_URL first.");
  await db.insert(topics).values(TOPICS.map((t) => ({ id: t.id, label: t.label, sensitive: !!t.sensitive }))).onConflictDoNothing();
  await db
    .insert(characters)
    .values(
      CHARACTERS.map((c) => ({
        id: c.id, status: "published" as const, name: c.name, role: c.role, bio: c.bio, expertise: c.expertise,
        boundaries: c.boundaries, greeting: c.greeting, style: c.style, look: c.look, premium: c.premium, voices: {},
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(venues)
    .values(
      VENUES.map((v) => ({
        id: v.id, category: v.category, access: v.access, status: "published" as const, name: v.name, description: v.description,
        ambience: v.ambience, translationStatus: { en: "reviewed" as const, ar: "reviewed" as const }, art: { scene: v.art, palette: v.palette },
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(venueCharacters)
    .values(VENUES.flatMap((v) => v.characterIds.map((characterId) => ({ venueId: v.id, characterId }))))
    .onConflictDoNothing();
  console.log("Seeded.");
  process.exit(0);
}

main();
