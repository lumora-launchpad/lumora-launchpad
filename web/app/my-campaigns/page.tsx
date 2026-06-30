"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { tokenAbi } from "@/lib/contracts";
import { formatEth } from "@/lib/tokens";
import { useDisplayCampaigns, type DisplayCampaign } from "@/lib/campaignDisplay";
import { useCreator } from "@/lib/creatorStats";
import { CampaignCard } from "@/components/dashboard/CampaignCard";
import { Icon } from "@/components/dashboard/icons";

const ZERO = "0x0000000000000000000000000000000000000000";
const TABS = ["All", "Active", "Successful", "Failed", "Draft", "Pending"] as const;
type Tab = (typeof TABS)[number];

function statusTab(c: DisplayCampaign): "Active" | "Successful" | "Failed" {
  const now = Math.floor(Date.now() / 1000);
  if (c.status === "graduated") return "Successful";
  if (c.deadline <= now) return "Failed";
  return "Active";
}

function RevenueWithdraw({ token, account }: { token: string; account: `0x${string}` }) {
  const { data: owed, refetch } = useReadContract({
    address: token as `0x${string}`,
    abi: tokenAbi,
    functionName: "feesOwed",
    args: [account],
  });
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  const amount = (owed as bigint | undefined) ?? 0n;
  if (amount === 0n) {
    return <span className="text-xs font-medium text-slate-400">No revenue yet</span>;
  }
  return (
    <button
      onClick={() =>
        writeContract({ address: token as `0x${string}`, abi: tokenAbi, functionName: "withdrawFees" })
      }
      disabled={isPending || isLoading}
      className="btn-primary !px-3 !py-1.5 text-xs"
    >
      {isPending || isLoading ? "Processing" : `Withdraw ${formatEth(amount)} ETH`}
    </button>
  );
}

function CopyLink({ href }: { href: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!href) return null;
  return (
    <button
      onClick={() => {
        navigator.clipboard
          .writeText(`${window.location.origin}${href}`)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => {});
      }}
      className="rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-base-blue hover:text-base-blue"
    >
      {copied ? "Copied" : "Share"}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <p className="text-xl font-black gradient-text">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

export default function MyCampaignsPage() {
  const { address, isConnected } = useAccount();
  const { all } = useDisplayCampaigns();
  const profile = useCreator(address);
  const [tab, setTab] = useState<Tab>("All");

  if (!isConnected || !address) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">My Campaigns</h1>
        <div className="glass-card mt-8 px-6 py-16 text-center">
          <p className="text-lg font-black text-slate-900">Connect your wallet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Connect to see the campaigns you created, track their progress, and
            withdraw your creator revenue.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  const mine = all.filter((c) => c.creator.toLowerCase() === address.toLowerCase());
  const shown =
    tab === "All"
      ? mine
      : tab === "Draft" || tab === "Pending"
        ? []
        : mine.filter((c) => statusTab(c) === tab);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">My Campaigns</h1>
        <p className="mt-1 text-slate-500">
          The campaigns you created. Track funding, share them, and withdraw your
          creator revenue.
        </p>
      </div>

      {/* Analytics */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Campaigns" value={String(profile?.total ?? 0)} />
        <Stat label="Successful" value={String(profile?.successful ?? 0)} />
        <Stat label="Success Rate" value={`${profile?.successRate ?? 0}%`} />
        <Stat
          label="Total Raised"
          value={`${(profile?.totalRaised ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} ETH`}
        />
      </div>

      {/* Tabs */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === t
                ? "bg-brand-gradient text-white shadow-glow"
                : "border border-slate-200 bg-white/70 text-slate-600 hover:border-base-blue hover:text-base-blue"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      {tab === "Draft" || tab === "Pending" ? (
        <div className="glass-card mt-6 px-6 py-14 text-center">
          <p className="text-base font-black text-slate-900">No {tab.toLowerCase()} campaigns</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Campaigns deploy on chain the moment you create them, so there are no
            drafts or pending states. Create one from the Launch page.
          </p>
          <Link href="/launch" className="btn-primary mt-5 inline-flex">
            Launch a campaign
          </Link>
        </div>
      ) : shown.length === 0 ? (
        <div className="glass-card mt-6 px-6 py-14 text-center">
          <p className="text-base font-black text-slate-900">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            You have no {tab === "All" ? "" : tab.toLowerCase() + " "}campaigns.
          </p>
          <Link href="/launch" className="btn-primary mt-5 inline-flex">
            Launch a campaign
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((c) => (
            <div key={c.key} className="flex flex-col gap-3">
              <CampaignCard c={c} />
              <div className="flex items-center justify-between gap-2 px-1">
                <CopyLink href={c.href} />
                {c.status === "graduated" && c.token && c.token !== ZERO ? (
                  <RevenueWithdraw token={c.token} account={address} />
                ) : (
                  <span className="text-xs font-medium text-slate-400">Revenue after launch</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
