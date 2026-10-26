import { NextResponse } from "next/server";
import { z } from "zod";
import { DIETS, MEAL_TYPES } from "./types";

export const dietSchema = z.enum(DIETS);
export const mealTypeSchema = z.enum(MEAL_TYPES);
const ingredientList = z.array(z.string().max(100)).max(300);

export const matchSchema = z.object({
  ingredients: ingredientList.min(1, "Add at least one ingredient"),
  diet: dietSchema.optional(),
  mealType: mealTypeSchema.optional(),
  maxMissing: z.number().int().min(0).max(5).optional(),
});

export const planSchema = z.object({
  stores: z.array(z.string()).min(1, "Choose at least one store"),
  members: z.number().int().min(1).max(20),
  mealsPerDay: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  days: z.number().int().min(1).max(14),
  diet: dietSchema.optional(),
  pantry: ingredientList.optional(),
  seed: z.number().int().optional(),
});

export const shoppingSchema = z.object({
  items: z
    .array(z.object({ recipeId: z.string(), servings: z.number().min(1).max(100) }))
    .min(1, "Choose at least one recipe")
    .max(100),
  pantry: ingredientList.optional(),
  stores: z.array(z.string()).optional(),
});

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

/** Parses a JSON body against a schema, or returns a 400 response. */
export async function parseBody<T extends z.ZodType>(request: Request, schema: T) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: errorResponse("Request body must be valid JSON") };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    const message = first ? `${first.path.join(".") || "body"}: ${first.message}` : "Invalid request";
    return { error: errorResponse(message, 400, z.treeifyError(result.error)) };
  }
  return { data: result.data as z.infer<T> };
}

/** Validates an optional query-string enum, or returns a 400 response. */
export function parseParam<T extends z.ZodType>(value: string | null, schema: T, name: string) {
  if (value === null || value === "") return { data: undefined };
  const result = schema.safeParse(value);
  return result.success
    ? { data: result.data as z.infer<T> }
    : { error: errorResponse(`Invalid ${name}: "${value}"`) };
}
