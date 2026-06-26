"use client";

import { useEffect, useState } from "react";

// A live countdown to a unix deadline (seconds). Updates every second.
export function Countdown({
  deadline,
  className = "",
}: {
  deadline: number;
  className?: string;
}) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const left = deadline - now;
  if (left <= 0) return <span className={className}>ended</span>;

  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  const text =
    d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;

  return <span className={className}>{text} left</span>;
}
