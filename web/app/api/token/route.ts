import { NextRequest, NextResponse } from "next/server";
import { metadataStore } from "@/lib/metadataStore";
import { rateLimit, clientIp } from "@/lib/server/rateLimit";
import { isCreatorSignature } from "@/lib/server/publicClient";
import { METADATA_SIG_MAX_AGE_MS } from "@/lib/metadataAuth";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const SIGNATURE_RE = /^0x[a-fA-F0-9]+$/;
const MAX_DESCRIPTION_LENGTH = 280;
const MAX_IMAGE_URL_LENGTH = 2048;

function isValidAddress(value: unknown): value is string {
  return typeof value === "string" && ADDRESS_RE.test(value);
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid token address" }, { status: 400 });
  }

  const metadata = await metadataStore.get(address);
  return NextResponse.json(metadata ?? {});
}

export async function POST(request: NextRequest) {
  // 20 metadata writes per 10 minutes per IP.
  if (!rateLimit(`meta:${clientIp(request)}`, 20, 600_000)) {
    return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const address = body?.address;

  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid token address" }, { status: 400 });
  }

  // Only the token's on chain creator may write its metadata. The caller proves
  // this by signing a time-bound message with the creator wallet.
  const signedAt = body?.signedAt;
  const signature = body?.signature;
  if (
    typeof signedAt !== "number" ||
    !Number.isFinite(signedAt) ||
    typeof signature !== "string" ||
    !SIGNATURE_RE.test(signature)
  ) {
    return NextResponse.json({ error: "Signature required" }, { status: 401 });
  }
  if (Math.abs(Date.now() - signedAt) > METADATA_SIG_MAX_AGE_MS) {
    return NextResponse.json({ error: "Signature expired, please try again" }, { status: 401 });
  }
  if (!(await isCreatorSignature(address, signedAt, signature as `0x${string}`))) {
    return NextResponse.json(
      { error: "Only the token creator can edit this" },
      { status: 403 },
    );
  }

  const description =
    typeof body.description === "string"
      ? body.description.trim().slice(0, MAX_DESCRIPTION_LENGTH)
      : undefined;
  const why =
    typeof body.why === "string" ? body.why.trim().slice(0, 600) : undefined;
  const category =
    typeof body.category === "string"
      ? body.category.trim().slice(0, 40)
      : undefined;
  const imageUrl =
    typeof body.imageUrl === "string"
      ? body.imageUrl.trim().slice(0, MAX_IMAGE_URL_LENGTH)
      : undefined;
  const bannerUrl =
    typeof body.bannerUrl === "string"
      ? body.bannerUrl.trim().slice(0, MAX_IMAGE_URL_LENGTH)
      : undefined;

  const link = (v: unknown): string | undefined =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, 200) : undefined;

  await metadataStore.set(address, {
    description: description || undefined,
    why: why || undefined,
    category: category || undefined,
    imageUrl: imageUrl || undefined,
    bannerUrl: bannerUrl || undefined,
    website: link(body.website),
    x: link(body.x),
    telegram: link(body.telegram),
    discord: link(body.discord),
  });

  return NextResponse.json({ ok: true });
}
