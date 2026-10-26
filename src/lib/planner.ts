import { unavailableIngredients } from "./availability";
import { dietAllows, ingredientRef, recipes, recipeSummary, requiredIngredients, type RecipeSummary } from "./catalog";
import type { Diet, MealType, Recipe } from "./types";

export interface PlanRequest {
  stores: string[];
  members: number;
  mealsPerDay: 1 | 2 | 3;
  days: number;
  diet?: Diet;
  /** Ingredient ids already at home; they count as available and are preferred. */
  pantry?: string[];
  /** Change to get a different plan with the same settings. */
  seed?: number;
}

export interface PlannedMeal {
  mealType: MealType;
  servings: number;
  recipes: RecipeSummary[];
}

const MEAL_SLOTS: Record<PlanRequest["mealsPerDay"], MealType[]> = {
  1: ["dinner"],
  2: ["lunch", "dinner"],
  3: ["breakfast", "lunch", "dinner"],
};

/** Small seeded random generator so the same seed gives the same plan. */
function seededRandom(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function suggestPlan(req: PlanRequest) {
  const pantry = new Set(req.pantry ?? []);
  const random = seededRandom(req.seed ?? 1);
  const tieBreak = new Map(recipes.map((r) => [r.id, random()]));

  const available: Recipe[] = [];
  const unavailable: { recipe: RecipeSummary; missing: { id: string; name: string }[] }[] = [];
  for (const recipe of recipes) {
    if (!dietAllows(req.diet, recipe.diet)) continue;
    const missing = unavailableIngredients(recipe, req.stores, pantry);
    if (missing.length === 0) available.push(recipe);
    else unavailable.push({ recipe: recipeSummary(recipe), missing: missing.map(ingredientRef) });
  }

  const usage = new Map<string, number>();
  const toBuy = (r: Recipe) => requiredIngredients(r).filter((i) => !pantry.has(i.id)).length;

  /** Least-used first, then the one needing fewest purchases, then random. */
  function pick(candidates: Recipe[], avoid?: string): Recipe | undefined {
    const pool = candidates.length > 1 ? candidates.filter((r) => r.id !== avoid) : candidates;
    return [...pool].sort(
      (a, b) =>
        (usage.get(a.id) ?? 0) - (usage.get(b.id) ?? 0) ||
        toBuy(a) - toBuy(b) ||
        tieBreak.get(a.id)! - tieBreak.get(b.id)!,
    )[0];
  }

  const sides = available.filter((r) => r.course === "side");
  const warnings = new Set<string>();
  let previousMain: string | undefined;

  const days = Array.from({ length: req.days }, (_, i) => {
    const meals: PlannedMeal[] = MEAL_SLOTS[req.mealsPerDay].map((mealType) => {
      const mains = available.filter((r) => r.course === "main" && r.mealTypes.includes(mealType));
      const main = pick(mains, previousMain);
      if (!main) {
        warnings.add(`No ${mealType} recipes can be made with the selected stores. Try adding an Indian grocery store.`);
        return { mealType, servings: req.members, recipes: [] };
      }
      previousMain = main.id;
      usage.set(main.id, (usage.get(main.id) ?? 0) + 1);

      const chosen = [main];
      if (mealType !== "breakfast" && main.pairsWith?.length !== 0) {
        const fits = sides.filter((s) => !main.pairsWith || main.pairsWith.includes(s.id));
        const side = pick(fits);
        if (side) {
          usage.set(side.id, (usage.get(side.id) ?? 0) + 1);
          chosen.push(side);
        }
      }
      return { mealType, servings: req.members, recipes: chosen.map(recipeSummary) };
    });
    return { day: i + 1, meals };
  });

  return {
    settings: { ...req, pantry: undefined },
    totalMeals: req.days * req.mealsPerDay,
    availableRecipeCount: available.length,
    days,
    unavailable,
    warnings: [...warnings],
  };
}
