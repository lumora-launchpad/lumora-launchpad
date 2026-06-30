"use client";

import { useCallback, useEffect, useState } from "react";

// Local user preferences (profile and notification settings), persisted in
// localStorage. A custom event keeps every component in sync on the same page.
const KEY = "lumora:prefs";
const EVENT = "lumora:prefs";

export type NotifPrefs = {
  milestones: boolean;
  launches: boolean;
  refunds: boolean;
  featured: boolean;
};

export type Prefs = {
  username: string;
  notif: NotifPrefs;
};

const DEFAULTS: Prefs = {
  username: "",
  notif: { milestones: true, launches: true, refunds: true, featured: true },
};

function read(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      username: p.username ?? "",
      notif: { ...DEFAULTS.notif, ...(p.notif ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

function write(p: Prefs) {
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event(EVENT));
}

export function usePrefs(): {
  prefs: Prefs;
  setUsername: (v: string) => void;
  toggleNotif: (k: keyof NotifPrefs) => void;
} {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    setPrefs(read());
    const sync = () => setPrefs(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setUsername = useCallback((v: string) => {
    const cur = read();
    write({ ...cur, username: v.slice(0, 24) });
  }, []);

  const toggleNotif = useCallback((k: keyof NotifPrefs) => {
    const cur = read();
    write({ ...cur, notif: { ...cur.notif, [k]: !cur.notif[k] } });
  }, []);

  return { prefs, setUsername, toggleNotif };
}
