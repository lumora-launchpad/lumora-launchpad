"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { Comment } from "@/lib/commentStore";

function shortAddr(a: string): string {
  return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "anon";
}

function ago(ms: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function Comments({ address }: { address: `0x${string}` }) {
  const { address: account, isConnected } = useAccount();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/comments?address=${address}`)
      .then((res) => (res.ok ? res.json() : { comments: [] }))
      .then((data: { comments: Comment[] }) => {
        if (active) setComments(data.comments ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [address]);

  async function submit() {
    const body = text.trim();
    if (!body || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, text: body, author: account }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setText("");
      }
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Comments</h3>
        <span className="text-xs font-medium text-slate-400">
          {comments.length}
        </span>
      </div>

      <div className="mt-4">
        {isConnected ? (
          <div className="flex gap-2">
            <input
              className="field"
              placeholder="Say something about this token"
              value={text}
              maxLength={280}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
            <button
              onClick={submit}
              disabled={posting || !text.trim()}
              className="btn-primary shrink-0 !px-5 !py-3"
            >
              {posting ? "..." : "Post"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">
              Connect a wallet to comment.
            </span>
            <ConnectButton showBalance={false} chainStatus="none" />
          </div>
        )}
      </div>

      <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No comments yet. Start the conversation.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-base-blue">
                  {shortAddr(c.author)}
                </span>
                <span className="text-xs text-slate-400">{ago(c.createdAt)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                {c.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
