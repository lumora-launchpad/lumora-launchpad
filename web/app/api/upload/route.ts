import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

// Accepts a single image file and stores it under .data/uploads, returning a
// URL served back by /api/image. Keeps uploads on the server (persists on a
// long lived host) instead of asking the user for an external URL.
export async function POST(request: NextRequest) {
  let file: unknown = null;
  try {
    const form = (await request.formData()) as unknown as {
      get(name: string): unknown;
    };
    file = form.get("file");
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 2 MB)" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}.${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), bytes);

  return NextResponse.json({ url: `/api/image/${name}` });
}
