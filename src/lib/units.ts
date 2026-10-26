import type { Unit } from "./types";

export interface Amount {
  qty: number;
  unit: Unit;
}

const GRAMS: Partial<Record<Unit, number>> = { g: 1, kg: 1000 };
const MILLILITRES: Partial<Record<Unit, number>> = { ml: 1, l: 1000, tsp: 5, tbsp: 15, cup: 240 };

const PLURALS: Partial<Record<Unit, string>> = {
  cup: "cups",
  clove: "cloves",
  inch: "inches",
  sprig: "sprigs",
  pinch: "pinches",
  handful: "handfuls",
};

/** Rounds to a fraction a cook can measure (quarters for most units). */
function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function scaleAmount({ qty, unit }: Amount, factor: number): Amount {
  if (unit === "to taste" || qty === 0) return { qty: 0, unit };
  const scaled = qty * factor;
  if (unit in GRAMS || unit === "ml") return { qty: Math.max(1, Math.round(scaled)), unit };
  const whole = unit === "pinch" || unit === "clove" || unit === "sprig" || (unit === "piece" && scaled >= 2);
  const step = whole ? 1 : unit === "piece" || unit === "inch" ? 0.5 : 0.25;
  return { qty: Math.max(step, roundTo(scaled, step)), unit };
}

/** Converts weights and volumes to a friendly unit (grams → kg, tsp → tbsp/cups). */
function friendly(amount: Amount): Amount {
  if (amount.unit === "g") {
    return amount.qty >= 1000
      ? { qty: roundTo(amount.qty / 1000, 0.1), unit: "kg" }
      : { qty: Math.max(5, roundTo(amount.qty, 5)), unit: "g" };
  }
  if (amount.unit === "ml") {
    // Use the largest unit that measures the amount (nearly) exactly; above a
    // cup, a quarter-cup rounding is close enough.
    const ml = amount.qty;
    const cups = ml / 240;
    const tbsp = ml / 15;
    const exact = (n: number, step: number) => Math.abs(n - roundTo(n, step)) < 0.05 * step;
    if (cups >= 1 || (cups >= 0.25 && exact(cups, 0.25))) return { qty: roundTo(cups, 0.25), unit: "cup" };
    if (tbsp >= 1 && exact(tbsp, 0.5)) return { qty: roundTo(tbsp, 0.5), unit: "tbsp" };
    if (tbsp >= 4) return { qty: roundTo(tbsp, 0.5), unit: "tbsp" };
    return { qty: Math.max(0.25, roundTo(ml / 5, 0.25)), unit: "tsp" };
  }
  return amount;
}

/**
 * Adds up amounts of one ingredient: weights together, volumes together, and
 * count units (pieces, cloves…) per unit. "To taste" is kept only when there
 * is nothing else to show.
 */
export function combineAmounts(amounts: Amount[]): Amount[] {
  let grams = 0;
  let millilitres = 0;
  const counts = new Map<Unit, number>();
  let toTaste = false;

  for (const { qty, unit } of amounts) {
    if (unit === "to taste") toTaste = true;
    else if (GRAMS[unit]) grams += qty * GRAMS[unit]!;
    else if (MILLILITRES[unit]) millilitres += qty * MILLILITRES[unit]!;
    else counts.set(unit, (counts.get(unit) ?? 0) + qty);
  }

  const result: Amount[] = [];
  if (grams) result.push(friendly({ qty: grams, unit: "g" }));
  if (millilitres) result.push(friendly({ qty: millilitres, unit: "ml" }));
  for (const [unit, qty] of counts) result.push({ qty, unit });
  if (result.length === 0 && toTaste) result.push({ qty: 0, unit: "to taste" });
  return result;
}

const FRACTIONS: Record<string, string> = { "0.25": "¼", "0.5": "½", "0.75": "¾" };

export function formatNumber(n: number): string {
  const whole = Math.floor(n);
  const frac = Math.round((n - whole) * 100) / 100;
  if (frac === 0) return String(whole);
  const symbol = FRACTIONS[String(frac)];
  if (symbol) return whole ? `${whole}${symbol}` : symbol;
  return String(Math.round(n * 10) / 10);
}

export function formatAmount({ qty, unit }: Amount): string {
  if (unit === "to taste") return "to taste";
  const number = formatNumber(qty);
  if (unit === "piece") return number;
  const label = qty > 1 && PLURALS[unit] ? PLURALS[unit] : unit;
  return `${number} ${label}`;
}

export const formatAmounts = (amounts: Amount[]) => amounts.map(formatAmount).join(" + ");
