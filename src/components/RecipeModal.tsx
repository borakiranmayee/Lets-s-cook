"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client";
import type { RecipeDetail, RecipeSummary } from "@/lib/api-types";
import { Button, DietBadge, ErrorNote, Spinner, Stepper } from "./ui";

interface Props {
  recipeId: string;
  defaultServings: number;
  pantry: string[];
  inList: boolean;
  onAdd: (recipe: RecipeSummary, servings: number) => void;
  onClose: () => void;
}

export function RecipeModal({ recipeId, defaultServings, pantry, inList, onAdd, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [servings, setServings] = useState(defaultServings);
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    api<RecipeDetail>(`/api/recipes/${recipeId}?servings=${servings}`)
      .then((r) => { setRecipe(r); setError(""); })
      .catch((e) => setError(e.message));
  }, [recipeId, servings]);

  const shown = recipe?.ingredients.filter((i) => !(i.staple && i.id === "water")) ?? [];

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="m-auto max-h-[90vh] w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div className="min-w-0">
            {recipe ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-semibold">{recipe.name}</h2>
                  <DietBadge diet={recipe.diet} />
                </div>
                <p className="mt-1 text-sm text-muted">{recipe.description}</p>
                <p className="mt-2 text-xs text-muted">{recipe.region} · Prep {recipe.prepMinutes} min · Cook {recipe.cookMinutes} min</p>
              </>
            ) : error ? <ErrorNote message={error} /> : <Spinner />}
          </div>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="rounded-full px-2.5 py-1 text-xl text-muted hover:bg-surface-2">×</button>
        </header>

        {recipe && (
          <div className="overflow-y-auto p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold">Ingredients</h3>
              <div className="flex items-center gap-2 text-sm text-muted">
                Servings <Stepper label="servings" value={servings} onChange={setServings} max={50} />
              </div>
            </div>
            <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {shown.map((i) => {
                const have = i.staple || pantry.includes(i.id);
                return (
                  <li key={i.id} className="flex items-baseline gap-2 text-sm">
                    <span aria-label={have ? "You have this" : "You need this"} className={have ? "text-leaf" : "text-chili"}>{have ? "✓" : "○"}</span>
                    <span>
                      <span className="font-medium">{i.name}</span>{" "}
                      <span className="tabular-nums text-muted">{i.quantity}</span>
                      {i.optional && <span className="text-xs text-muted"> (optional)</span>}
                      {i.note && <span className="block text-xs text-muted">{i.note}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>

            <h3 className="mt-6 font-display text-lg font-semibold">Method</h3>
            <ol className="mt-3 space-y-3">
              {recipe.steps.map((step, n) => (
                <li key={n} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">{n + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {recipe && (
          <footer className="flex justify-end gap-2 border-t border-line p-4">
            <Button variant="ghost" onClick={() => dialog.current?.close()}>Close</Button>
            <Button variant="primary" onClick={() => { onAdd(recipe, servings); dialog.current?.close(); }}>
              {inList ? `Update list (${servings} servings)` : `+ Add to shopping list`}
            </Button>
          </footer>
        )}
      </div>
    </dialog>
  );
}
