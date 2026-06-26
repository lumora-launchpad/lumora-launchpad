import { NextRequest, NextResponse } from "next/server";
import { metadataStore } from "@/lib/metadataStore";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
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
  const body = await request.json().catch(() => null);
  const address = body?.address;

  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid token address" }, { status: 400 });
  }

  const description =
    typeof body.description === "string"
      ? body.description.trim().slice(0, MAX_DESCRIPTION_LENGTH)
      : undefined;
  const imageUrl =
    typeof body.imageUrl === "string"
      ? body.imageUrl.trim().slice(0, MAX_IMAGE_URL_LENGTH)
      : undefined;

  const link = (v: unknown): string | undefined =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, 200) : undefined;

  await metadataStore.set(address, {
    description: description || undefined,
    imageUrl: imageUrl || undefined,
    website: link(body.website),
    x: link(body.x),
    telegram: link(body.telegram),
  });

  return NextResponse.json({ ok: true });
}
