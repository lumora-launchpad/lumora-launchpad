"use client";

import { useState } from "react";

export function ShareButton({
  name,
  symbol,
}: {
  name: string;
  symbol: string;
}) {
  const [copied, setCopied] = useState(false);

  function tweetUrl(): string {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Trading $${symbol} (${name}) on Lumora, a bright bonding curve launchpad on Base.`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(url)}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={tweetUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-base-blue hover:text-base-blue"
      >
        Share on X
      </a>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-base-blue hover:text-base-blue"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
