import type { Metadata } from "next";
import { CopyButton } from "@/components/CopyButton";
import {
  CONTRACTS,
  NETWORK_NAME,
  IS_MAINNET,
  CONTRACTS_VERIFIED,
  EXPLORER_NAME,
  addressExplorerUrl,
} from "@/lib/deployments";

export const metadata: Metadata = {
  title: "Smart Contracts | Lumora",
  description:
    "Official Lumora smart contract addresses on Base, with direct links to the block explorer.",
};

export default function ContractsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-black tracking-tight">
        Smart <span className="gradient-text">contracts</span>
      </h1>
      <p className="mt-3 text-slate-500">
        These are the official Lumora contracts on {NETWORK_NAME}. Always confirm
        an address here before approving any transaction. Lumora will never
        publish addresses through direct messages.
      </p>

      {!IS_MAINNET && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          This is the {NETWORK_NAME} testnet deployment. The mainnet addresses
          will be published here after launch.
        </div>
      )}

      <div className="mt-8 space-y-4">
        {CONTRACTS.length === 0 && (
          <div className="card text-sm text-slate-500">
            Contract addresses are not configured yet.
          </div>
        )}

        {CONTRACTS.map((c) => (
          <div key={c.name} className="card">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{c.name}</h2>
              <span className="pill !py-1 text-xs">{NETWORK_NAME}</span>
              {CONTRACTS_VERIFIED ? (
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                  Verified on {EXPLORER_NAME}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                  Verification pending
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-slate-500">{c.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <code className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                {c.address}
              </code>
              <CopyButton value={c.address} />
              <a
                href={addressExplorerUrl(c.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-base-blue hover:text-base-blue"
              >
                View on {EXPLORER_NAME}
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-400">
        Contract source is published on GitHub. The bonding curve parameters,
        fee splits, and graduation logic are described in the documentation.
      </p>
    </div>
  );
}
