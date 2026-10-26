import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { filterRecipes, recipeSummary } from "@/lib/catalog";
import { dietSchema, mealTypeSchema, parseParam } from "@/lib/http";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const diet = parseParam(params.get("diet"), dietSchema, "diet");
  const mealType = parseParam(params.get("mealType"), mealTypeSchema, "mealType");
  const course = parseParam(params.get("course"), z.enum(["main", "side"]), "course");
  for (const p of [diet, mealType, course]) if (p.error) return p.error;

  const results = filterRecipes({
    q: params.get("q") ?? undefined,
    diet: diet.data,
    mealType: mealType.data,
    course: course.data,
  });
  return NextResponse.json(results.map(recipeSummary));
}
