import { describe, expect, it } from "vitest";
import { categories, getIngredient, ingredients, recipes, stores } from "@/lib/catalog";

describe("seed data", () => {
  it("has unique ids", () => {
    for (const list of [ingredients, recipes, stores, categories]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("only references known ingredients and categories", () => {
    for (const r of recipes) {
      for (const ri of r.ingredients) expect(getIngredient(ri.id), `${r.id} → ${ri.id}`).toBeDefined();
      for (const side of r.pairsWith ?? []) expect(recipes.some((x) => x.id === side && x.course === "side")).toBe(true);
    }
    for (const ing of ingredients) expect(categories.some((c) => c.id === ing.category)).toBe(true);
    for (const s of stores) {
      for (const id of [...(s.alsoCarries ?? []), ...(s.doesNotCarry ?? [])]) expect(getIngredient(id), `${s.id} → ${id}`).toBeDefined();
      for (const id of s.alsoCarries ?? []) expect(getIngredient(id)!.specialty, `${s.id} alsoCarries ${id}`).toBe(true);
    }
  });

  it("has no duplicate aliases across ingredients", () => {
    const seen = new Map<string, string>();
    for (const ing of ingredients) {
      for (const key of [ing.name, ...ing.aliases].map((k) => k.toLowerCase())) {
        expect(seen.get(key) ?? ing.id, `"${key}"`).toBe(ing.id);
        seen.set(key, ing.id);
      }
    }
  });
});
