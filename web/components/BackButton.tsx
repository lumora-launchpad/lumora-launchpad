"use client";

import { useRouter } from "next/navigation";

// A simple back affordance for sub pages. Goes to the previous page in history,
// or to a fallback route if there is none.
export function BackButton({
  label = "Back",
  fallback = "/explore",
}: {
  label?: string;
  fallback?: string;
}) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(fallback);
  }

  return (
    <button
      onClick={goBack}
      className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-base-blue"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </button>
  );
}
