import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppFrame } from "@/components/AppFrame";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

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
    images: [{ url: "/hero.jpg", width: 800, height: 800, alt: "Lumora" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@LumoraLaunchpad",
    creator: "@LumoraLaunchpad",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
