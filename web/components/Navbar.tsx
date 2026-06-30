"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GlobalSearch } from "./GlobalSearch";
import { GITHUB } from "@/lib/deployments";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Docs", href: "/docs" },
];

const LAUNCH_OPTIONS = [
  {
    label: "Instant Launch",
    href: "/create",
    desc: "Trade from second one",
  },
  {
    label: "Demand Campaign",
    href: "/campaigns",
    desc: "Launch on real demand",
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [launchOpen, setLaunchOpen] = useState(false);

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
          <a
            href={GITHUB.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-base-blue"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <GlobalSearch className="hidden w-48 lg:block" />

          {/* New Launch dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLaunchOpen((v) => !v)}
              aria-expanded={launchOpen}
              className="btn-primary !px-5 !py-2.5"
            >
              New Launch
              <svg
                viewBox="0 0 24 24"
                className={`ml-1.5 h-4 w-4 transition ${launchOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {launchOpen && (
              <>
                <button
                  aria-label="Close menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setLaunchOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card">
                  {LAUNCH_OPTIONS.map((o) => (
                    <Link
                      key={o.href}
                      href={o.href}
                      onClick={() => setLaunchOpen(false)}
                      className="block rounded-xl px-4 py-3 transition hover:bg-slate-50"
                    >
                      <span className="block text-sm font-bold text-slate-800">
                        {o.label}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {o.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

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
            <div className="mb-2">
              <GlobalSearch />
            </div>
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
            <a
              href={GITHUB.repo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-base-blue"
            >
              GitHub
            </a>
            <div className="mt-2 grid gap-2">
              {LAUNCH_OPTIONS.map((o) => (
                <Link
                  key={o.href}
                  href={o.href}
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full"
                >
                  {o.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
