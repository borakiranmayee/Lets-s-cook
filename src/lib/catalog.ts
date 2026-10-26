import { categories } from "@/data/categories";
import { ingredients } from "@/data/ingredients";
import { recipes } from "@/data/recipes";
import { stores } from "@/data/stores";
import { DIETS, type Diet, type Ingredient, type MealType, type Recipe, type Store } from "./types";

const ingredientById = new Map(ingredients.map((i) => [i.id, i]));
const recipeById = new Map(recipes.map((r) => [r.id, r]));
const storeById = new Map(stores.map((s) => [s.id, s]));

export function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[\s_-]+/g, " ");
}

/** Every id, name and alias, normalized, pointing at its ingredient id. */
const nameIndex = new Map<string, string>();
for (const ing of ingredients) {
  for (const key of [ing.id, ing.name, ...ing.aliases]) {
    const norm = normalize(key);
    if (!nameIndex.has(norm)) nameIndex.set(norm, ing.id);
  }
}

export const getIngredient = (id: string): Ingredient | undefined => ingredientById.get(id);
export const getRecipe = (id: string): Recipe | undefined => recipeById.get(id);
export const getStore = (id: string): Store | undefined => storeById.get(id);
export const getCategory = (id: string) => categories.find((c) => c.id === id);

/** Turns ids, names or aliases ("aloo", "Potato", "potato") into ingredient ids. */
export function resolveIngredients(inputs: string[]): { ids: string[]; unknown: string[] } {
  const ids = new Set<string>();
  const unknown: string[] = [];
  for (const input of inputs) {
    const id = nameIndex.get(normalize(input));
    if (id) ids.add(id);
    else if (input.trim()) unknown.push(input);
  }
  return { ids: [...ids], unknown };
}

export function searchIngredients(q?: string, category?: string): Ingredient[] {
  const query = q ? normalize(q) : "";
  return ingredients.filter((ing) => {
    if (category && ing.category !== category) return false;
    if (!query) return true;
    return [ing.id, ing.name, ...ing.aliases].some((k) => normalize(k).includes(query));
  });
}

/** True if a recipe fits the diet, e.g. a vegan recipe fits a vegetarian. */
export function dietAllows(filter: Diet | undefined, recipeDiet: Diet): boolean {
  if (!filter) return true;
  return DIETS.indexOf(recipeDiet) <= DIETS.indexOf(filter);
}

/** Ingredients a recipe can't be made without (excludes optional items and staples). */
export function requiredIngredients(recipe: Recipe): Ingredient[] {
  return recipe.ingredients
    .filter((ri) => !ri.optional)
    .map((ri) => ingredientById.get(ri.id)!)
    .filter((ing) => !ing.staple);
}

export interface RecipeFilter {
  q?: string;
  diet?: Diet;
  mealType?: MealType;
  course?: Recipe["course"];
}

export function filterRecipes({ q, diet, mealType, course }: RecipeFilter): Recipe[] {
  const query = q ? normalize(q) : "";
  return recipes.filter(
    (r) =>
      dietAllows(diet, r.diet) &&
      (!mealType || r.mealTypes.includes(mealType)) &&
      (!course || r.course === course) &&
      (!query || normalize(`${r.name} ${r.region} ${r.description}`).includes(query)),
  );
}

export function recipeSummary(r: Recipe) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    region: r.region,
    diet: r.diet,
    course: r.course,
    mealTypes: r.mealTypes,
    totalMinutes: r.prepMinutes + r.cookMinutes,
    servings: r.servings,
  };
}

export type RecipeSummary = ReturnType<typeof recipeSummary>;

export const ingredientRef = (ing: Ingredient) => ({ id: ing.id, name: ing.name });

export { categories, ingredients, recipes, stores };
