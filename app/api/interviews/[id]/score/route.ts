import { NextRequest, NextResponse, after } from "next/server";
import { getUserId } from "@/lib/auth";
import { isValidId } from "@/lib/interviews";
import { requeueScoring, scoreInterview } from "@/lib/scoring";

/** "Try again" after scoring failed (D2). */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidId(id) || !(await requeueScoring(id, userId))) {
    return NextResponse.json({ error: "Nothing to retry" }, { status: 409 });
  }

  after(() => scoreInterview(id));
  return NextResponse.json({ success: true }, { status: 202 });
}
