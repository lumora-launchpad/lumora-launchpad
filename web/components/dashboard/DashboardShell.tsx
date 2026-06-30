"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Footer } from "@/components/Footer";

// The global app shell. Every route renders inside the same sidebar and topbar,
// so the dashboard layout stays consistent no matter where you navigate. The
// shell is mounted once in the root layout and persists across client
// navigations.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
