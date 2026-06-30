"use client";

import Link from "next/link";
import { useNotifications, type NotificationItem } from "@/lib/useNotifications";
import { Icon } from "@/components/dashboard/icons";

function Row({ n }: { n: NotificationItem }) {
  const inner = (
    <div className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/60 p-4 transition hover:border-base-blue/30 hover:shadow-card">
      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${n.tone}`}>
        <Icon name="bell" className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800">{n.title}</p>
        <p className="text-sm text-slate-500">{n.text}</p>
      </div>
    </div>
  );
  return n.href ? <Link href={n.href}>{inner}</Link> : inner;
}

export default function NotificationsPage() {
  const items = useNotifications();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
          <Icon name="bell" className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="mt-1 text-slate-500">
            Alerts from the campaigns you watch, plus featured picks. Derived
            from live campaign state.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass-card px-6 py-16 text-center">
          <p className="text-lg font-black text-slate-900">No notifications yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Save campaigns to your watchlist to get alerts when they reach
            milestones, launch, or open refunds.
          </p>
          <Link href="/watchlist" className="btn-primary mt-6 inline-flex">
            Go to watchlist
          </Link>
        </div>
      ) : (
        <div className="mx-auto grid max-w-2xl gap-3">
          {items.map((n) => (
            <Row key={n.id} n={n} />
          ))}
        </div>
      )}
    </div>
  );
}
