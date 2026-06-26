"use client";

import { useWatchlist } from "@/lib/useWatchlist";

// A watchlist star. Safe to render inside a Link: it prevents the click from
// navigating. Filled amber when saved, outline otherwise.
export function StarButton({
  address,
  className = "",
}: {
  address: string;
  className?: string;
}) {
  const { has, toggle } = useWatchlist();
  const active = has(address);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(address);
      }}
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
      className={`grid h-8 w-8 place-items-center rounded-xl transition ${
        active
          ? "text-amber-400"
          : "text-slate-300 hover:bg-slate-100 hover:text-amber-400"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.77 6.2 20.84l1.11-6.46-4.7-4.58 6.49-.94L12 2.5z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
