import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "@/lib/env";
import { Interview } from "@/models/model";
import dbConnect from "@/utils/dbConnection";

/** Gemini calls per scoring run: the first try plus automatic retries (D2). */
const MAX_TRIES_PER_RUN = 3;
/** A run stuck in "running" longer than this is treated as failed (D2). */
export const STALE_RUN_MS = 3 * 60 * 1000;

const evaluationSchema = z.object({
  score: z.number().min(1).max(10),
  feedback: z.string().min(1).max(4000),
});

async function evaluate(transcript: string): Promise<z.infer<typeof evaluationSchema>> {
  const ai = new GoogleGenAI({ apiKey: env().GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Here is the interview transcript to evaluate:\n\n${transcript}`,
    config: {
      systemInstruction: `You are Marcus, an empathetic and professional Tech Recruiter. Analyze the provided interview transcript and assess the candidate. Determine an overall score (1-10) and compile a professional feedback summary focusing on strengths, improvement areas, and English fluency. Return your response strictly as a JSON object containing "score" (number) and "feedback" (string).`,
      responseMimeType: "application/json",
    },
  });
  return evaluationSchema.parse(JSON.parse(response.text ?? ""));
}

/**
 * Score a completed interview, once. Safe to call concurrently: only the caller
 * that atomically claims the interview (pending → running) runs Gemini.
 */
export async function scoreInterview(interviewId: string): Promise<void> {
  await dbConnect();

  const claimed = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      status: "completed",
      $or: [
        { "scoring.status": "pending" },
        { "scoring.status": "running", "scoring.startedAt": { $lt: new Date(Date.now() - STALE_RUN_MS) } },
      ],
    },
    { $set: { "scoring.status": "running", "scoring.startedAt": new Date() }, $inc: { "scoring.attempts": 1 } },
    { new: true }
  );
  if (!claimed) return;

  for (let attempt = 1; attempt <= MAX_TRIES_PER_RUN; attempt++) {
    try {
      const { score, feedback } = await evaluate(claimed.transcript);
      await Interview.updateOne(
        { _id: interviewId },
        { $set: { "scoring.status": "done", score: Math.round(score * 10) / 10, feedback } }
      );
      return;
    } catch (error) {
      console.error(`Scoring attempt ${attempt} failed for interview ${interviewId}:`, error);
    }
  }

  await Interview.updateOne({ _id: interviewId }, { $set: { "scoring.status": "failed" } });
}

/** Put a failed scoring run back in the queue (the "try again" button). */
export async function requeueScoring(interviewId: string, userId: string): Promise<boolean> {
  await dbConnect();
  const res = await Interview.updateOne(
    { _id: interviewId, user: userId, status: "completed", "scoring.status": "failed" },
    { $set: { "scoring.status": "pending" } }
  );
  return res.modifiedCount === 1;
}
