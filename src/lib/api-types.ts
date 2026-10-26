import type { RecipeSummary } from "./catalog";
import type { matchRecipes } from "./match";
import type { suggestPlan } from "./planner";
import type { buildShoppingList } from "./shopping";
import type { Category, Ingredient, StoreType } from "./types";

export type { RecipeSummary, Category, Ingredient };
export type CategoryWithCount = Category & { ingredientCount: number };
export type StoreInfo = { id: string; name: string; type: StoreType };
export type MatchResponse = ReturnType<typeof matchRecipes> & { recognized: string[]; unrecognized: string[] };
export type RecipeMatch = MatchResponse["canCook"][number];
export type PlanResponse = ReturnType<typeof suggestPlan>;
export type ShoppingResponse = ReturnType<typeof buildShoppingList>;
export type ShoppingItem = ShoppingResponse["categories"][number]["items"][number];

export interface RecipeDetail extends RecipeSummary {
  prepMinutes: number;
  cookMinutes: number;
  ingredients: {
    id: string;
    name: string;
    category: string;
    quantity: string;
    note?: string;
    optional: boolean;
    staple: boolean;
  }[];
  steps: string[];
}

export interface ListItem {
  recipeId: string;
  name: string;
  servings: number;
}

export interface Household {
  stores: string[];
  members: number;
  mealsPerDay: 1 | 2 | 3;
  days: number;
  diet: "" | "vegan" | "vegetarian" | "eggetarian" | "non-vegetarian";
}
