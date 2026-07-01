"use client";

import { useEffect, useState } from "react";

// A live Days / Hours / Min / Sec countdown to a unix timestamp. Time dependent
// text uses suppressHydrationWarning so the server and first client render can
// differ by the network latency without a hydration error.
export function PhaseCountdown({
  to,
  className = "",
}: {
  to: number;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Server and first client render show a stable placeholder (no time read), so
  // there is no hydration mismatch. After mount the effect fills in live values.
  const labels = ["Days", "Hrs", "Min", "Sec"];
  let cells: string[];
  if (now === null) {
    cells = ["--", "--", "--", "--"];
  } else {
    const left = Math.max(0, to * 1000 - now);
    cells = [
      Math.floor(left / 86400000),
      Math.floor((left % 86400000) / 3600000),
      Math.floor((left % 3600000) / 60000),
      Math.floor((left % 60000) / 1000),
    ].map((v) => String(v).padStart(2, "0"));
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {cells.map((v, i) => (
        <div key={labels[i]} className="text-center">
          <div className="min-w-12 rounded-xl bg-white/20 px-2.5 py-2 text-2xl font-black tabular-nums backdrop-blur">
            {v}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wide opacity-80">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}
