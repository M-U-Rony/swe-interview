import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { finalizeInterview, isValidId } from "@/lib/interviews";
import { scoreInterview } from "@/lib/scoring";
import { END_REASONS, Interview } from "@/models/model";
import dbConnect from "@/utils/dbConnection";

type Params = { params: Promise<{ id: string }> };

async function findOwned(id: string, userId: string) {
  if (!isValidId(id)) return null;
  await dbConnect();
  return Interview.findOne({ _id: id, user: userId });
}

/**
 * Current state of an interview. Also nudges it forward: finalizes it once
 * ElevenLabs is done, and starts scoring in the background (D1, D2).
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await findOwned(id, userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await finalizeInterview(id);
  } catch (error) {
    console.error(`Could not finalize interview ${id}:`, error);
  }

  const interview = await Interview.findById(id);
  if (interview.status === "completed" && interview.scoring?.status !== "done") {
    after(() => scoreInterview(id));
  }

  return NextResponse.json({
    status: interview.status ?? "completed",
    scoring: interview.scoring?.status ?? null,
  });
}

const patchSchema = z.union([
  z.object({ conversationId: z.string().min(1).max(200) }),
  z.object({ endReason: z.enum(END_REASONS) }),
]);

/**
 * Called by the browser: once with the conversationId when the call connects,
 * once with how the call ended (D1).
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await findOwned(id, userId))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  if ("conversationId" in parsed.data) {
    try {
      const res = await Interview.updateOne(
        { _id: id, user: userId, status: "pending" },
        { $set: { conversationId: parsed.data.conversationId, status: "in_progress" } }
      );
      if (res.modifiedCount !== 1) return NextResponse.json({ error: "Interview already started" }, { status: 409 });
    } catch {
      // Unique index: this conversation already belongs to another interview.
      return NextResponse.json({ error: "Conversation already registered" }, { status: 409 });
    }
  } else {
    await Interview.updateOne(
      { _id: id, user: userId, endReason: { $exists: false } },
      { $set: { endReason: parsed.data.endReason } }
    );
  }

  return NextResponse.json({ success: true });
}
