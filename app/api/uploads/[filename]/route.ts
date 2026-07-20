import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Simple content-type detection
    let contentType = "image/jpeg";
    if (filename.toLowerCase().endsWith(".png")) contentType = "image/png";
    if (filename.toLowerCase().endsWith(".gif")) contentType = "image/gif";
    if (filename.toLowerCase().endsWith(".svg")) contentType = "image/svg+xml";
    if (filename.toLowerCase().endsWith(".webp")) contentType = "image/webp";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to serve upload asset:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
