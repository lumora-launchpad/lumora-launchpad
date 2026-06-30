"use client";

import { useDisplayCampaigns, type DisplayCampaign } from "./campaignDisplay";
import { useWatchlist } from "./useWatchlist";
import { usePrefs, type NotifPrefs } from "./usePrefs";

// Maps each notification kind to the preference group that gates it.
const GROUP: Record<NotificationKind, keyof NotifPrefs> = {
  fifty: "milestones",
  seventyfive: "milestones",
  almost: "milestones",
  launched: "launches",
  failed: "launches",
  refund: "refunds",
  featured: "featured",
};

export type NotificationKind =
  | "fifty"
  | "seventyfive"
  | "almost"
  | "launched"
  | "failed"
  | "refund"
  | "featured";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  text: string;
  href: string | null;
  tone: string;
  campaignKey: string;
};

const TONE: Record<NotificationKind, string> = {
  fifty: "text-base-blue bg-base-blue/10",
  seventyfive: "text-base-blue bg-base-blue/10",
  almost: "text-base-pink bg-base-pink/10",
  launched: "text-base-violet bg-base-violet/10",
  failed: "text-slate-600 bg-slate-100",
  refund: "text-base-mint bg-base-mint/10",
  featured: "text-amber-600 bg-amber-500/10",
};

// The most relevant status notification for a single campaign, so a campaign
// produces at most one progress alert rather than spamming every milestone.
function statusNotification(c: DisplayCampaign): NotificationItem | null {
  const now = Math.floor(Date.now() / 1000);
  const base = { href: c.href, campaignKey: c.key };
  if (c.status === "graduated")
    return {
      ...base,
      id: `${c.key}-launched`,
      kind: "launched",
      title: "Campaign launched",
      text: `${c.name} reached its target and launched its token.`,
      tone: TONE.launched,
    };
  if (c.deadline <= now)
    return {
      ...base,
      id: `${c.key}-refund`,
      kind: "refund",
      title: "Refund available",
      text: `${c.name} did not reach its target. You can withdraw your full commitment.`,
      tone: TONE.refund,
    };
  if (c.progress >= 90)
    return {
      ...base,
      id: `${c.key}-almost`,
      kind: "almost",
      title: "Campaign almost funded",
      text: `${c.name} is ${Math.round(c.progress)} percent funded. It is about to launch.`,
      tone: TONE.almost,
    };
  if (c.progress >= 75)
    return {
      ...base,
      id: `${c.key}-75`,
      kind: "seventyfive",
      title: "Campaign reached 75 percent",
      text: `${c.name} crossed 75 percent of its funding target.`,
      tone: TONE.seventyfive,
    };
  if (c.progress >= 50)
    return {
      ...base,
      id: `${c.key}-50`,
      kind: "fifty",
      title: "Campaign reached 50 percent",
      text: `${c.name} crossed 50 percent of its funding target.`,
      tone: TONE.fifty,
    };
  return null;
}

// Notifications are derived from the current state of the campaigns you watch,
// plus newly featured campaigns. This is an in app feed, not a push backend.
export function useNotifications(): NotificationItem[] {
  const { all } = useDisplayCampaigns();
  const { list } = useWatchlist();
  const { prefs } = usePrefs();

  const items: NotificationItem[] = [];
  const watched = new Set(list);

  for (const c of all) {
    if (!watched.has(c.key.toLowerCase()) && !watched.has(c.key)) continue;
    const n = statusNotification(c);
    if (n) items.push(n);
  }

  for (const c of all) {
    if (!c.featured) continue;
    items.push({
      id: `${c.key}-featured`,
      kind: "featured",
      title: "New featured campaign",
      text: `${c.name} is featured this week.`,
      href: c.href,
      tone: TONE.featured,
      campaignKey: c.key,
    });
  }

  // Respect the notification preferences set in Settings.
  return items.filter((n) => prefs.notif[GROUP[n.kind]]);
}
