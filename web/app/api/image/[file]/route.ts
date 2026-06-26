import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");
const SAFE = /^[a-f0-9-]+\.(png|jpg|webp|gif)$/i;
const TYPE: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

// Serves an uploaded image from .data/uploads. The filename is sanitized to a
// strict pattern so it cannot escape the uploads directory.
export async function GET(
  _request: NextRequest,
  { params }: { params: { file: string } },
) {
  const file = params.file;
  if (!SAFE.test(file)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const bytes = await fs.readFile(path.join(UPLOAD_DIR, file));
    const ext = file.split(".").pop()!.toLowerCase();
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": TYPE[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
