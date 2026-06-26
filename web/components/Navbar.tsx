"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Create", href: "/create" },
  { label: "Portfolio", href: "/portfolio" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <span className="text-lg font-black">L</span>
          </span>
          <span className="text-lg font-extrabold tracking-tight">Lumora</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-base-blue">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/create" className="hidden btn-primary !px-5 !py-2.5 sm:inline-flex">
            Launch
          </Link>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-base-blue"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/create"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 w-full"
            >
              Launch
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
