"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { api, toggleId } from "@/lib/client";
import type { ListItem, ShoppingResponse } from "@/lib/api-types";
import { Button, Card, Empty, ErrorNote, Spinner, Stepper } from "./ui";

interface Props {
  list: ListItem[];
  setList: Dispatch<SetStateAction<ListItem[]>>;
  pantry: string[];
  setPantry: Dispatch<SetStateAction<string[]>>;
  stores: string[];
  onOpenRecipe: (id: string) => void;
  onBrowse: () => void;
}

export function ShoppingList({ list, setList, pantry, setPantry, stores, onOpenRecipe, onBrowse }: Props) {
  const [data, setData] = useState<ShoppingResponse | null>(null);
  const [hideHave, setHideHave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Pantry changes are applied locally (instant strike-through), so they don't trigger a refetch.
  useEffect(() => {
    if (list.length === 0) {
      setData(null);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      api<ShoppingResponse>("/api/shopping-list", {
        items: list.map(({ recipeId, servings }) => ({ recipeId, servings })),
        pantry,
        stores,
      })
        .then((r) => { setData(r); setError(""); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [list, stores]);

  if (list.length === 0) {
    return (
      <Empty icon="🛒" title="Your shopping list is empty">
        <p>Add recipes from <strong>My Kitchen</strong>, or build a meal plan and send it here.</p>
        <Button variant="primary" className="mt-4" onClick={onBrowse}>Find recipes</Button>
      </Empty>
    );
  }

  const items = data?.categories.flatMap((c) => c.items) ?? [];
  const have = (id: string) => pantry.includes(id);
  const toBuy = items.filter((i) => !have(i.id));

  async function copyList() {
    if (!data) return;
    const text = data.categories
      .map((c) => {
        const lines = c.items.filter((i) => !have(i.id)).map((i) => `☐ ${i.name} — ${i.quantity}${i.optional ? " (optional)" : ""}`);
        return lines.length ? `${c.category.name}\n${lines.join("\n")}` : "";
      })
      .filter(Boolean)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy — your browser blocked clipboard access.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <section aria-labelledby="selected-heading" className="no-print">
        <Card className="p-4 sm:p-5 lg:sticky lg:top-24">
          <h2 id="selected-heading" className="font-display text-xl font-semibold">Cooking these</h2>
          <p className="mt-1 text-sm text-muted">Adjust servings — quantities update automatically.</p>
          <ul className="mt-4 divide-y divide-line">
            {list.map((item) => (
              <li key={item.recipeId} className="flex items-center gap-3 py-2.5">
                <button type="button" onClick={() => onOpenRecipe(item.recipeId)} className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:text-accent">{item.name}</button>
                <Stepper
                  label={`servings of ${item.name}`}
                  value={item.servings}
                  max={100}
                  onChange={(n) => setList((l) => l.map((x) => (x.recipeId === item.recipeId ? { ...x, servings: n } : x)))}
                />
                <button type="button" aria-label={`Remove ${item.name}`} onClick={() => setList((l) => l.filter((x) => x.recipeId !== item.recipeId))} className="rounded-lg px-2 py-1 text-muted hover:bg-chili-soft hover:text-chili">✕</button>
              </li>
            ))}
          </ul>
          <Button variant="ghost" className="mt-2 w-full" onClick={() => setList([])}>Clear list</Button>
        </Card>
      </section>

      <section aria-labelledby="list-heading" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="list-heading" className="font-display text-xl font-semibold">Shopping list {loading && <Spinner />}</h2>
            {data && <p className="text-sm text-muted"><strong className="text-ink">{toBuy.length}</strong> to buy · {items.length - toBuy.length} already at home · tick anything you have</p>}
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setHideHave((h) => !h)}>{hideHave ? "Show all" : "Hide what I have"}</Button>
            <Button onClick={copyList}>{copied ? "✓ Copied" : "Copy"}</Button>
            <Button onClick={() => window.print()}>Print</Button>
          </div>
        </div>

        {error && <ErrorNote message={error} />}

        {data && data.notSoldAtChosenStores.filter((n) => toBuy.some((i) => i.name === n)).length > 0 && (
          <p className="mb-4 rounded-xl bg-turmeric-soft px-3 py-2 text-sm">
            ⚠️ Not sold at your chosen stores: <strong>{data.notSoldAtChosenStores.filter((n) => toBuy.some((i) => i.name === n)).join(", ")}</strong>. Try an Indian grocery store.
          </p>
        )}

        <div className="space-y-4">
          {data?.categories.map(({ category, items }) => {
            const shown = hideHave ? items.filter((i) => !have(i.id)) : items;
            if (shown.length === 0) return null;
            return (
              <Card key={category.id} className="overflow-hidden">
                <h3 className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  <span aria-hidden>{category.emoji}</span> {category.name}
                </h3>
                <ul className="divide-y divide-line">
                  {shown.map((item) => {
                    const done = have(item.id);
                    return (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-surface-2">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() => setPantry((p) => toggleId(p, item.id))}
                            className="mt-0.5 size-5 shrink-0 accent-[var(--leaf)]"
                            aria-label={`${item.name}: already at home`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className={`flex flex-wrap items-baseline gap-x-2 ${done ? "text-muted line-through decoration-2" : ""}`}>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-sm tabular-nums text-muted">{item.quantity}</span>
                              {item.optional && <span className="rounded-full bg-surface-2 px-1.5 text-[11px] text-muted">optional</span>}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {done ? "At home" : <>For {item.usedIn.join(", ")}</>}
                              {!done && item.availableAt && (
                                item.availableAt.length
                                  ? <> · <span className="text-leaf">{item.availableAt.join(", ")}</span></>
                                  : <> · <span className="text-chili">not at your stores</span></>
                              )}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })}
        </div>

        {data && (
          <p className="mt-4 text-xs text-muted">Assumed at home: {data.assumedAtHome.join(", ")}. Ticked items are saved as part of your kitchen.</p>
        )}
      </section>
    </div>
  );
}
