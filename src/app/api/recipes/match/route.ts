import { NextResponse } from "next/server";
import { resolveIngredients } from "@/lib/catalog";
import { matchSchema, parseBody } from "@/lib/http";
import { matchRecipes } from "@/lib/match";

export async function POST(request: Request) {
  const body = await parseBody(request, matchSchema);
  if (body.error) return body.error;

  const { ids, unknown } = resolveIngredients(body.data.ingredients);
  return NextResponse.json({
    recognized: ids,
    unrecognized: unknown,
    ...matchRecipes(ids, body.data),
  });
}
