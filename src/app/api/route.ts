import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "Let's Cook API",
    version: "0.1.0",
    docs: "/docs",
    endpoints: [
      "GET  /api/categories",
      "GET  /api/ingredients?q=&category=",
      "GET  /api/recipes?q=&diet=&mealType=&course=",
      "GET  /api/recipes/{id}?servings=",
      "POST /api/recipes/match",
      "GET  /api/stores",
      "POST /api/plans/suggest",
      "POST /api/shopping-list",
    ],
  });
}
