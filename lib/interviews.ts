import "server-only";
import mongoose from "mongoose";
import { getConversation } from "@/lib/elevenlabs";
import { Interview, type EndReason, type InterviewStatus } from "@/models/model";
import dbConnect from "@/utils/dbConnection";

/** A score needs a proper ending and at least this many candidate answers (D1). */
export const MIN_ANSWERS_FOR_SCORE = 3;
/** Interviews a user may start per server-local day; `failed` ones don't count (D3). */
export const DAILY_INTERVIEW_LIMIT = 3;
/** A `pending` interview that never got a conversationId within this time failed to connect (D1). */
const CONNECT_TIMEOUT_MS = 10 * 60 * 1000;

const OPEN_STATUSES: InterviewStatus[] = ["pending", "in_progress"];

export function isValidId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Try to move one open interview forward:
 * - pending, never connected, too old → failed
 * - in_progress and ElevenLabs is done → save transcript, then completed or abandoned
 * Anything else is left as it is (ElevenLabs is still processing, or the call is live).
 */
export async function finalizeInterview(interviewId: string): Promise<void> {
  await dbConnect();
  const interview = await Interview.findById(interviewId);
  if (!interview) return;

  if (interview.status === "pending") {
    if (Date.now() - interview.createdAt.getTime() > CONNECT_TIMEOUT_MS) {
      await Interview.updateOne({ _id: interview._id, status: "pending" }, { $set: { status: "failed" } });
    }
    return;
  }
  if (interview.status !== "in_progress" || !interview.conversationId) return;

  const conversation = await getConversation(interview.conversationId);
  if (!conversation) {
    await Interview.updateOne({ _id: interview._id, status: "in_progress" }, { $set: { status: "failed" } });
    return;
  }
  if (conversation.status !== "done" && conversation.status !== "failed") return;

  const answerCount = conversation.dialogue.filter((d) => d.role === "user").length;
  const endReason: EndReason = interview.endReason ?? "unknown";
  const endedNormally = endReason === "user" || endReason === "agent";
  const completed = endedNormally && answerCount >= MIN_ANSWERS_FOR_SCORE;

  await Interview.updateOne(
    { _id: interview._id, status: "in_progress" },
    {
      $set: {
        status: completed ? "completed" : "abandoned",
        endReason,
        transcript: JSON.stringify(conversation.dialogue),
        answerCount,
        durationSecs: conversation.durationSecs ?? undefined,
        ...(completed ? { "scoring.status": "pending" } : {}),
      },
    }
  );
}

/** Finalize every open interview a user has, e.g. after a tab was closed mid-call (D1). */
export async function reconcileOpenInterviews(userId: string): Promise<void> {
  await dbConnect();
  const open = await Interview.find({ user: userId, status: { $in: OPEN_STATUSES } }).select("_id");
  for (const { _id } of open) {
    try {
      await finalizeInterview(String(_id));
    } catch (error) {
      console.error(`Could not finalize interview ${_id}:`, error);
    }
  }
}

export async function hasOpenInterview(userId: string): Promise<boolean> {
  return (await Interview.exists({ user: userId, status: { $in: OPEN_STATUSES } })) !== null;
}

export async function interviewsStartedToday(userId: string): Promise<number> {
  return Interview.countDocuments({
    user: userId,
    createdAt: { $gte: startOfToday() },
    status: { $ne: "failed" },
  });
}
