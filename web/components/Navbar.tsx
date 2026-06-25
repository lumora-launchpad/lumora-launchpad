"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <span className="text-lg font-black">L</span>
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Lumora
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="/" className="transition hover:text-base-blue">
            Explore
          </Link>
          <Link href="/create" className="transition hover:text-base-blue">
            Create
          </Link>
          <Link href="/portfolio" className="transition hover:text-base-blue">
            Portfolio
          </Link>
          <a href="#how-it-works" className="transition hover:text-base-blue">
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/create" className="hidden btn-primary !px-5 !py-2.5 sm:inline-flex">
            Launch
          </Link>
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="address"
          />
        </div>
      </div>
    </header>
  );
}
