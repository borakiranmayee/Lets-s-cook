import { describe, expect, it } from "vitest";
import { matchRecipes } from "@/lib/match";

const omelette = ["eggs", "onion", "green-chili", "cilantro", "oil"];

describe("matchRecipes", () => {
  it("finds recipes you can cook, ignoring staples and optional items", () => {
    const { canCook } = matchRecipes(omelette);
    const hit = canCook.find((m) => m.recipe.id === "masala-omelette")!;
    expect(hit.matchPercent).toBe(100);
    expect(hit.missing).toEqual([]);
    expect(hit.optionalMissing.map((i) => i.id)).toEqual(["tomato", "turmeric", "red-chili-powder"]);
  });

  it("lists recipes that are a few items away", () => {
    const { almost } = matchRecipes(["white-rice", "ginger", "cumin-seeds", "turmeric"]);
    const khichdi = almost.find((m) => m.recipe.id === "moong-dal-khichdi")!;
    expect(khichdi.missing.map((i) => i.id).sort()).toEqual(["ghee", "moong-dal"]);
  });

  it("respects maxMissing and diet", () => {
    expect(matchRecipes(["white-rice"], { maxMissing: 0 }).almost).toEqual([]);
    const veg = matchRecipes([...omelette, "chicken"], { diet: "vegetarian", maxMissing: 5 });
    expect([...veg.canCook, ...veg.almost].some((m) => ["egg-curry", "chicken-curry", "masala-omelette"].includes(m.recipe.id))).toBe(false);
  });

  it("returns nothing when you have nothing", () => {
    expect(matchRecipes([])).toEqual({ canCook: [], almost: [] });
  });
});
