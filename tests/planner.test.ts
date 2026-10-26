import { describe, expect, it } from "vitest";
import { unavailableIngredients, storeCarries } from "@/lib/availability";
import { getIngredient, getRecipe, getStore } from "@/lib/catalog";
import { suggestPlan } from "@/lib/planner";

describe("store availability", () => {
  it("Indian stores carry everything, mainstream stores skip specialty items", () => {
    expect(storeCarries(getStore("patel-brothers")!, getIngredient("curry-leaves")!)).toBe(true);
    expect(storeCarries(getStore("kroger")!, getIngredient("curry-leaves")!)).toBe(false);
    expect(storeCarries(getStore("kroger")!, getIngredient("paneer")!)).toBe(true);
    expect(storeCarries(getStore("costco")!, getIngredient("okra")!)).toBe(false);
  });

  it("combines stores and counts pantry items as available", () => {
    const sambar = getRecipe("sambar")!;
    expect(unavailableIngredients(sambar, ["kroger"]).map((i) => i.id).sort()).toEqual(
      ["asafoetida", "curry-leaves", "sambar-powder", "toor-dal"],
    );
    expect(unavailableIngredients(sambar, ["kroger", "patel-brothers"])).toEqual([]);
    expect(unavailableIngredients(sambar, ["kroger"], new Set(["asafoetida", "curry-leaves", "sambar-powder", "toor-dal"]))).toEqual([]);
  });
});

describe("suggestPlan", () => {
  const base = { stores: ["patel-brothers"], members: 4, mealsPerDay: 3 as const, days: 5 };

  it("fills every slot with a main and pairs lunch/dinner with a side", () => {
    const plan = suggestPlan(base);
    expect(plan.days).toHaveLength(5);
    expect(plan.warnings).toEqual([]);
    for (const day of plan.days) {
      expect(day.meals.map((m) => m.mealType)).toEqual(["breakfast", "lunch", "dinner"]);
      for (const meal of day.meals) {
        expect(meal.servings).toBe(4);
        expect(meal.recipes[0].course).toBe("main");
        expect(meal.recipes[0].mealTypes).toContain(meal.mealType);
        if (meal.mealType === "breakfast") expect(meal.recipes).toHaveLength(1);
      }
    }
  });

  it("varies meals and never repeats a main back-to-back", () => {
    const mains = suggestPlan(base).days.flatMap((d) => d.meals.map((m) => m.recipes[0].id));
    for (let i = 1; i < mains.length; i++) expect(mains[i]).not.toBe(mains[i - 1]);
    expect(new Set(mains).size).toBeGreaterThan(8);
  });

  it("respects pairings and diet", () => {
    const plan = suggestPlan({ ...base, diet: "vegan", days: 7 });
    for (const meal of plan.days.flatMap((d) => d.meals)) {
      for (const r of meal.recipes) expect(r.diet).toBe("vegan");
      const [main, side] = meal.recipes;
      if (main.id === "sambar") expect(side.id).toBe("steamed-rice");
    }
  });

  it("only uses recipes the chosen stores can supply and reports the rest", () => {
    const plan = suggestPlan({ ...base, stores: ["kroger"] });
    const used = new Set(plan.days.flatMap((d) => d.meals.flatMap((m) => m.recipes.map((r) => r.id))));
    expect(used.has("sambar")).toBe(false);
    expect(plan.unavailable.find((u) => u.recipe.id === "sambar")!.missing.map((i) => i.id)).toContain("curry-leaves");
  });

  it("warns when a meal can't be filled", () => {
    const plan = suggestPlan({ ...base, stores: ["costco"], diet: "vegan" });
    expect(plan.warnings.length).toBeGreaterThan(0);
  });

  it("is deterministic per seed", () => {
    expect(suggestPlan({ ...base, seed: 7 })).toEqual(suggestPlan({ ...base, seed: 7 }));
  });
});
