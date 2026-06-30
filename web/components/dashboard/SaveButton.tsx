"use client";

import { useWatchlist } from "@/lib/useWatchlist";
import { Icon } from "./icons";

// A star toggle that saves a campaign to the local watchlist. Stops the click
// from bubbling so it works inside a card that is itself a link.
export function SaveButton({
  itemKey,
  className = "",
}: {
  itemKey: string;
  className?: string;
}) {
  const { has, toggle } = useWatchlist();
  const active = has(itemKey);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from watchlist" : "Save to watchlist"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(itemKey);
      }}
      className={`grid h-8 w-8 place-items-center rounded-full backdrop-blur transition ${
        active
          ? "bg-white text-amber-500"
          : "bg-slate-900/30 text-white hover:bg-slate-900/50"
      } ${className}`}
    >
      <Icon name="star" className={`h-4 w-4 ${active ? "fill-amber-400" : ""}`} />
    </button>
  );
}
