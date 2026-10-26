import type { Metadata } from "next";

export const metadata: Metadata = { title: "API docs — Let's Cook" };

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  summary: string;
  params?: [string, string][];
  body?: string;
  response?: string;
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/api/ingredients",
    summary: "List or search ingredients. Search matches English, Hindi and regional names.",
    params: [["q", "Search text, e.g. aloo"], ["category", "Category id, e.g. dals-lentils"]],
    response: `[{ "id": "potato", "name": "Potato", "aliases": ["aloo", "alu", "batata"], "category": "vegetables" }]`,
  },
  { method: "GET", path: "/api/categories", summary: "Ingredient categories (vegetables, dals, spices, …) with counts." },
  {
    method: "GET",
    path: "/api/recipes",
    summary: "List recipes.",
    params: [["q", "Search name/region"], ["diet", "vegan | vegetarian | eggetarian | non-vegetarian"], ["mealType", "breakfast | lunch | dinner | snack"], ["course", "main | side"]],
  },
  {
    method: "GET",
    path: "/api/recipes/{id}",
    summary: "Full recipe with ingredients scaled to the requested servings, and steps.",
    params: [["servings", "Whole number, 1–100 (default: recipe's own)"]],
  },
  {
    method: "POST",
    path: "/api/recipes/match",
    summary: "What can I cook? Returns recipes you can make now and ones missing only a few items. Salt, water and optional ingredients never count as missing.",
    body: `{
  "ingredients": ["eggs", "onion", "hari mirch", "dhania", "oil"],
  "diet": "eggetarian",        // optional
  "mealType": "breakfast",     // optional
  "maxMissing": 2              // optional, 0–5
}`,
    response: `{
  "recognized": ["eggs", "onion", "green-chili", "cilantro", "oil"],
  "unrecognized": [],
  "canCook": [{ "recipe": { "id": "masala-omelette", ... }, "matchPercent": 100,
                "missing": [], "optionalMissing": [{ "id": "tomato", "name": "Tomato" }] }],
  "almost":  [{ "recipe": { "id": "egg-curry", ... }, "matchPercent": 50,
                "missing": [{ "id": "tomato", "name": "Tomato" }, ...] }]
}`,
  },
  { method: "GET", path: "/api/stores", summary: "Supported grocery stores and their type (indian, mainstream, warehouse)." },
  {
    method: "POST",
    path: "/api/plans/suggest",
    summary: "Suggest a meal plan using only recipes your chosen stores can supply. Lunch and dinner come with a matching side (rice or roti).",
    body: `{
  "stores": ["kroger", "patel-brothers"],
  "members": 4,
  "mealsPerDay": 2,            // 1 = dinner, 2 = lunch + dinner, 3 = all
  "days": 5,                   // 1–14
  "diet": "vegetarian",        // optional
  "pantry": ["toor-dal"],      // optional: counts as available
  "seed": 1                    // optional: change for a different plan
}`,
    response: `{
  "days": [{ "day": 1, "meals": [{ "mealType": "lunch", "servings": 4,
             "recipes": [{ "id": "rajma", ... }, { "id": "steamed-rice", ... }] }] }],
  "availableRecipeCount": 12,
  "unavailable": [{ "recipe": { "id": "sambar", ... }, "missing": [{ "id": "curry-leaves", ... }] }],
  "warnings": []
}`,
  },
  {
    method: "POST",
    path: "/api/shopping-list",
    summary: "Combined, scaled shopping list for the chosen recipes, grouped by category. Items already at home come back with inPantry: true so you can show them struck through.",
    body: `{
  "items": [{ "recipeId": "dal-tadka", "servings": 4 }, { "recipeId": "jeera-rice", "servings": 8 }],
  "pantry": ["cumin-seeds", "ghee"],   // optional
  "stores": ["kroger"]                 // optional: adds availableAt per item
}`,
    response: `{
  "categories": [{ "category": { "id": "whole-spices", ... }, "items": [
    { "id": "cumin-seeds", "name": "Cumin Seeds", "quantity": "4 tsp",
      "usedIn": ["Dal Tadka", "Jeera Rice"], "optional": false,
      "inPantry": true, "availableAt": ["Kroger"] }] }],
  "summary": { "totalItems": 17, "inPantry": 2, "toBuy": 15 },
  "notSoldAtChosenStores": ["Toor Dal"],
  "assumedAtHome": ["Salt", "Water"]
}`,
  },
];

export default function Docs() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <a href="/" className="text-sm text-muted hover:text-accent">← Back to app</a>
      <h1 className="mt-4 font-display text-4xl font-semibold">Let&apos;s Cook API</h1>
      <p className="mt-2 text-muted">
        A free JSON API for Indian recipes. No key needed. Errors return <code className="rounded bg-surface-2 px-1">{`{ "error": "..." }`}</code> with
        status 400 or 404. Ingredients can be sent as ids, English names or aliases (“aloo”, “jeera”).
      </p>

      <div className="mt-8 space-y-6">
        {endpoints.map((e) => (
          <section key={e.method + e.path} className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="flex flex-wrap items-center gap-2 font-mono text-sm">
              <span className={`rounded-md px-2 py-0.5 font-bold ${e.method === "GET" ? "bg-leaf-soft text-leaf" : "bg-accent-soft text-accent"}`}>{e.method}</span>
              <span className="font-semibold">{e.path}</span>
            </h2>
            <p className="mt-2 text-sm">{e.summary}</p>
            {e.params && (
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                {e.params.map(([name, desc]) => (
                  <div key={name} className="contents">
                    <dt className="font-mono text-accent">{name}</dt>
                    <dd className="text-muted">{desc}</dd>
                  </div>
                ))}
              </dl>
            )}
            {e.body && <Code label="Request body" code={e.body} />}
            {e.response && <Code label="Response" code={e.response} />}
          </section>
        ))}
      </div>
    </div>
  );
}

function Code({ label, code }: { label: string; code: string }) {
  return (
    <div className="mt-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <pre className="overflow-x-auto rounded-xl bg-surface-2 p-3 text-xs leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}
