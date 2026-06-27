"use client";

import { useState } from "react";

// Shows /hero.png if you drop one into web/public, otherwise a branded panel.
// Replace the file to use your own photo or logo, no code change needed.
export function HeroVisual() {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <div className="relative">
        {/* Slow moving glow behind the image for a living feel */}
        <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-gradient opacity-30 blur-3xl animate-float" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.png"
          alt="Lumora"
          onError={() => setFailed(true)}
          className="aspect-square w-full rounded-3xl object-cover shadow-card animate-float [animation-duration:8s]"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-brand-gradient shadow-glow">
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(60%_60%_at_30%_20%,white,transparent)]" />
      <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl bg-white/20 text-6xl font-black text-white backdrop-blur animate-float">
        L
      </div>
      <div className="absolute bottom-6 left-6 rounded-2xl bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur">
        Lumora
      </div>
      <div className="absolute right-6 top-6 rounded-2xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
        Live on Base
      </div>
    </div>
  );
}
