import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import { isValidId, MIN_ANSWERS_FOR_SCORE } from "@/lib/interviews";
import { CRITERIA, type Criterion } from "@/lib/scoring";
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
            {interview.endReason === "conduct"
              ? "The interviewer ended the call because of inappropriate language, so there is no score."
              : interview.endReason === "user" || interview.endReason === "agent"
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
        <div className="space-y-6">
          {interview.evaluation?.manipulationAttempt && (
            <p role="alert" className="p-4 rounded-2xl text-sm font-semibold bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-900/30">
              An attempt to influence the evaluation was detected and ignored.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/40 dark:bg-brand-dark-bg/20 border border-brand-light-secondary dark:border-brand-dark-primary/10 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Evaluation Score
              </h2>
              <span className="text-4xl font-black text-brand-dark-secondary dark:text-brand-light-accent">
                {interview.score ?? "—"}
                <span className="text-xs text-gray-400 font-medium ml-0.5">/10</span>
              </span>
              {interview.experienceLevel && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Against {interview.experienceLevel}-level expectations
                </p>
              )}
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

          {interview.evaluation?.criteria && (
            <div className="bg-white/40 dark:bg-brand-dark-bg/20 border border-brand-light-secondary dark:border-brand-dark-primary/10 p-6 rounded-3xl shadow-sm space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Breakdown</h2>
              <table className="w-full text-sm">
                <tbody>
                  {(Object.keys(CRITERIA) as Criterion[]).map((key) => {
                    const c = interview.evaluation.criteria[key];
                    return (
                      <tr key={key} className="border-t border-brand-light-primary/20 dark:border-brand-dark-primary/10 align-top">
                        <th scope="row" className="py-3 pr-4 text-left font-semibold text-gray-800 dark:text-gray-100">
                          {CRITERIA[key].label}
                          <span className="block text-xs font-normal text-gray-500">× {CRITERIA[key].weight * 100}%</span>
                        </th>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{c?.summary}</td>
                        <td className="py-3 text-right font-bold text-gray-900 dark:text-white">
                          {c?.assessed ? c.score : "n/a"}
                        </td>
                      </tr>
                    );
                  })}
                  {interview.evaluation.fluency?.score && (
                    <tr className="border-t border-dashed border-brand-light-primary/40 dark:border-brand-dark-primary/20 align-top">
                      <th scope="row" className="py-3 pr-4 text-left font-semibold text-gray-800 dark:text-gray-100">
                        English fluency
                        <span className="block text-xs font-normal text-gray-500">not counted</span>
                      </th>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{interview.evaluation.fluency.summary}</td>
                      <td className="py-3 text-right font-bold text-gray-500">{interview.evaluation.fluency.score}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {(interview.evaluation?.strengths?.length > 0 || interview.evaluation?.improvements?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeedbackList title="Keep doing" items={interview.evaluation.strengths} />
              <FeedbackList title="Next time" items={interview.evaluation.improvements} />
            </div>
          )}

          {interview.evaluation?.evidence?.length > 0 && (
            <div className="bg-white/40 dark:bg-brand-dark-bg/20 border border-brand-light-secondary dark:border-brand-dark-primary/10 p-6 rounded-3xl shadow-sm space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Where the score came from</h2>
              <ul className="space-y-3">
                {interview.evaluation.evidence.map((e: { criterion: Criterion; polarity: string; quote: string; note: string }, i: number) => (
                  <li key={i} className="text-sm">
                    <span className={`font-bold ${e.polarity === "+" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                      {e.polarity === "+" ? "+" : "−"} {CRITERIA[e.criterion]?.label}
                    </span>
                    <q className="block italic text-gray-700 dark:text-gray-200">{e.quote}</q>
                    <span className="text-gray-500 dark:text-gray-400">{e.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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

function FeedbackList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="bg-white/40 dark:bg-brand-dark-bg/20 border border-brand-light-secondary dark:border-brand-dark-primary/10 p-6 rounded-3xl shadow-sm space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-200">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
