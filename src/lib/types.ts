export type CategoryId =
  | "vegetables"
  | "herbs-aromatics"
  | "meat-poultry"
  | "seafood"
  | "eggs"
  | "dairy"
  | "dals-lentils"
  | "beans-legumes"
  | "rice-grains"
  | "flours"
  | "whole-spices"
  | "ground-spices"
  | "masala-blends"
  | "nuts-seeds"
  | "oils-fats"
  | "sweeteners"
  | "souring-agents"
  | "basics";

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
}

export interface Ingredient {
  id: string;
  name: string;
  /** Other names people search by, e.g. Hindi/regional names. */
  aliases: string[];
  category: CategoryId;
  /** Assumed to be in every kitchen (salt, water). Never counted as missing. */
  staple?: boolean;
  /** Usually only found at Indian grocery stores. */
  specialty?: boolean;
}

export type Unit =
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "tsp"
  | "tbsp"
  | "cup"
  | "piece"
  | "clove"
  | "inch"
  | "sprig"
  | "pinch"
  | "handful"
  | "to taste";

export interface RecipeIngredient {
  id: string;
  qty: number;
  unit: Unit;
  optional?: boolean;
  note?: string;
}

/** Ordered from most to least restrictive. */
export const DIETS = ["vegan", "vegetarian", "eggetarian", "non-vegetarian"] as const;
export type Diet = (typeof DIETS)[number];

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

/** A main dish, or a side (rice/bread) that goes with a main. */
export type Course = "main" | "side";

export interface Recipe {
  id: string;
  name: string;
  description: string;
  region: string;
  diet: Diet;
  course: Course;
  mealTypes: MealType[];
  /** Side dishes this main goes with. Omitted = any side; empty = no side needed. */
  pairsWith?: string[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: string[];
}

export type StoreType = "indian" | "mainstream" | "warehouse";

export interface Store {
  id: string;
  name: string;
  type: StoreType;
  /** Indian grocery stores carry everything. */
  carriesAll?: boolean;
  /** Specialty items this store does stock. */
  alsoCarries?: string[];
  /** Regular items this store usually doesn't stock. */
  doesNotCarry?: string[];
}
