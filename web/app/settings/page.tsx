"use client";

import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePrefs, type NotifPrefs } from "@/lib/usePrefs";
import { shortAddress } from "@/lib/tokens";
import { Icon, type IconName } from "@/components/dashboard/icons";

function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon: IconName;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-black tracking-tight text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{desc}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        role="switch"
        aria-checked={on}
        onClick={onClick}
        className={`relative h-6 w-11 rounded-full transition ${on ? "bg-brand-gradient" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

const NOTIF_ROWS: { key: keyof NotifPrefs; label: string }[] = [
  { key: "milestones", label: "Funding milestones (25, 50, 75 percent, almost funded)" },
  { key: "launches", label: "Campaign launched or failed" },
  { key: "refunds", label: "Refund available" },
  { key: "featured", label: "New featured campaigns" },
];

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { prefs, setUsername, toggleNotif } = usePrefs();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">
          Manage your profile, notifications, and wallet. Profile and preferences
          are saved locally on this device.
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-6">
        {/* Profile */}
        <Section icon="user" title="Profile" desc="A display name for this device. Your avatar is derived from your wallet.">
          <label className="block text-sm font-semibold text-slate-600">Username</label>
          <input
            className="field mt-2"
            placeholder="Choose a display name"
            value={prefs.username}
            maxLength={24}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Section>

        {/* Appearance */}
        <Section icon="palette" title="Appearance" desc="Theme and language.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Theme</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                Light. Dark soon
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Language</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                English. More soon
              </span>
            </div>
          </div>
        </Section>

        {/* Notification preferences */}
        <Section icon="bell" title="Notification Preferences" desc="Choose which alerts appear in your notifications.">
          <div className="divide-y divide-slate-100">
            {NOTIF_ROWS.map((r) => (
              <Toggle
                key={r.key}
                label={r.label}
                on={prefs.notif[r.key]}
                onClick={() => toggleNotif(r.key)}
              />
            ))}
          </div>
        </Section>

        {/* Wallet management */}
        <Section icon="wallet" title="Wallet Management" desc="Your connected wallet and network.">
          {isConnected && address ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Connected wallet
                  </p>
                  <p className="font-mono text-sm font-bold text-slate-800">
                    {shortAddress(address)}
                  </p>
                </div>
                <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
              </div>
              <button
                onClick={() => disconnect()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-base-pink hover:text-base-pink"
              >
                <Icon name="logout" className="h-4 w-4" />
                Disconnect wallet
              </button>
            </div>
          ) : (
            <ConnectButton />
          )}
        </Section>

        {/* Privacy & Security */}
        <Section icon="lock" title="Privacy and Security" desc="How Lumora handles your data and funds.">
          <ul className="space-y-2 text-sm text-slate-600">
            {[
              "Non custodial. Lumora never holds your funds or your keys.",
              "Your profile, watchlist, and preferences are stored only in this browser.",
              "All campaign and trading actions are signed by your own wallet on Base.",
              "Smart contracts are open source and verifiable on the block explorer.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-base-mint" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
