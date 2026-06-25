"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FACTORY_ADDRESS, factoryAbi } from "@/lib/contracts";

export default function CreatePage() {
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [blurb, setBlurb] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !symbol) return;
    writeContract({
      address: FACTORY_ADDRESS,
      abi: factoryAbi,
      functionName: "createToken",
      args: [name, symbol.toUpperCase()],
    });
  }

  const preview = symbol ? symbol.toUpperCase().slice(0, 2) : "LU";

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-black tracking-tight">
          Buat <span className="gradient-text">token baru</span>
        </h1>
        <p className="mt-3 text-slate-500">
          Deploy kurva harga sendiri di Base. Tanpa coding, langsung jalan.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="card lg:col-span-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Nama token</span>
            <input
              className="field mt-2"
              placeholder="Contoh Aurora"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">Simbol</span>
            <input
              className="field mt-2 uppercase"
              placeholder="AUR"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
              maxLength={8}
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">
              Deskripsi singkat
            </span>
            <textarea
              className="field mt-2 min-h-24 resize-none"
              placeholder="Ceritakan token kamu dalam satu kalimat."
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              maxLength={140}
            />
            <span className="mt-1 block text-right text-xs text-slate-400">
              Deskripsi disimpan off chain di versi berikutnya.
            </span>
          </label>

          <div className="mt-6">
            {!isConnected ? (
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            ) : (
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isPending || isConfirming || !name || !symbol}
              >
                {isPending
                  ? "Konfirmasi di wallet"
                  : isConfirming
                    ? "Memproses transaksi"
                    : "Luncurkan token"}
              </button>
            )}
          </div>

          {isSuccess && (
            <p className="mt-4 rounded-2xl bg-base-mint/10 px-4 py-3 text-center text-sm font-semibold text-base-mint">
              Token berhasil diluncurkan. Cek transaksi di wallet kamu.
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-2xl bg-base-pink/10 px-4 py-3 text-center text-sm font-semibold text-base-pink">
              {error.message.slice(0, 120)}
            </p>
          )}
        </form>

        {/* Live preview */}
        <div className="lg:col-span-2">
          <div className="card sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pratinjau
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-2xl font-black text-white shadow-glow">
                {preview}
              </div>
              <div>
                <h3 className="text-xl font-bold">{name || "Nama token"}</h3>
                <p className="text-sm font-medium text-slate-400">
                  ${symbol ? symbol.toUpperCase() : "SYMBOL"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              {blurb || "Deskripsi token akan tampil di sini."}
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <Row k="Total supply" v="1,000,000,000" />
              <Row k="Untuk kurva" v="800,000,000" />
              <Row k="Fee trading" v="1%" />
              <Row k="Bagian kamu" v="35% dari fee" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{k}</span>
      <span className="font-bold text-slate-800">{v}</span>
    </div>
  );
}
