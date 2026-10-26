import { dietAllows, getIngredient, ingredientRef, recipes, recipeSummary, requiredIngredients, type RecipeSummary } from "./catalog";
import type { Diet, MealType } from "./types";

export interface MatchOptions {
  diet?: Diet;
  mealType?: MealType;
  /** Recipes missing up to this many required ingredients are returned as "almost". */
  maxMissing?: number;
}

export interface RecipeMatch {
  recipe: RecipeSummary;
  /** Share of required ingredients you have, 0–100. */
  matchPercent: number;
  have: { id: string; name: string }[];
  missing: { id: string; name: string }[];
  /** Optional ingredients you don't have — nice to add, not needed. */
  optionalMissing: { id: string; name: string }[];
}

export function matchRecipes(haveIds: Iterable<string>, { diet, mealType, maxMissing = 2 }: MatchOptions = {}) {
  const have = new Set(haveIds);
  const canCook: RecipeMatch[] = [];
  const almost: RecipeMatch[] = [];

  for (const recipe of recipes) {
    if (!dietAllows(diet, recipe.diet)) continue;
    if (mealType && !recipe.mealTypes.includes(mealType)) continue;

    const required = requiredIngredients(recipe);
    const haveRequired = required.filter((ing) => have.has(ing.id));
    const missing = required.filter((ing) => !have.has(ing.id));
    if (haveRequired.length === 0) continue;

    const optionalMissing = recipe.ingredients
      .filter((ri) => ri.optional && !have.has(ri.id))
      .map((ri) => getIngredient(ri.id)!);

    const result: RecipeMatch = {
      recipe: recipeSummary(recipe),
      matchPercent: Math.round((haveRequired.length / required.length) * 100),
      have: haveRequired.map(ingredientRef),
      missing: missing.map(ingredientRef),
      optionalMissing: optionalMissing.map(ingredientRef),
    };

    if (missing.length === 0) canCook.push(result);
    else if (missing.length <= maxMissing) almost.push(result);
  }

  canCook.sort((a, b) => a.optionalMissing.length - b.optionalMissing.length || a.recipe.name.localeCompare(b.recipe.name));
  almost.sort((a, b) => a.missing.length - b.missing.length || b.matchPercent - a.matchPercent);
  return { canCook, almost };
}
