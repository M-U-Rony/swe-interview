import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getUserId } from "@/lib/auth";
import { imageContentType, parseStoredImageName, UPLOAD_DIR } from "@/lib/uploads";

/** Serve a user's own profile image (D8 #25, #26). */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { filename } = await params;

    // Only names the server itself creates are valid, so "../" and friends never match.
    // Profile images are only shown to their owner.
    const parsed = parseStoredImageName(filename);
    if (!parsed || parsed.userId !== userId) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    // Second guard: the resolved path must stay inside the uploads folder.
    const filePath = path.resolve(UPLOAD_DIR, filename);
    if (path.dirname(filePath) !== path.resolve(UPLOAD_DIR) || !fs.existsSync(filePath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": imageContentType(parsed.ext),
        // Never let the browser guess a different type, and never run anything from this response.
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to serve upload asset:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
