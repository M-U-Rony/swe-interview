import Link from "next/link";
import { CRITERIA, type Criterion } from "@/lib/rubric";

export interface LogInterview {
  _id: unknown;
  createdAt: Date;
  status?: string;
  targetRole?: string;
  experienceLevel?: string;
  score?: number;
  answerCount?: number;
  endReason?: string;
  scoring?: { status?: string };
  evaluation?: { criteria?: Record<Criterion, { assessed?: boolean; score?: number } | undefined> };
}

function formatDate(d: Date): string {
  const date = new Date(d);
  const day = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

function strongestWeakest(interview: LogInterview): string | null {
  const criteria = interview.evaluation?.criteria;
  if (!criteria) return null;
  const scored = (Object.keys(CRITERIA) as Criterion[])
    .filter((k) => criteria[k]?.assessed)
    .map((k) => ({ k, score: criteria[k]?.score ?? 0 }))
    .sort((a, b) => b.score - a.score);
  if (scored.length < 2) return null;
  const name = (k: Criterion) => CRITERIA[k].label.replace(" knowledge", "").toLowerCase();
  return `Strongest: ${name(scored[0].k)} · Weakest: ${name(scored[scored.length - 1].k)}`;
}

/** What the right-hand column and the second line say for each state. */
function describe(interview: LogInterview): { right: React.ReactNode; detail: string } {
  // Interviews from before statuses existed were finished and scored.
  const status = interview.status ?? "completed";
  const scoring = interview.status ? interview.scoring?.status : "done";

  if (status === "completed" && scoring === "done") {
    return {
      right: (
        <span className="font-display text-5xl font-extrabold leading-none tracking-[-0.03em] sm:text-[56px]">
          {interview.score ?? "—"}
        </span>
      ),
      detail: strongestWeakest(interview) ?? "Scored",
    };
  }
  if (status === "completed") {
    return {
      right: <span className="font-mono text-[13px] text-muted">{scoring === "failed" ? "SCORE FAILED" : "SCORING…"}</span>,
      detail: scoring === "failed" ? "Open to try scoring again" : "Transcript saved, score on its way",
    };
  }
  if (status === "abandoned") {
    const answers = interview.answerCount ?? 0;
    return {
      right: (
        <span className="border-[1.5px] border-signal-text px-3 py-2 font-mono text-[13px] font-medium text-signal-text">
          INCOMPLETE
        </span>
      ),
      detail:
        interview.endReason === "conduct"
          ? "Ended over inappropriate language"
          : interview.endReason === "user" || interview.endReason === "agent"
            ? `Ended after ${answers} answer${answers === 1 ? "" : "s"}`
            : `Connection lost after ${answers} answer${answers === 1 ? "" : "s"}`,
    };
  }
  if (status === "failed") {
    return { right: <span className="font-mono text-[13px] text-muted">DID NOT CONNECT</span>, detail: "Not counted towards today" };
  }
  return { right: <span className="font-mono text-[13px] text-muted">PROCESSING…</span>, detail: "Collecting your answers" };
}

export default function InterviewLog({ interviews }: { interviews: LogInterview[] }) {
  if (interviews.length === 0) {
    return <p className="m-0 border-t border-rule py-8 text-[17px] text-muted">No interviews yet. Your first one will show up here.</p>;
  }

  return (
    <ol className="m-0 list-none p-0">
      {interviews.map((interview, i) => {
        const { right, detail } = describe(interview);
        const role = [interview.targetRole, interview.experienceLevel].filter(Boolean).join(" · ") || "Mock interview";
        return (
          <li key={String(interview._id)}>
            <Link
              href={`/dashboard/interview/${interview._id}/result`}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 border-t border-rule py-6 no-underline hover:bg-surface sm:grid-cols-[180px_minmax(0,1fr)_200px] ${
                i === interviews.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="col-span-2 font-mono text-sm sm:col-span-1">{formatDate(interview.createdAt)}</span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-lg font-semibold">{role}</span>
                <span className="text-[15px] text-muted">{detail}</span>
              </span>
              <span className="justify-self-end">{right}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
