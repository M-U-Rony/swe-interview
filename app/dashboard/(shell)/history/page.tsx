import { redirect } from "next/navigation";
import InterviewLog, { type LogInterview } from "@/components/interviewLog";
import { getUserId } from "@/lib/auth";
import { reconcileOpenInterviews } from "@/lib/interviews";
import { Interview } from "@/models/model";
import dbConnect from "@/utils/dbConnection";

export default async function HistoryPage() {
  const userId = await getUserId();
  if (!userId) {
    redirect("/signin");
  }

  await dbConnect();

  // Interviews left open by a closed tab are finished off here (D1).
  await reconcileOpenInterviews(userId);

  const interviews = await Interview.find({ user: userId }).sort({ createdAt: -1 }).lean<LogInterview[]>();

  return (
    <section className="flex flex-col gap-10 pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 font-display text-5xl font-extrabold tracking-[-0.03em] sm:text-[64px]">History</h1>
        <span className="font-mono text-[13px] text-muted">
          {interviews.length} interview{interviews.length === 1 ? "" : "s"}
        </span>
      </div>
      <InterviewLog interviews={interviews} />
    </section>
  );
}
