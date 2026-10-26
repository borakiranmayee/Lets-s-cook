import { getIngredient, requiredIngredients, stores } from "./catalog";
import type { Ingredient, Recipe, Store } from "./types";

export function storeCarries(store: Store, ing: Ingredient): boolean {
  if (store.carriesAll || ing.staple) return true;
  if (ing.specialty) return store.alsoCarries?.includes(ing.id) ?? false;
  return !store.doesNotCarry?.includes(ing.id);
}

/** Which of the chosen stores sell this ingredient. */
export function storesCarrying(ingredientId: string, storeIds: string[]): Store[] {
  const ing = getIngredient(ingredientId);
  if (!ing) return [];
  return stores.filter((s) => storeIds.includes(s.id) && storeCarries(s, ing));
}

/**
 * Required ingredients of a recipe that none of the chosen stores sell and
 * that aren't already at home. Empty means the recipe can be made.
 */
export function unavailableIngredients(recipe: Recipe, storeIds: string[], pantry: Set<string> = new Set()): Ingredient[] {
  const chosen = stores.filter((s) => storeIds.includes(s.id));
  return requiredIngredients(recipe).filter((ing) => !pantry.has(ing.id) && !chosen.some((s) => storeCarries(s, ing)));
}
