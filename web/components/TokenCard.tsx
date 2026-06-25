import Link from "next/link";
import type { TokenView } from "@/lib/tokens";

export function TokenCard({ token }: { token: TokenView }) {
  return (
    <Link
      href={`/token/${token.address}`}
      className="card group block transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="flex items-center gap-4">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${token.accent} text-xl font-black text-white shadow-glow`}
        >
          {token.symbol.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold leading-tight">
            {token.name}
          </h3>
          <p className="text-sm font-medium text-slate-400">${token.symbol}</p>
        </div>
        {token.graduated && (
          <span className="ml-auto rounded-full bg-base-mint/15 px-3 py-1 text-xs font-bold text-base-mint">
            Listed
          </span>
        )}
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-slate-500">
        {token.blurb ?? "Live token on the Base curve."}
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Curve progress</span>
          <span className="font-bold text-slate-700">
            {Math.round(token.progress)}%
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${token.accent}`}
            style={{ width: `${Math.min(token.progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="pill">Raised {token.marketCap}</span>
        <span className="text-sm font-bold text-base-blue transition group-hover:translate-x-1">
          Trade
        </span>
      </div>
    </Link>
  );
}
