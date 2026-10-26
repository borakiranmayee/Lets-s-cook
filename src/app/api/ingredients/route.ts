import { NextResponse, type NextRequest } from "next/server";
import { searchIngredients } from "@/lib/catalog";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  return NextResponse.json(searchIngredients(params.get("q") ?? undefined, params.get("category") ?? undefined));
}
