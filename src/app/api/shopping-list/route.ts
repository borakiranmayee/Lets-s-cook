import { NextResponse } from "next/server";
import { getStore, resolveIngredients } from "@/lib/catalog";
import { errorResponse, parseBody, shoppingSchema } from "@/lib/http";
import { buildShoppingList } from "@/lib/shopping";

export async function POST(request: Request) {
  const body = await parseBody(request, shoppingSchema);
  if (body.error) return body.error;

  const unknownStores = (body.data.stores ?? []).filter((id) => !getStore(id));
  if (unknownStores.length) return errorResponse(`Unknown store(s): ${unknownStores.join(", ")}. See GET /api/stores.`);

  const pantry = resolveIngredients(body.data.pantry ?? []).ids;
  return NextResponse.json(buildShoppingList({ ...body.data, pantry }));
}
