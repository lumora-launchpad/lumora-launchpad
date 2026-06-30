import type { Metadata } from "next";
import { CopyButton } from "@/components/CopyButton";
import {
  CONTRACTS,
  NETWORK_NAME,
  IS_MAINNET,
  CONTRACTS_VERIFIED,
  EXPLORER_NAME,
  EXPLORER_HOME,
  addressExplorerUrl,
  TREASURY_ADDRESS,
  ROUTER_ADDRESS,
  VERSION,
  AUDIT_STATUS,
  GITHUB,
} from "@/lib/deployments";

const EXTRA = [
  { name: "Treasury", description: "Receives the developer share of fees.", address: TREASURY_ADDRESS },
  { name: "Router", description: "Uniswap v2 router used to seed liquidity at graduation.", address: ROUTER_ADDRESS },
];

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

        {EXTRA.map((c) => (
          <div key={c.name} className="card">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{c.name}</h2>
              <span className="pill !py-1 text-xs">{NETWORK_NAME}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{c.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {c.address ? (
                <>
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
                </>
              ) : (
                <span className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-400">
                  Published after mainnet
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-bold text-slate-800">Protocol details</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Network</dt>
            <dd className="mt-1 font-bold text-slate-700">{NETWORK_NAME}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Version</dt>
            <dd className="mt-1 font-bold text-slate-700">{VERSION}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Audit status</dt>
            <dd className="mt-1 font-bold text-slate-700">{AUDIT_STATUS}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</dt>
            <dd className="mt-1 flex items-center gap-1.5 font-bold text-base-mint">
              <span className="h-2 w-2 rounded-full bg-base-mint" />
              Operational
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{EXPLORER_NAME}</dt>
            <dd className="mt-1">
              <a href={EXPLORER_HOME} target="_blank" rel="noopener noreferrer" className="font-bold text-base-blue hover:underline">
                Open explorer
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">GitHub</dt>
            <dd className="mt-1">
              <a href={GITHUB.contracts} target="_blank" rel="noopener noreferrer" className="font-bold text-base-blue hover:underline">
                View contracts
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        Contract source is published on GitHub. The bonding curve parameters,
        fee splits, and graduation logic are described in the documentation.
      </p>
    </div>
  );
}
