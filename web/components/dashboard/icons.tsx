// Inline stroke icons for the dashboard sidebar and chrome. No emoji, no image
// assets, so they stay crisp and inherit the current text color.

export type IconName =
  | "home"
  | "compass"
  | "target"
  | "clock"
  | "rocket"
  | "wallet"
  | "star"
  | "bell"
  | "trophy"
  | "users"
  | "check"
  | "book"
  | "settings"
  | "search"
  | "menu"
  | "close"
  | "arrowRight"
  | "chevronDown";

const PATHS: Record<IconName, React.ReactNode> = {
  home: <><path d="M4 11l8-7 8 7" /><path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  rocket: <><path d="M5 15c-1 1-1.5 4-1.5 4s3-.5 4-1.5" /><path d="M9 15l-3-3c4-8 9-9 12-9 0 3-1 8-9 12z" /><circle cx="14.5" cy="9.5" r="1.5" /></>,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18" /><circle cx="17" cy="14" r="1" fill="currentColor" stroke="none" /></>,
  star: <><path d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 19.2 8 13.7 4 9.8l5.5-.8L12 4z" /></>,
  bell: <><path d="M18 9a6 6 0 10-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z" /><path d="M10.5 20a2 2 0 003 0" /></>,
  trophy: <><path d="M7 4h10v4a5 5 0 01-10 0V4z" /><path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3" /><path d="M10 14h4M9 20h6M12 14v6" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M15 11a3 3 0 100-6" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><path d="M17 15c2 0 4 2 4 5" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.2 2.2 4.8-5" /></>,
  book: <><path d="M5 5a2 2 0 012-2h11v16H7a2 2 0 00-2 2V5z" /><path d="M18 17H7a2 2 0 00-2 2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.1-1.2l1.8-1.4-2-3.4-2.1.9a7 7 0 00-2-1.2L16 3.5h-4l-.6 2.2a7 7 0 00-2 1.2l-2.1-.9-2 3.4 1.8 1.4A7 7 0 005 12c0 .4 0 .8.1 1.2l-1.8 1.4 2 3.4 2.1-.9a7 7 0 002 1.2l.6 2.2h4l.6-2.2a7 7 0 002-1.2l2.1.9 2-3.4-1.8-1.4c.1-.4.1-.8.1-1.2z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  close: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  arrowRight: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
  chevronDown: <><path d="M6 9l6 6 6-6" /></>,
};

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
