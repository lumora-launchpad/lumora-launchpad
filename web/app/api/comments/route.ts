import { NextRequest, NextResponse } from "next/server";
import { commentStore, type Comment } from "@/lib/commentStore";
import { rateLimit, clientIp } from "@/lib/server/rateLimit";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const MAX_TEXT_LENGTH = 280;

function isValidAddress(value: unknown): value is string {
  return typeof value === "string" && ADDRESS_RE.test(value);
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid token address" }, { status: 400 });
  }
  const comments = await commentStore.list(address);
  // newest first
  return NextResponse.json({ comments: [...comments].reverse() });
}

export async function POST(request: NextRequest) {
  // 8 comments per 5 minutes per IP.
  if (!rateLimit(`comment:${clientIp(request)}`, 8, 300_000)) {
    return NextResponse.json({ error: "Too many comments, slow down" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const address = body?.address;
  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid token address" }, { status: 400 });
  }

  const text =
    typeof body.text === "string"
      ? body.text.trim().slice(0, MAX_TEXT_LENGTH)
      : "";
  if (!text) {
    return NextResponse.json({ error: "Empty comment" }, { status: 400 });
  }

  const author = isValidAddress(body.author) ? body.author : "";

  const comment: Comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author,
    text,
    createdAt: Date.now(),
  };

  await commentStore.add(address, comment);
  return NextResponse.json({ ok: true, comment });
}
