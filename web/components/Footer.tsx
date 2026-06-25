export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-white/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient text-xs font-black text-white">
            L
          </span>
          <span className="font-semibold text-slate-700">Lumora Launchpad</span>
        </div>
        <p className="text-center">
          Dibangun di atas Base. Fee trading 1 persen, dibagi 65 developer dan 35 creator.
        </p>
        <p>2026 Lumora</p>
      </div>
    </footer>
  );
}
