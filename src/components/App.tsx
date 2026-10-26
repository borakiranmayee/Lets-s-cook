"use client";

import { useEffect, useState } from "react";
import { api, useStoredState } from "@/lib/client";
import type { CategoryWithCount, Household, Ingredient, ListItem, RecipeSummary, StoreInfo } from "@/lib/api-types";
import { Kitchen } from "./Kitchen";
import { Planner } from "./Planner";
import { RecipeModal } from "./RecipeModal";
import { ShoppingList } from "./ShoppingList";
import { ErrorNote, Spinner } from "./ui";

type Tab = "kitchen" | "plan" | "list";

const DEFAULT_HOUSEHOLD: Household = { stores: [], members: 2, mealsPerDay: 2, days: 5, diet: "" };

export function App() {
  const [tab, setTab] = useStoredState<Tab>("lc:tab", "kitchen");
  const [pantry, setPantry] = useStoredState<string[]>("lc:pantry", []);
  const [list, setList] = useStoredState<ListItem[]>("lc:list", []);
  const [household, setHousehold] = useStoredState<Household>("lc:household", DEFAULT_HOUSEHOLD);
  const [openRecipe, setOpenRecipe] = useState<string | null>(null);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Promise.all([
      api<Ingredient[]>("/api/ingredients"),
      api<CategoryWithCount[]>("/api/categories"),
      api<StoreInfo[]>("/api/stores"),
    ])
      .then(([i, c, s]) => { setIngredients(i); setCategories(c); setStores(s); })
      .catch((e) => setLoadError(e.message));
  }, []);

  function addToList(recipe: RecipeSummary, servings = household.members) {
    setList((l) =>
      l.some((x) => x.recipeId === recipe.id)
        ? l.map((x) => (x.recipeId === recipe.id ? { ...x, servings } : x))
        : [...l, { recipeId: recipe.id, name: recipe.name, servings }],
    );
  }

  const tabs: { id: Tab; label: string; short: string; icon: string; badge?: number }[] = [
    { id: "kitchen", label: "My Kitchen", short: "Kitchen", icon: "🧺" },
    { id: "plan", label: "Plan Meals", short: "Plan", icon: "🗓️" },
    { id: "list", label: "Shopping List", short: "List", icon: "🛒", badge: list.length || undefined },
  ];

  const ready = ingredients.length > 0;

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-lg" aria-hidden>🍛</span>
            <span className="font-display text-xl font-semibold tracking-tight">Let&apos;s Cook</span>
          </a>
          <nav className="order-last flex w-full gap-1 rounded-2xl bg-surface-2 p-1 sm:order-none sm:w-auto" aria-label="Sections">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition sm:flex-none ${tab === t.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
              >
                <span aria-hidden>{t.icon}</span>
                <span className="whitespace-nowrap sm:hidden">{t.short}</span>
                <span className="hidden whitespace-nowrap sm:inline">{t.label}</span>
                {t.badge && <span className="rounded-full bg-accent px-1.5 text-xs text-accent-ink tabular-nums">{t.badge}</span>}
              </button>
            ))}
          </nav>
          <a href="/docs" className="text-sm text-muted hover:text-accent">API docs</a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {loadError && <ErrorNote message={`Couldn't load data: ${loadError}`} />}
        {!ready && !loadError && <div className="flex justify-center py-20 text-muted"><Spinner /></div>}

        {ready && tab === "kitchen" && (
          <Kitchen
            ingredients={ingredients}
            categories={categories}
            pantry={pantry}
            setPantry={setPantry}
            list={list}
            onOpenRecipe={setOpenRecipe}
            onAddToList={(r) => addToList(r)}
          />
        )}
        {ready && tab === "plan" && (
          <Planner
            stores={stores}
            household={household}
            setHousehold={setHousehold}
            pantry={pantry}
            onOpenRecipe={setOpenRecipe}
            onUsePlan={(items) => { setList(items); setTab("list"); }}
          />
        )}
        {ready && tab === "list" && (
          <ShoppingList
            list={list}
            setList={setList}
            pantry={pantry}
            setPantry={setPantry}
            stores={household.stores}
            onOpenRecipe={setOpenRecipe}
            onBrowse={() => setTab("kitchen")}
          />
        )}
      </main>

      <footer className="no-print mx-auto max-w-7xl px-4 pb-10 pt-4 text-xs text-muted sm:px-6">
        Store availability is a best-effort estimate and varies by location. Your kitchen and list are saved in this browser only.
      </footer>

      {openRecipe && (
        <RecipeModal
          key={openRecipe}
          recipeId={openRecipe}
          defaultServings={list.find((l) => l.recipeId === openRecipe)?.servings ?? household.members}
          pantry={pantry}
          inList={list.some((l) => l.recipeId === openRecipe)}
          onAdd={addToList}
          onClose={() => setOpenRecipe(null)}
        />
      )}
    </div>
  );
}
