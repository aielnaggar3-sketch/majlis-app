import { CHARACTERS, TOPICS } from "./catalog";
import type { Venue } from "./types";

/**
 * Normalise Arabic for matching: unify alef forms, taa marbuta and alef maqsura,
 * strip diacritics and tatweel, and drop the definite article "ال" so
 * "القهوة" and "قهوه" both match.
 */
export function normaliseArabic(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .split(/\s+/)
    .map((w) => (w.startsWith("ال") && w.length > 3 ? w.slice(2) : w))
    .join(" ")
    .trim();
}

function haystack(v: Venue): string {
  const topics = v.topicIds.map((id) => TOPICS.find((t) => t.id === id)).filter(Boolean).flatMap((t) => [t!.label.en, t!.label.ar]);
  const chars = v.characterIds.map((id) => CHARACTERS.find((c) => c.id === id)).filter(Boolean).flatMap((c) => [c!.name.en, c!.name.ar, c!.role.en, c!.role.ar]);
  return normaliseArabic([v.name.en, v.name.ar, v.description.en, v.description.ar, ...topics, ...chars].join(" "));
}

export function searchVenues(venues: Venue[], query: string, filters: { category?: string; access?: string } = {}): Venue[] {
  const q = normaliseArabic(query);
  return venues.filter(
    (v) =>
      (!filters.category || filters.category === "all" || v.category === filters.category) &&
      (!filters.access || filters.access === "all" || v.access === filters.access) &&
      (!q || q.split(" ").every((term) => haystack(v).includes(term))),
  );
}
