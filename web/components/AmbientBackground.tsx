// CSS only ambient layer: slow drifting gradient orbs and floating particles
// for depth. No animation libraries, all motion comes from Tailwind keyframes,
// and it honors prefers-reduced-motion via the global rule in globals.css.
const PARTICLES = [
  { c: "bg-base-violet", s: "h-2 w-2", p: "left-[12%] top-[22%]", d: "0s", dur: "9s" },
  { c: "bg-base-pink", s: "h-1.5 w-1.5", p: "left-[26%] top-[68%]", d: "1.2s", dur: "11s" },
  { c: "bg-base-sky", s: "h-2 w-2", p: "left-[58%] top-[16%]", d: "0.6s", dur: "8s" },
  { c: "bg-base-violet", s: "h-1.5 w-1.5", p: "left-[80%] top-[54%]", d: "2s", dur: "12s" },
  { c: "bg-base-pink", s: "h-1.5 w-1.5", p: "left-[44%] top-[40%]", d: "1.6s", dur: "10s" },
  { c: "bg-base-sky", s: "h-2 w-2", p: "left-[92%] top-[30%]", d: "0.9s", dur: "9.5s" },
];

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="orb h-[30rem] w-[30rem] -left-24 -top-16 bg-base-violet/20 animate-drift animate-glow-pulse" />
      <div className="orb h-[26rem] w-[26rem] -right-20 top-[12%] bg-base-pink/15 animate-drift [animation-delay:-6s]" />
      <div className="orb h-[28rem] w-[28rem] left-[28%] -bottom-28 bg-base-sky/15 animate-drift [animation-delay:-11s]" />
      {PARTICLES.map((d, i) => (
        <span
          key={i}
          className={`absolute rounded-full ${d.c} ${d.s} ${d.p} opacity-25 animate-float`}
          style={{ animationDelay: d.d, animationDuration: d.dur }}
        />
      ))}
    </div>
  );
}
