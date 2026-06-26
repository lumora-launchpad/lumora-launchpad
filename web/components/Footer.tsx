export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-white/50 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient text-xs font-black text-white">
            L
          </span>
          <span className="font-semibold text-slate-700">Lumora Launchpad</span>
        </div>
        <p className="text-center">
          Built on Base. 1 percent trading fee, split 65 developer and 35 creator.
        </p>
        <p>2026 Lumora</p>
      </div>
    </footer>
  );
}
