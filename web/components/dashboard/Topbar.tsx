"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Icon } from "./icons";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/70 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile menu + brand */}
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 lg:hidden"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>

        {/* Global search */}
        <div className="min-w-0 flex-1 lg:max-w-md">
          <GlobalSearch className="w-full" />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Network selector */}
          <ConnectButton.Custom>
            {({ chain, openChainModal, mounted, account }) => {
              const connected = mounted && account && chain;
              return (
                <button
                  onClick={connected ? openChainModal : undefined}
                  className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-base-blue sm:flex"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-base-blue" />
                  {connected ? chain.name : "Base"}
                  <Icon name="chevronDown" className="h-4 w-4 text-slate-400" />
                </button>
              );
            }}
          </ConnectButton.Custom>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-600 transition hover:border-base-blue hover:text-base-blue"
          >
            <Icon name="bell" className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-base-pink ring-2 ring-white" />
          </button>

          {/* Wallet + profile */}
          <ConnectButton
            showBalance={false}
            chainStatus="none"
            accountStatus="address"
          />
        </div>
      </div>
    </header>
  );
}
