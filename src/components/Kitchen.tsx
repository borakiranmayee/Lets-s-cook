"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { api, toggleId } from "@/lib/client";
import type { CategoryWithCount, Ingredient, ListItem, MatchResponse, RecipeMatch, RecipeSummary } from "@/lib/api-types";
import { Button, Card, DietBadge, DietSelect, Empty, ErrorNote, Spinner } from "./ui";

const SPICE_BOX = ["turmeric", "red-chili-powder", "cumin-seeds", "mustard-seeds", "coriander-powder", "garam-masala", "oil"];

interface Props {
  ingredients: Ingredient[];
  categories: CategoryWithCount[];
  pantry: string[];
  setPantry: Dispatch<SetStateAction<string[]>>;
  list: ListItem[];
  onOpenRecipe: (id: string) => void;
  onAddToList: (recipe: RecipeSummary) => void;
}

export function Kitchen({ ingredients, categories, pantry, setPantry, list, onOpenRecipe, onAddToList }: Props) {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter((i) => [i.name, ...i.aliases].some((n) => n.toLowerCase().includes(q)));
  }, [ingredients, query]);

  const choosable = pantry.filter((id) => !ingredients.find((i) => i.id === id)?.staple);

  useEffect(() => {
    if (choosable.length === 0) {
      setResult(null);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      api<MatchResponse>("/api/recipes/match", { ingredients: pantry, diet: diet || undefined, maxMissing: 3 })
        .then((r) => { setResult(r); setError(""); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [pantry, diet]);

  const toggle = (id: string, on?: boolean) => setPantry((p) => toggleId(p, id, on));
  const inList = (id: string) => list.some((l) => l.recipeId === id);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section aria-labelledby="pantry-heading">
        <Card className="p-4 sm:p-5 lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="pantry-heading" className="font-display text-xl font-semibold">What&apos;s in your kitchen?</h2>
            <span className="text-sm text-muted tabular-nums">{choosable.length} selected</span>
          </div>
          <p className="mt-1 text-sm text-muted">Tap what you have. Search in English, Hindi or regional names — try “aloo”, “jeera” or “kandi pappu”.</p>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ingredients…"
            className="mt-4 w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => setPantry((p) => [...new Set([...p, ...SPICE_BOX])])}>+ Masala dabba basics</Button>
            {choosable.length > 0 && <Button variant="ghost" onClick={() => setPantry([])}>Clear all</Button>}
          </div>

          <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1 lg:max-h-[calc(100vh-22rem)]">
            {categories.map((cat) => {
              const items = visible.filter((i) => i.category === cat.id && !i.staple);
              if (items.length === 0) return null;
              const count = items.filter((i) => pantry.includes(i.id)).length;
              return (
                <div key={cat.id}>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    <span aria-hidden>{cat.emoji}</span> {cat.name}
                    {count > 0 && <span className="rounded-full bg-accent-soft px-1.5 text-accent">{count}</span>}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((ing) => {
                      const on = pantry.includes(ing.id);
                      return (
                        <button
                          key={ing.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(ing.id)}
                          title={ing.aliases.length ? `Also: ${ing.aliases.join(", ")}` : undefined}
                          className={`rounded-full border px-3 py-1 text-sm transition ${on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:border-accent"}`}
                        >
                          {on && <span aria-hidden>✓ </span>}{ing.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {visible.length === 0 && <p className="text-sm text-muted">No ingredient matches “{query}”.</p>}
          </div>
        </Card>
      </section>

      <section aria-labelledby="results-heading" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="results-heading" className="font-display text-xl font-semibold">
            Recipes for you {loading && <Spinner />}
          </h2>
          <DietSelect value={diet} onChange={setDiet} />
        </div>
        {error && <ErrorNote message={error} />}

        {!result && (
          <Empty icon="🍲" title="Start by picking ingredients">
            Choose what you have on the left and we&apos;ll show what you can cook right now — and what you&apos;re only an item or two away from.
          </Empty>
        )}

        {result && (
          <div className="space-y-8">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-leaf">✓ Ready to cook ({result.canCook.length})</h3>
              {result.canCook.length === 0 ? (
                <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">Nothing fully covered yet — check the “almost there” list below.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.canCook.map((m) => <MatchCard key={m.recipe.id} match={m} inList={inList(m.recipe.id)} onOpen={onOpenRecipe} onAdd={onAddToList} onHave={(id) => toggle(id, true)} />)}
                </div>
              )}
            </div>
            {result.almost.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-turmeric">Almost there ({result.almost.length})</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.almost.map((m) => <MatchCard key={m.recipe.id} match={m} inList={inList(m.recipe.id)} onOpen={onOpenRecipe} onAdd={onAddToList} onHave={(id) => toggle(id, true)} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function MatchCard({ match, inList, onOpen, onAdd, onHave }: { match: RecipeMatch; inList: boolean; onOpen: (id: string) => void; onAdd: (r: RecipeSummary) => void; onHave: (id: string) => void }) {
  const { recipe, matchPercent, missing, optionalMissing } = match;
  const ready = missing.length === 0;
  return (
    <Card className="flex flex-col p-4 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => onOpen(recipe.id)} className="text-left">
          <h4 className="font-display text-lg font-semibold leading-tight hover:text-accent">{recipe.name}</h4>
        </button>
        <DietBadge diet={recipe.diet} />
      </div>
      <p className="mt-1 text-xs text-muted">{recipe.region} · {recipe.totalMinutes} min · {recipe.course === "side" ? "Side" : recipe.mealTypes.join(", ")}</p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2" role="meter" aria-valuenow={matchPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Ingredients you have">
        <div className={`h-full rounded-full ${ready ? "bg-leaf" : "bg-turmeric"}`} style={{ width: `${matchPercent}%` }} />
      </div>

      {missing.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted">Missing — tap if you actually have it:</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {missing.map((i) => (
              <button key={i.id} type="button" onClick={() => onHave(i.id)} className="rounded-full bg-chili-soft px-2.5 py-0.5 text-xs font-medium text-chili hover:brightness-95">
                {i.name} <span aria-hidden>+</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {optionalMissing.length > 0 && (
        <p className="mt-2 text-xs text-muted">Nice to have: {optionalMissing.map((i) => i.name).join(", ")}</p>
      )}

      <div className="mt-auto flex gap-2 pt-4">
        <Button variant="ghost" className="flex-1" onClick={() => onOpen(recipe.id)}>View recipe</Button>
        <Button className={`flex-1 ${inList ? "" : "hover:border-accent hover:text-accent"}`} onClick={() => onAdd(recipe)} disabled={inList}>
          {inList ? "✓ In list" : "+ Add to list"}
        </Button>
      </div>
    </Card>
  );
}
