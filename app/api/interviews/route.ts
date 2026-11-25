import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getSignedUrl } from "@/lib/elevenlabs";
import {
  DAILY_INTERVIEW_LIMIT,
  hasOpenInterview,
  interviewsStartedToday,
  reconcileOpenInterviews,
} from "@/lib/interviews";
import { Interview, Resume } from "@/models/model";
import dbConnect from "@/utils/dbConnection";

/**
 * Start an interview: checks, creates the record, returns a signed URL (D1, D3, D6 #23).
 * The signed URL is only handed out here, after every check has passed.
 */
export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  if (!(await Resume.exists({ author: userId }))) {
    return NextResponse.json(
      { error: "Upload your resume before starting an interview.", code: "NO_RESUME" },
      { status: 400 }
    );
  }

  // Finish off anything left over from a closed tab before judging "already running".
  await reconcileOpenInterviews(userId);

  if (await hasOpenInterview(userId)) {
    return NextResponse.json(
      { error: "You already have an interview in progress.", code: "INTERVIEW_IN_PROGRESS" },
      { status: 409 }
    );
  }

  if ((await interviewsStartedToday(userId)) >= DAILY_INTERVIEW_LIMIT) {
    return NextResponse.json(
      {
        error: `You have used today's ${DAILY_INTERVIEW_LIMIT} interviews. Try again tomorrow.`,
        code: "DAILY_LIMIT_REACHED",
      },
      { status: 429 }
    );
  }

  const interview = await Interview.create({ user: userId, status: "pending" });

  try {
    const signedUrl = await getSignedUrl();
    return NextResponse.json({ interviewId: String(interview._id), signedUrl }, { status: 201 });
  } catch (error) {
    console.error("Could not get ElevenLabs signed URL:", error);
    await Interview.updateOne({ _id: interview._id }, { $set: { status: "failed" } });
    return NextResponse.json(
      { error: "Could not reach the interviewer. Please try again.", code: "CONNECT_FAILED" },
      { status: 502 }
    );
  }
}
