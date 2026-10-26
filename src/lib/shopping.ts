import { storesCarrying } from "./availability";
import { categories, getIngredient, getRecipe, ingredients } from "./catalog";
import { combineAmounts, formatAmounts, scaleAmount, type Amount } from "./units";

export interface ShoppingRequest {
  items: { recipeId: string; servings: number }[];
  /** Ingredient ids already at home — returned with inPantry: true (shown struck through). */
  pantry?: string[];
  /** If given, each item lists which of these stores sell it. */
  stores?: string[];
}

interface Aggregate {
  amounts: Amount[];
  usedIn: Set<string>;
  optional: boolean;
}

export function buildShoppingList({ items, pantry = [], stores = [] }: ShoppingRequest) {
  const have = new Set(pantry);
  const totals = new Map<string, Aggregate>();
  const unknownRecipes: string[] = [];

  for (const { recipeId, servings } of items) {
    const recipe = getRecipe(recipeId);
    if (!recipe) {
      unknownRecipes.push(recipeId);
      continue;
    }
    const factor = servings / recipe.servings;
    for (const ri of recipe.ingredients) {
      if (getIngredient(ri.id)!.staple) continue;
      const entry = totals.get(ri.id) ?? { amounts: [], usedIn: new Set(), optional: true };
      entry.amounts.push(scaleAmount(ri, factor));
      entry.usedIn.add(recipe.name);
      entry.optional &&= !!ri.optional;
      totals.set(ri.id, entry);
    }
  }

  const grouped = categories
    .map((category) => ({
      category,
      items: [...totals.entries()]
        .map(([id, entry]) => ({ ing: getIngredient(id)!, entry }))
        .filter(({ ing }) => ing.category === category.id)
        .sort((a, b) => Number(a.entry.optional) - Number(b.entry.optional) || a.ing.name.localeCompare(b.ing.name))
        .map(({ ing, entry }) => {
          const amounts = combineAmounts(entry.amounts);
          return {
            id: ing.id,
            name: ing.name,
            quantity: formatAmounts(amounts),
            amounts,
            usedIn: [...entry.usedIn],
            optional: entry.optional,
            inPantry: have.has(ing.id),
            availableAt: stores.length ? storesCarrying(ing.id, stores).map((s) => s.name) : undefined,
          };
        }),
    }))
    .filter((group) => group.items.length > 0);

  const all = grouped.flatMap((g) => g.items);
  return {
    categories: grouped,
    summary: {
      totalItems: all.length,
      inPantry: all.filter((i) => i.inPantry).length,
      toBuy: all.filter((i) => !i.inPantry).length,
    },
    notSoldAtChosenStores: stores.length
      ? all.filter((i) => !i.inPantry && !i.optional && i.availableAt!.length === 0).map((i) => i.name)
      : [],
    assumedAtHome: ingredients.filter((i) => i.staple).map((i) => i.name),
    unknownRecipes,
  };
}
