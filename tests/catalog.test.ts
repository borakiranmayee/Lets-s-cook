import { describe, expect, it } from "vitest";
import { dietAllows, resolveIngredients, searchIngredients } from "@/lib/catalog";

describe("resolveIngredients", () => {
  it("matches ids, names and Hindi/regional aliases case-insensitively", () => {
    const { ids, unknown } = resolveIngredients(["Aloo", "palak", "toor-dal", "Green Chili", "haldi", "dragonfruit"]);
    expect(ids).toEqual(["potato", "spinach", "toor-dal", "green-chili", "turmeric"]);
    expect(unknown).toEqual(["dragonfruit"]);
  });

  it("dedupes", () => {
    expect(resolveIngredients(["jeera", "cumin seeds"]).ids).toEqual(["cumin-seeds"]);
  });
});

describe("searchIngredients", () => {
  it("searches aliases and filters by category", () => {
    expect(searchIngredients("dal").every((i) => i.category === "dals-lentils" || i.aliases.some((a) => a.includes("dal")))).toBe(true);
    expect(searchIngredients(undefined, "eggs").map((i) => i.id)).toEqual(["eggs"]);
  });
});

describe("dietAllows", () => {
  it("lets stricter diets fit looser filters", () => {
    expect(dietAllows("vegetarian", "vegan")).toBe(true);
    expect(dietAllows("vegetarian", "eggetarian")).toBe(false);
    expect(dietAllows("non-vegetarian", "vegetarian")).toBe(true);
    expect(dietAllows(undefined, "non-vegetarian")).toBe(true);
  });
});
