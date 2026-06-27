import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumora.men";

const TITLE = "Lumora Launchpad";
const DESCRIPTION =
  "Launch tokens on Base. Trade instantly on a fair bonding curve, or run a demand gated campaign that only launches when real backers commit. Liquidity locks on graduation.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Lumora",
  },
  description: DESCRIPTION,
  keywords: [
    "Lumora",
    "Base",
    "launchpad",
    "token launch",
    "bonding curve",
    "memecoin",
    "Uniswap",
    "demand campaign",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/hero.png", width: 800, height: 800, alt: "Lumora" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/hero.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
