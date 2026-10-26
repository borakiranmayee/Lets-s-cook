import { NextResponse } from "next/server";
import { categories, ingredients } from "@/lib/catalog";

export function GET() {
  return NextResponse.json(
    categories.map((c) => ({ ...c, ingredientCount: ingredients.filter((i) => i.category === c.id).length })),
  );
}
