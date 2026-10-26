"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { api, toggleId } from "@/lib/client";
import type { Household, ListItem, PlanResponse, StoreInfo } from "@/lib/api-types";
import type { StoreType } from "@/lib/types";
import { Button, Card, DietBadge, DietSelect, Empty, ErrorNote, Segmented, Spinner, Stepper } from "./ui";

const STORE_GROUPS: { type: StoreType; label: string; hint: string }[] = [
  { type: "indian", label: "Indian grocery", hint: "Carries almost everything" },
  { type: "mainstream", label: "Supermarket", hint: "Most basics, few specialty items" },
  { type: "warehouse", label: "Warehouse club", hint: "Bulk staples, limited spices" },
];

const MEAL_ICON = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍵" } as const;

interface Props {
  stores: StoreInfo[];
  household: Household;
  setHousehold: Dispatch<SetStateAction<Household>>;
  pantry: string[];
  onOpenRecipe: (id: string) => void;
  onUsePlan: (items: ListItem[]) => void;
}

export function Planner({ stores, household, setHousehold, pantry, onOpenRecipe, onUsePlan }: Props) {
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [seed, setSeed] = useState(1);
  const [usePantry, setUsePantry] = useState(true);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof Household>(key: K, value: Household[K]) => setHousehold((h) => ({ ...h, [key]: value }));

  async function generate(nextSeed = seed) {
    setLoading(true);
    setError("");
    try {
      const result = await api<PlanResponse>("/api/plans/suggest", {
        stores: household.stores,
        members: household.members,
        mealsPerDay: household.mealsPerDay,
        days: household.days,
        diet: household.diet || undefined,
        pantry: usePantry ? pantry : [],
        seed: nextSeed,
      });
      setPlan(result);
      setSeed(nextSeed);
      setSkipped([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function usePlan() {
    if (!plan) return;
    const totals = new Map<string, ListItem>();
    for (const day of plan.days) {
      for (const meal of day.meals) {
        if (skipped.includes(`${day.day}-${meal.mealType}`)) continue;
        for (const r of meal.recipes) {
          const existing = totals.get(r.id);
          totals.set(r.id, { recipeId: r.id, name: r.name, servings: (existing?.servings ?? 0) + meal.servings });
        }
      }
    }
    onUsePlan([...totals.values()]);
  }

  const mealCount = plan ? plan.days.reduce((n, d) => n + d.meals.filter((m) => m.recipes.length && !skipped.includes(`${d.day}-${m.mealType}`)).length, 0) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <section aria-labelledby="household-heading">
        <Card className="space-y-5 p-4 sm:p-5 lg:sticky lg:top-24">
          <div>
            <h2 id="household-heading" className="font-display text-xl font-semibold">Plan your week</h2>
            <p className="mt-1 text-sm text-muted">Tell us where you shop and who you&apos;re cooking for.</p>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Where do you shop?</legend>
            <div className="space-y-3">
              {STORE_GROUPS.map((g) => {
                const group = stores.filter((s) => s.type === g.type);
                if (!group.length) return null;
                return (
                  <div key={g.type}>
                    <p className="mb-1.5 text-xs text-muted"><span className="font-medium text-ink">{g.label}</span> · {g.hint}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.map((s) => {
                        const on = household.stores.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => update("stores", toggleId(household.stores, s.id))}
                            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${on ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:border-accent"}`}
                          >
                            {on && "✓ "}{s.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="block text-sm font-semibold">People</span>
              <Stepper label="people" value={household.members} onChange={(n) => update("members", n)} max={20} />
            </label>
            <label className="space-y-1.5">
              <span className="block text-sm font-semibold">Days</span>
              <Stepper label="days" value={household.days} onChange={(n) => update("days", n)} max={14} />
            </label>
          </div>

          <div className="space-y-1.5">
            <span className="block text-sm font-semibold">Meals cooked per day</span>
            <Segmented
              label="Meals per day"
              value={household.mealsPerDay}
              onChange={(v) => update("mealsPerDay", v)}
              options={[{ value: 1, label: "Dinner" }, { value: 2, label: "Lunch + dinner" }, { value: 3, label: "All 3" }]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DietSelect value={household.diet} onChange={(v) => update("diet", v as Household["diet"])} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={usePantry} onChange={(e) => setUsePantry(e.target.checked)} className="size-4 accent-[var(--accent)]" />
              Count what&apos;s in my kitchen
            </label>
          </div>

          {error && <ErrorNote message={error} />}
          <Button variant="primary" className="w-full py-2.5" onClick={() => generate()} disabled={loading || household.stores.length === 0}>
            {loading ? <Spinner /> : "✨"} {household.stores.length === 0 ? "Choose a store first" : "Suggest a meal plan"}
          </Button>
        </Card>
      </section>

      <section aria-labelledby="plan-heading" className="min-w-0">
        {!plan ? (
          <Empty icon="🗓️" title="Your plan will appear here">
            We only suggest recipes whose ingredients your chosen stores sell. Pick Patel Brothers or another Indian store to unlock everything.
          </Empty>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="plan-heading" className="font-display text-xl font-semibold">{plan.days.length}-day plan for {plan.settings.members}</h2>
                <p className="text-sm text-muted">{plan.availableRecipeCount} recipes possible with your stores · tap a meal to skip it</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => generate(seed + 1)} disabled={loading}>🔀 Shuffle</Button>
                <Button variant="primary" onClick={usePlan} disabled={mealCount === 0}>Shopping list for {mealCount} meals →</Button>
              </div>
            </div>

            {plan.warnings.map((w) => <p key={w} className="rounded-xl bg-turmeric-soft px-3 py-2 text-sm">⚠️ {w}</p>)}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {plan.days.map((day) => (
                <Card key={day.day} className="p-4">
                  <h3 className="mb-2 font-display font-semibold">Day {day.day}</h3>
                  <ul className="space-y-2">
                    {day.meals.map((meal) => {
                      const key = `${day.day}-${meal.mealType}`;
                      const off = skipped.includes(key);
                      return (
                        <li key={key} className={`rounded-xl bg-surface-2 p-2.5 transition ${off ? "opacity-40" : ""}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted">{MEAL_ICON[meal.mealType]} {meal.mealType}</span>
                            {meal.recipes.length > 0 && (
                              <button type="button" onClick={() => setSkipped((s) => toggleId(s, key))} className="text-xs text-muted underline-offset-2 hover:underline">
                                {off ? "Add back" : "Skip"}
                              </button>
                            )}
                          </div>
                          {meal.recipes.length === 0 ? (
                            <p className="mt-1 text-sm text-muted">No recipe available</p>
                          ) : (
                            <div className={`mt-1 space-y-0.5 ${off ? "line-through" : ""}`}>
                              {meal.recipes.map((r, i) => (
                                <button key={r.id} type="button" onClick={() => onOpenRecipe(r.id)} className={`block text-left text-sm hover:text-accent ${i === 0 ? "font-medium" : "text-muted"}`}>
                                  {i > 0 && "+ "}{r.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              ))}
            </div>

            {plan.unavailable.length > 0 && (
              <details className="rounded-2xl border border-line bg-surface p-4">
                <summary className="cursor-pointer text-sm font-semibold">🔒 {plan.unavailable.length} recipes need items your stores don&apos;t carry</summary>
                <ul className="mt-3 space-y-2">
                  {plan.unavailable.map((u) => (
                    <li key={u.recipe.id} className="flex flex-wrap items-center gap-2 text-sm">
                      <button type="button" onClick={() => onOpenRecipe(u.recipe.id)} className="font-medium hover:text-accent">{u.recipe.name}</button>
                      <DietBadge diet={u.recipe.diet} />
                      <span className="text-muted">needs {u.missing.map((m) => m.name).join(", ")}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted">Tip: add an Indian grocery store, or mark these items as already in your kitchen.</p>
              </details>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
