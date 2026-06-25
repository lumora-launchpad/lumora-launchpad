import Link from "next/link";
import { LiveTokenGrid } from "@/components/LiveTokenGrid";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="relative py-16 sm:py-24">
        <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-gradient opacity-20 blur-3xl animate-float" />
        <div className="mx-auto max-w-3xl text-center">
          <span className="pill mx-auto">
            <span className="h-2 w-2 rounded-full bg-base-mint" />
            Live di Base
          </span>
          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Luncurkan token kamu
            <br />
            <span className="gradient-text">dalam hitungan detik</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500">
            Bonding curve yang adil, likuiditas otomatis ke Uniswap, dan biaya
            kreasi nyaris nol. Cerah, cepat, transparan.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/create" className="btn-primary w-full sm:w-auto">
              Buat token sekarang
            </Link>
            <a href="#jelajah" className="btn-ghost w-full sm:w-auto">
              Lihat yang sedang naik
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { k: "Fee trading", v: "1%" },
              { k: "Bagian creator", v: "35%" },
              { k: "Likuiditas", v: "Auto" },
            ].map((s) => (
              <div key={s.k} className="card py-5 text-center">
                <p className="text-3xl font-black gradient-text">{s.v}</p>
                <p className="mt-1 text-xs font-medium text-slate-400">{s.k}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore */}
      <section id="jelajah" className="py-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              Sedang <span className="gradient-text">menyala</span>
            </h2>
            <p className="mt-1 text-slate-500">
              Token terbaru yang diluncurkan komunitas.
            </p>
          </div>
          <Link
            href="/create"
            className="hidden text-sm font-bold text-base-blue hover:underline sm:block"
          >
            Luncurkan punyamu
          </Link>
        </div>

        <LiveTokenGrid />
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="py-16">
        <h2 className="text-center text-3xl font-black tracking-tight">
          Tiga langkah <span className="gradient-text">selesai</span>
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Buat",
              d: "Isi nama dan simbol token. Kontrak terdeploy otomatis dengan kurva harga yang adil.",
            },
            {
              n: "02",
              t: "Trade",
              d: "Siapa pun bisa beli dan jual di kurva. Setiap transaksi membayar fee 1 persen.",
            },
            {
              n: "03",
              t: "Graduate",
              d: "Saat target tercapai, likuiditas pindah ke Uniswap dan LP dikunci selamanya.",
            },
          ].map((step) => (
            <div key={step.n} className="card">
              <span className="text-sm font-black text-base-blue">{step.n}</span>
              <h3 className="mt-2 text-xl font-bold">{step.t}</h3>
              <p className="mt-2 text-sm text-slate-500">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fee model */}
      <section className="pb-20">
        <div className="card overflow-hidden bg-brand-gradient !p-0 text-white">
          <div className="grid gap-8 p-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-black">Model fee yang jujur</h2>
              <p className="mt-3 text-white/80">
                Tidak ada biaya tersembunyi. Setiap trade membayar 1 persen,
                dibagi transparan di dalam smart contract.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/15 p-6 backdrop-blur">
                <p className="text-4xl font-black">65%</p>
                <p className="mt-1 text-sm text-white/80">Developer</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-6 backdrop-blur">
                <p className="text-4xl font-black">35%</p>
                <p className="mt-1 text-sm text-white/80">Creator</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
