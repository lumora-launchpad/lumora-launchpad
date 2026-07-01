import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumora.men";

// Static, public routes. Token and campaign pages are dynamic and indexed via
// the links surfaced on the explore page.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/explore", "/launch", "/leaderboard", "/graduated", "/portfolio", "/docs", "/contracts", "/faq", "/support", "/terms", "/privacy"];
  const now = new Date();
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/explore" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
