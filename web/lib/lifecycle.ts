// The unified lifecycle status for a project (demand campaign or instant token).
// One vocabulary and one color language used across the whole app so a first
// time user can read the state at a glance.

export type Lifecycle =
  | "funding"
  | "trading"
  | "graduated"
  | "failed";

export function campaignLifecycle(p: {
  launched: boolean;
  tokenGraduated?: boolean;
  deadline: number;
}): Lifecycle {
  const now = Math.floor(Date.now() / 1000);
  if (p.launched) return p.tokenGraduated ? "graduated" : "trading";
  if (p.deadline > 0 && p.deadline <= now) return "failed";
  return "funding";
}

export const LIFECYCLE_META: Record<
  Lifecycle,
  { label: string; tone: string; dot: string }
> = {
  funding: { label: "Funding", tone: "bg-base-violet/10 text-base-violet", dot: "bg-base-violet" },
  trading: { label: "Trading Live", tone: "bg-base-blue/10 text-base-blue", dot: "bg-base-blue" },
  graduated: { label: "Graduated", tone: "bg-base-mint/10 text-base-mint", dot: "bg-base-mint" },
  failed: { label: "Ended", tone: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
};
