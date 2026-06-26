"use client";

import { useCallback, useEffect, useState } from "react";

// A tiny watchlist persisted in localStorage. A custom event keeps every star
// button and the grid in sync across the page without a global store.
const KEY = "lumora:watchlist";
const EVENT = "lumora:watchlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function useWatchlist(): {
  list: string[];
  has: (addr: string) => boolean;
  toggle: (addr: string) => void;
} {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    setList(read());
    const sync = () => setList(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((addr: string) => {
    const a = addr.toLowerCase();
    const cur = read();
    write(cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]);
  }, []);

  const has = useCallback(
    (addr: string) => list.includes(addr.toLowerCase()),
    [list],
  );

  return { list, has, toggle };
}
