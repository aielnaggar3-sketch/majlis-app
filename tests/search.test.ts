import { describe, expect, it } from "vitest";
import { VENUES } from "@/domain/catalog";
import { normaliseArabic, searchVenues } from "@/domain/search";

const ids = (q: string, f = {}) => searchVenues(VENUES, q, f).map((v) => v.id);

describe("Arabic search", () => {
  it("normalises alef, taa marbuta, diacritics and the article", () => {
    expect(normaliseArabic("القَهْوة")).toBe(normaliseArabic("قهوه"));
    expect(normaliseArabic("أهرامات")).toBe(normaliseArabic("اهرامات"));
  });

  it("finds venues by Arabic topic or character name in any spelling", () => {
    expect(ids("الاهرامات")).toContain("giza");
    expect(ids("أهرامات")).toContain("giza");
    expect(ids("pyramids")).toContain("giza");
  });

  it("filters by category and access", () => {
    expect(ids("", { access: "sponsored" })).toEqual(["roastery"]);
    expect(ids("", { category: "cafe" }).sort()).toEqual(["nile", "roastery"]);
    expect(ids("", { access: "all", category: "all" })).toHaveLength(VENUES.length);
  });

  it("returns nothing for unknown words", () => {
    expect(ids("zzzz")).toEqual([]);
  });
});
