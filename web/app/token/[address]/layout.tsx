import type { Metadata } from "next";
import { readTokenBasics } from "@/lib/server/publicClient";

export async function generateMetadata({
  params,
}: {
  params: { address: string };
}): Promise<Metadata> {
  const { name, symbol } = await readTokenBasics(params.address);
  const title = name && symbol ? `${name} ($${symbol})` : "Token";
  const description =
    name && symbol
      ? `Trade $${symbol} on Lumora, a bright bonding curve launchpad on Base.`
      : "Trade tokens on Lumora, a bright bonding curve launchpad on Base.";

  return {
    title: `${title} | Lumora`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
