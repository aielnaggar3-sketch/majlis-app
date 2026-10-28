import { describe, expect, it } from "vitest";
import ar from "../messages/ar.json";
import en from "../messages/en.json";
import { CHARACTERS, TOPICS, VENUES } from "@/domain/catalog";

function keys(o: object, prefix = ""): string[] {
  return Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
}
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort();

describe("translations", () => {
  it("has the same keys in Arabic and English", () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
  });

  it("keeps the same placeholders in both languages", () => {
    const get = (o: object, path: string) => path.split(".").reduce<any>((x, k) => x[k], o);
    for (const k of keys(en)) expect(placeholders(get(ar, k)), k).toEqual(placeholders(get(en, k)));
  });

  it("fills every content field in both languages", () => {
    const localized = [
      ...CHARACTERS.flatMap((c) => [c.name, c.role, c.bio, c.expertise, c.boundaries, c.greeting]),
      ...VENUES.flatMap((v) => [v.name, v.description, v.ambience, ...(v.offer ? [v.offer.title, v.offer.terms] : [])]),
      ...TOPICS.map((t) => t.label),
    ];
    for (const l of localized) {
      expect(l.en.trim()).not.toBe("");
      expect(l.ar).toMatch(/[؀-ۿ]/);
    }
  });

  it("has every character disclose it is AI in its greeting", () => {
    for (const c of CHARACTERS) {
      expect(c.greeting.en).toMatch(/\bAI\b/);
      expect(c.greeting.ar).toMatch(/(ال)?ذكاء (ال)?اصطناعي/);
    }
  });
});
