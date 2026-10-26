import { NextResponse } from "next/server";
import { getStore, resolveIngredients } from "@/lib/catalog";
import { errorResponse, parseBody, planSchema } from "@/lib/http";
import { suggestPlan } from "@/lib/planner";

export async function POST(request: Request) {
  const body = await parseBody(request, planSchema);
  if (body.error) return body.error;

  const unknownStores = body.data.stores.filter((id) => !getStore(id));
  if (unknownStores.length) return errorResponse(`Unknown store(s): ${unknownStores.join(", ")}. See GET /api/stores.`);

  const pantry = resolveIngredients(body.data.pantry ?? []).ids;
  return NextResponse.json(suggestPlan({ ...body.data, pantry }));
}
