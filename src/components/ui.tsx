"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Diet } from "@/lib/types";

type Variant = "primary" | "secondary" | "ghost";

export function Button({ variant = "secondary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: "bg-accent text-accent-ink hover:brightness-110 shadow-sm",
    secondary: "bg-surface border border-line hover:bg-surface-2",
    ghost: "hover:bg-surface-2 text-muted hover:text-ink",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>;
}

const DIET_STYLE: Record<Diet, { label: string; className: string }> = {
  vegan: { label: "Vegan", className: "bg-leaf-soft text-leaf" },
  vegetarian: { label: "Veg", className: "bg-leaf-soft text-leaf" },
  eggetarian: { label: "Egg", className: "bg-turmeric-soft text-ink" },
  "non-vegetarian": { label: "Non-veg", className: "bg-chili-soft text-chili" },
};

export function DietBadge({ diet }: { diet: Diet }) {
  const s = DIET_STYLE[diet];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${s.className}`}>{s.label}</span>;
}

export function Stepper({ value, onChange, min = 1, max = 20, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-line bg-surface" role="group" aria-label={label}>
      <button type="button" className="px-3 py-1.5 text-lg leading-none text-muted hover:text-ink disabled:opacity-30" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Decrease ${label}`}>−</button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button type="button" className="px-3 py-1.5 text-lg leading-none text-muted hover:text-ink disabled:opacity-30" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Increase ${label}`}>+</button>
    </div>
  );
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <div className="text-4xl" aria-hidden>{icon}</div>
      <p className="mt-3 font-display text-lg font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Spinner() {
  return <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-label="Loading" />;
}

export function ErrorNote({ message }: { message: string }) {
  return <p className="rounded-xl bg-chili-soft px-3 py-2 text-sm text-chili">{message}</p>;
}

export function Segmented<T extends string | number>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-surface-2 p-1" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition ${o.value === value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const DIET_OPTIONS = [
  { value: "", label: "Any diet" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "eggetarian", label: "Veg + eggs" },
  { value: "non-vegetarian", label: "Non-veg" },
] as const;

export function DietSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Diet"
      className="rounded-xl border border-line bg-surface px-3 py-2 text-sm"
    >
      {DIET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
