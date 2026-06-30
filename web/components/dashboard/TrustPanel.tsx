import { Icon } from "./icons";

const POINTS = [
  "Token launches only after demand is proven.",
  "If the campaign fails, every supporter can withdraw one hundred percent of their ETH.",
  "No presale.",
  "No insider allocation.",
  "Fair launch for everyone.",
  "Non custodial.",
  "Transparent.",
];

export function TrustPanel() {
  return (
    <section className="glass-card p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
          <Icon name="check" className="h-5 w-5" />
        </span>
        <h2 className="text-base font-black tracking-tight text-slate-900">
          Support with Confidence
        </h2>
      </div>
      <ul className="mt-4 space-y-3">
        {POINTS.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-slate-600">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-base-mint" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
