import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import { isValidId, MIN_ANSWERS_FOR_SCORE } from "@/lib/interviews";
import { Interview } from "@/models/model";
import dbConnect from "@/utils/dbConnection";
import { ResultPoller, RetryScoringButton } from "./resultStatus";

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

interface DialogueItem {
  role: string;
  message: string;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const session = await getUserSession();
  if (!session) redirect("/signin");

  const { id } = await params;
  if (!isValidId(id)) notFound();

  await dbConnect();
  // Only the owner may see an interview; anyone else gets the same 404 as a missing one (D6 #21).
  const interview = await Interview.findOne({ _id: id, user: session.userId });
  if (!interview) notFound();

  // Interviews saved before statuses existed have none: they were finished and scored.
  const status: string = interview.status ?? "completed";
  const scoring: string | null = interview.status ? interview.scoring?.status ?? null : "done";
  const waiting =
    status === "pending" || status === "in_progress" || (status === "completed" && scoring !== "done" && scoring !== "failed");

  let dialogue: DialogueItem[] = [];
  try {
    dialogue = JSON.parse(interview.transcript || "[]");
  } catch (err) {
    console.error("Failed to parse transcript json:", err);
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {waiting && <ResultPoller id={id} status={status} scoring={scoring} />}

      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {status === "abandoned" ? "Interview Incomplete" : status === "failed" ? "Interview Did Not Start" : "Interview Result"}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(interview.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>

      {(status === "pending" || status === "in_progress") && (
        <StatusCard title="Processing your interview…">
          Your answers are being collected. This usually takes a few seconds — this page updates on its own.
        </StatusCard>
      )}

      {status === "failed" && (
        <StatusCard title="The call never connected">
          Nothing was recorded and it does not count towards today&apos;s limit.{" "}
          <Link href="/dashboard/interview" className="font-semibold underline">
            Start a new interview
          </Link>
        </StatusCard>
      )}

      {status === "abandoned" && (
        <div className="p-6 rounded-3xl border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
            Incomplete
          </span>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {interview.endReason === "user" || interview.endReason === "agent"
              ? `The interview ended after ${interview.answerCount ?? 0} answer(s). A score needs at least ${MIN_ANSWERS_FOR_SCORE}.`
              : `The call was cut off after ${interview.answerCount ?? 0} answer(s), so there is no score. Your transcript is saved below.`}
          </p>
          <Link
            href="/dashboard/interview"
            className="inline-block px-5 py-2.5 bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg font-bold text-sm rounded-xl"
          >
            Retake interview
          </Link>
        </div>
      )}

      {status === "completed" && (scoring === "pending" || scoring === "running" || scoring === null) && (
        <StatusCard title="Scoring…">Marcus is reviewing your answers. This page updates on its own.</StatusCard>
      )}

      {status === "completed" && scoring === "failed" && (
        <StatusCard title="The score could not be generated">
          <span className="block mb-3">Your transcript is safe. You can try scoring again.</span>
          <RetryScoringButton id={id} />
        </StatusCard>
      )}

      {status === "completed" && scoring === "done" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/40 dark:bg-brand-dark-bg/20 border border-brand-light-secondary dark:border-brand-dark-primary/10 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              Evaluation Score
            </h2>
            <span className="text-4xl font-black text-brand-dark-secondary dark:text-brand-light-accent">
              {interview.score ?? "—"}
              <span className="text-xs text-gray-400 font-medium ml-0.5">/10</span>
            </span>
          </div>
          <div className="md:col-span-2 bg-white/40 dark:bg-brand-dark-bg/20 border border-brand-light-secondary dark:border-brand-dark-primary/10 p-6 rounded-3xl shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Marcus&apos;s Feedback Summary
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-light whitespace-pre-line">
              {interview.feedback || "No feedback summary generated."}
            </p>
          </div>
        </div>
      )}

      {dialogue.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dialogue Transcript</h2>
          <div className="space-y-4 pt-4 border-t border-brand-light-primary/20 dark:border-brand-dark-primary/10">
            {dialogue.map((item, index) => {
              const isAgent = item.role === "agent";
              return (
                <div key={index} className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm ${
                      isAgent
                        ? "bg-white dark:bg-brand-dark-accent/20 border border-brand-light-secondary dark:border-brand-dark-primary/10 text-gray-900 dark:text-white rounded-tl-none"
                        : "bg-brand-dark-secondary text-white dark:bg-brand-light-primary dark:text-brand-dark-bg rounded-tr-none"
                    }`}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5 opacity-65">
                      {isAgent ? "Marcus (AI Interviewer)" : "You (Candidate)"}
                    </p>
                    <p className="text-sm leading-relaxed">{item.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-3xl border border-brand-light-secondary dark:border-brand-dark-primary/20 bg-white/40 dark:bg-brand-dark-bg/20 space-y-2">
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="text-sm text-gray-600 dark:text-gray-300">{children}</div>
    </div>
  );
}
