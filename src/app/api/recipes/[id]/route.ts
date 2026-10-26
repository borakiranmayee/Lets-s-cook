import { NextResponse, type NextRequest } from "next/server";
import { getIngredient, getRecipe, recipeSummary } from "@/lib/catalog";
import { errorResponse } from "@/lib/http";
import { formatAmount, scaleAmount } from "@/lib/units";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = getRecipe(id);
  if (!recipe) return errorResponse(`Recipe "${id}" not found`, 404);

  const servingsParam = request.nextUrl.searchParams.get("servings");
  const servings = servingsParam ? Number(servingsParam) : recipe.servings;
  if (!Number.isInteger(servings) || servings < 1 || servings > 100) {
    return errorResponse("servings must be a whole number between 1 and 100");
  }

  const factor = servings / recipe.servings;
  return NextResponse.json({
    ...recipeSummary(recipe),
    servings,
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    ingredients: recipe.ingredients.map((ri) => {
      const ing = getIngredient(ri.id)!;
      const amount = scaleAmount(ri, factor);
      return {
        id: ing.id,
        name: ing.name,
        category: ing.category,
        quantity: formatAmount(amount),
        amount,
        note: ri.note,
        optional: !!ri.optional,
        staple: !!ing.staple,
      };
    }),
    steps: recipe.steps,
  });
}
