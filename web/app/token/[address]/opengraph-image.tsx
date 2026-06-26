import { ImageResponse } from "next/og";
import { readTokenBasics } from "@/lib/server/publicClient";

export const runtime = "nodejs";
export const alt = "Lumora token";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { address: string };
}) {
  const { name, symbol } = await readTokenBasics(params.address);
  const displayName = name ?? "Lumora token";
  const displaySymbol = symbol ?? "TOKEN";
  const initials = displaySymbol.slice(0, 2).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(120deg, #0052ff 0%, #7c3aed 45%, #ec4899 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              width: "180px",
              height: "180px",
              borderRadius: "40px",
              background: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "84px",
              fontWeight: 800,
              marginRight: "36px",
            }}
          >
            {initials}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "84px", fontWeight: 800 }}>
              {displayName}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "44px",
                opacity: 0.85,
                marginTop: "8px",
              }}
            >
              ${displaySymbol}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "34px",
          }}
        >
          <div style={{ display: "flex", fontWeight: 700 }}>Lumora</div>
          <div style={{ display: "flex", opacity: 0.85 }}>
            Bonding curve launchpad on Base
          </div>
        </div>
      </div>
    ),
    size,
  );
}
