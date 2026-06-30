"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Icon, type IconName } from "./icons";
import { shortAddress } from "@/lib/tokens";

type NavItem = { label: string; href: string; icon: IconName };

// Exact order and labels from the dashboard spec. Items without a dedicated
// route point at the closest existing page or an in page section anchor, so
// nothing dead ends.
const NAV: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Explore Campaign", href: "/explore", icon: "compass" },
  { label: "Almost Funded", href: "/#almost-funded", icon: "target" },
  { label: "Ending Soon", href: "/#ending-soon", icon: "clock" },
  { label: "Launch Campaign", href: "/campaigns", icon: "rocket" },
  { label: "Portfolio", href: "/portfolio", icon: "wallet" },
  { label: "Watchlist", href: "/portfolio#watchlist", icon: "star" },
  { label: "Notifications", href: "/#activity", icon: "bell" },
  { label: "Leaderboard", href: "/leaderboard", icon: "trophy" },
  { label: "Creators", href: "/leaderboard#creators", icon: "users" },
  { label: "Successful Campaigns", href: "/graduated", icon: "check" },
  { label: "Docs & FAQ", href: "/docs", icon: "book" },
  { label: "Settings", href: "/support", icon: "settings" },
];

function WalletCard() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        const connected = mounted && account && chain;
        return (
          <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur">
            {connected ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-xs font-black text-white shadow-glow">
                    {account.displayName?.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {shortAddress(account.address)}
                    </p>
                    <p className="truncate text-xs font-medium text-slate-400">
                      {account.displayBalance ?? "Connected"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={openAccountModal}
                  className="btn-ghost mt-3 w-full !py-2.5 text-sm"
                >
                  Manage Wallet
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-800">Connect your wallet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Connect to support campaigns and manage your portfolio.
                </p>
                <button
                  onClick={openConnectModal}
                  className="btn-primary mt-3 w-full !py-2.5 text-sm"
                >
                  Connect Wallet
                </button>
              </>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  // The active item is the first nav entry that points at a real route (no
  // hash) matching the current path. Section anchors never count as active, so
  // the home page highlights Home only, not every "/#..." shortcut.
  const activeLabel =
    NAV.find((item) => {
      if (item.href.includes("#")) return false;
      return item.href === "/" ? pathname === "/" : pathname === item.href;
    })?.label ?? null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r border-white/70 bg-white/80 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-lg font-black text-white shadow-glow">
              L
            </span>
            <span className="text-lg font-extrabold tracking-tight">Lumora</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = item.label === activeLabel;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-brand-gradient text-white shadow-glow"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-base-blue"
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      className={`h-[18px] w-[18px] shrink-0 ${
                        active ? "text-white" : "text-slate-400 group-hover:text-base-blue"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Wallet card */}
        <div className="border-t border-white/70 p-3">
          <WalletCard />
        </div>
      </aside>
    </>
  );
}
