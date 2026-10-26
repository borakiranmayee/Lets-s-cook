"use client";

import { useEffect, useState } from "react";

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, body === undefined ? undefined : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json as T;
}

/** useState that is saved to localStorage. Storage failures are ignored. */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, loaded]);

  return [value, setValue, loaded] as const;
}

/** Adds or removes an id from a list (pass `on` to force a state). */
export function toggleId(list: string[], id: string, on?: boolean): string[] {
  const has = list.includes(id);
  const want = on ?? !has;
  if (want === has) return list;
  return want ? [...list, id] : list.filter((v) => v !== id);
}
