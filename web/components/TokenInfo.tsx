"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { tokenAbi } from "@/lib/contracts";

const TOTAL_SUPPLY = 1_000_000_000;
const ZERO = "0x0000000000000000000000000000000000000000" as const;

function shortAddr(a: string): string {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-800">{children}</span>
    </div>
  );
}

export function TokenInfo({
  address,
  creator,
  mcap,
}: {
  address: `0x${string}`;
  creator?: `0x${string}`;
  mcap?: bigint;
}) {
  const [copied, setCopied] = useState(false);

  const { data: creatorBal } = useReadContract({
    address,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [creator ?? ZERO],
    query: { enabled: !!creator },
  });

  const { data: devShareBps } = useReadContract({
    address,
    abi: tokenAbi,
    functionName: "devShareBps",
  });

  const creatorTokens = creatorBal
    ? Number(formatEther(creatorBal as bigint))
    : 0;
  const creatorPct = (creatorTokens / TOTAL_SUPPLY) * 100;

  const devShare = devShareBps !== undefined ? Number(devShareBps) / 100 : 65;
  const creatorShare = 100 - devShare;
  const isCampaign = devShare < 65;

  const mc =
    mcap !== undefined
      ? Number(formatEther(mcap)).toLocaleString("en-US", {
          maximumFractionDigits: 2,
        })
      : "-";

  function copy() {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="card">
      <h3 className="text-sm font-bold text-slate-700">Token info</h3>
      <div className="mt-4 space-y-2.5 text-sm">
        <Row label="Contract">
          <button
            onClick={copy}
            className="font-mono text-xs text-base-blue transition hover:underline"
          >
            {copied ? "Copied" : shortAddr(address)}
          </button>
        </Row>
        <Row label="Market cap">{mc} ETH</Row>
        <Row label="Total supply">1,000,000,000</Row>
        <Row label="On the curve">800,000,000</Row>
        <Row label="Creator holds">{creatorPct.toFixed(2)}%</Row>
        <Row label="Launch type">{isCampaign ? "Campaign" : "Instant"}</Row>
        <Row label="Trading fee">1%</Row>
        <Row label="Fee split (dev / creator)">
          {devShare} / {creatorShare}
        </Row>
        <Row label="Graduation">By market cap</Row>
      </div>
      {isCampaign && (
        <p className="mt-3 rounded-xl bg-base-violet/5 px-3 py-2 text-xs font-medium text-base-violet">
          Campaign launch: the creator earns {creatorShare} percent of every
          trade fee, more than an instant launch.
        </p>
      )}
    </div>
  );
}
