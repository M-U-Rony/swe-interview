import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Arrow, Label, SectionTitle, Squares, buttonPrimary } from "@/components/ui";
import { getUserSession } from "@/lib/auth";
import { DAILY_INTERVIEW_LIMIT, interviewsStartedToday, isValidId, MIN_ANSWERS_FOR_SCORE } from "@/lib/interviews";
import { CRITERIA, type Criterion } from "@/lib/rubric";
import { Interview } from "@/models/model";
import dbConnect from "@/utils/dbConnection";
import { ResultPoller, RetryScoringButton } from "./resultStatus";

const MAX_SECONDS = 15 * 60;

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

interface DialogueItem {
  role: string;
  message: string;
}

interface Evidence {
  criterion: Criterion;
  polarity: "+" | "-";
  quote: string;
  note: string;
}

function formatMeta(interview: { createdAt: Date; durationSecs?: number; targetRole?: string; experienceLevel?: string }) {
  const d = new Date(interview.createdAt);
  const parts = [
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase(),
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  ];
  if (interview.durationSecs) parts.push(`${Math.max(1, Math.round(interview.durationSecs / 60))} MIN`);
  if (interview.targetRole) parts.push(interview.targetRole.toUpperCase());
  if (interview.experienceLevel) parts.push(interview.experienceLevel.toUpperCase());
  return parts.join(" · ");
}

/** Split a candidate turn into plain text and highlighted evidence quotes (D5, D12). */
function annotate(message: string, evidence: Evidence[]) {
  const lower = message.toLowerCase();
  const found = evidence
    .map((e) => ({ e, start: lower.indexOf(e.quote.toLowerCase()) }))
    .filter((f) => f.start >= 0)
    .sort((a, b) => a.start - b.start);

  const segments: Array<{ text: string; evidence?: Evidence }> = [];
  let cursor = 0;
  for (const { e, start } of found) {
    if (start < cursor) continue; // overlapping quote: keep the first
    if (start > cursor) segments.push({ text: message.slice(cursor, start) });
    segments.push({ text: message.slice(start, start + e.quote.length), evidence: e });
    cursor = start + e.quote.length;
  }
  if (cursor < message.length) segments.push({ text: message.slice(cursor) });
  return { segments, notes: found.map((f) => f.e) };
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
  const answers = interview.answerCount ?? dialogue.filter((d) => d.role === "user").length;

  return (
    <article>
      {waiting && <ResultPoller id={id} status={status} scoring={scoring} />}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule py-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2.5 py-2 text-[15px] no-underline hover:text-signal-text">
          <span className="rotate-180">
            <Arrow />
          </span>
          Log
        </Link>
        <span className="font-mono text-[13px] text-muted">{formatMeta(interview)}</span>
      </div>

      {(status === "pending" || status === "in_progress") && (
        <Headline title="Collecting your answers…">
          ElevenLabs is finishing the transcript. This usually takes a few seconds — the page updates on its own.
        </Headline>
      )}

      {status === "failed" && (
        <Headline title="The call never connected.">
          Nothing was recorded, and it does not count towards today&apos;s three.{" "}
          <Link href="/dashboard" className="font-semibold">
            Back to the dashboard
          </Link>
        </Headline>
      )}

      {status === "abandoned" && (
        <Incomplete
          endReason={interview.endReason}
          answers={answers}
          durationSecs={interview.durationSecs}
          usedToday={await interviewsStartedToday(session.userId)}
        />
      )}

      {status === "completed" && scoring !== "done" && scoring !== "failed" && (
        <Headline title="Scoring…">Marcus is reviewing your answers against the rubric. The page updates on its own.</Headline>
      )}

      {status === "completed" && scoring === "failed" && (
        <Headline title="The score could not be generated.">
          <span className="mb-5 block">Your transcript is safe. You can try scoring again.</span>
          <RetryScoringButton id={id} />
        </Headline>
      )}

      {status === "completed" && scoring === "done" && <Scored interview={interview} dialogue={dialogue} />}

      {/* Without a scored evaluation there is nothing to annotate: show the plain transcript. */}
      {!(status === "completed" && scoring === "done" && interview.evaluation?.criteria) && dialogue.length > 0 && (
        <details className="border-t border-ink pt-6">
          <summary className="cursor-pointer py-2 text-[15px] font-semibold">
            Read what you said ({answers} answer{answers === 1 ? "" : "s"})
          </summary>
          <Transcript dialogue={dialogue} evidence={[]} />
        </details>
      )}
    </article>
  );
}

function Headline({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 pb-12 pt-14">
      <h1 className="m-0 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.045em] sm:text-7xl">{title}</h1>
      <div className="max-w-[640px] text-[19px] leading-normal text-soft">{children}</div>
    </section>
  );
}

function Incomplete({ endReason, answers, durationSecs, usedToday }: {
  endReason?: string;
  answers: number;
  durationSecs?: number;
  usedToday: number;
}) {
  const left = Math.max(0, DAILY_INTERVIEW_LIMIT - usedToday);
  const minutes = durationSecs ? Math.max(1, Math.round(durationSecs / 60)) : null;
  const why =
    endReason === "conduct"
      ? "The interviewer ended the call because of inappropriate language."
      : endReason === "user" || endReason === "agent"
        ? `The interview ended after ${answers} answer${answers === 1 ? "" : "s"}.`
        : `The call dropped${minutes ? ` ${minutes} minute${minutes === 1 ? "" : "s"} in` : ""}. Your ${answers} answer${answers === 1 ? " is" : "s are"} saved.`;
  const position = durationSecs ? Math.min(100, (durationSecs / MAX_SECONDS) * 100) : null;
  const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <>
      <section className="flex flex-col gap-5 pb-12 pt-14">
        <span className="self-start border-[1.5px] border-signal-text px-3 py-2 font-mono text-[13px] font-medium text-signal-text">
          INCOMPLETE
        </span>
        <h1 className="m-0 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.045em] sm:text-8xl">No score this time.</h1>
        <p className="m-0 max-w-[640px] text-[19px] leading-normal text-soft">
          {why} A score needs a finished interview with at least {MIN_ANSWERS_FOR_SCORE} answers.
        </p>
      </section>

      <section aria-label="What happened" className="flex flex-col gap-7 border-t border-ink pb-10 pt-8">
        {position !== null && durationSecs && (
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between font-mono text-xs text-muted">
              <span>00:00</span>
              <span>15:00</span>
            </div>
            <div className="relative h-10 border border-ink">
              <div className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${position}%` }} />
              <div className="absolute -inset-y-2.5 w-[3px] bg-signal" style={{ left: `${position}%` }} />
            </div>
            <span className="font-mono text-xs text-signal-text" style={{ marginLeft: `min(${position}%, calc(100% - 16rem))` }}>
              ↑ {endReason === "user" || endReason === "agent" ? "ENDED" : endReason === "conduct" ? "ENDED BY INTERVIEWER" : "CONNECTION LOST"} ·{" "}
              {clock(durationSecs)}
            </span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3.5">
          <Squares filled={Math.min(answers, MIN_ANSWERS_FOR_SCORE)} total={MIN_ANSWERS_FOR_SCORE} size={16} dashedEmpty />
          <Label>
            {Math.min(answers, MIN_ANSWERS_FOR_SCORE)} of {MIN_ANSWERS_FOR_SCORE} answers needed
          </Label>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-7 border-t border-ink pb-10 pt-8">
        {left > 0 ? (
          <Link href="/dashboard/interview/start" className={buttonPrimary}>
            Retake interview <Arrow />
          </Link>
        ) : (
          <p className="m-0 text-[17px] text-soft">That&apos;s today&apos;s three. Retake tomorrow.</p>
        )}
        <Label className="text-muted">
          {left} of {DAILY_INTERVIEW_LIMIT} left today
        </Label>
      </section>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mongoose document
function Scored({ interview, dialogue }: { interview: any; dialogue: DialogueItem[] }) {
  const evaluation = interview.evaluation;
  const criteria = evaluation?.criteria;
  const evidence: Evidence[] = evaluation?.evidence ?? [];

  return (
    <>
      <section className="flex flex-wrap items-end gap-12 py-14">
        <div className="flex flex-[1_1_340px] flex-col gap-2">
          <h1 className="m-0">
            <Label>Score</Label>
          </h1>
          <p className="m-0 font-display text-[140px] font-extrabold leading-[0.82] tracking-[-0.06em] sm:text-[220px]">
            {interview.score ?? "—"}
          </p>
          <p className="m-0 mt-2 text-base text-muted">
            out of 10{interview.experienceLevel ? `, against ${interview.experienceLevel}-level expectations` : ""}
          </p>
        </div>

        {criteria && (
          <table className="flex-[1_1_520px] border-collapse text-base">
            <caption className="pb-2.5 text-left font-mono text-xs text-muted">HOW IT ADDS UP</caption>
            <tbody>
              {(Object.keys(CRITERIA) as Criterion[]).map((key, i) => {
                const c = criteria[key];
                return (
                  <tr key={key} className={`border-t ${i === 0 ? "border-ink" : "border-rule"} align-top`}>
                    <th scope="row" className="py-3.5 pr-3 text-left font-semibold">
                      {CRITERIA[key].label}
                      {c?.summary && <span className="mt-1 block text-sm font-normal text-muted">{c.summary}</span>}
                    </th>
                    <td className="whitespace-nowrap px-3 py-3.5 font-mono text-[13px] text-muted">× {CRITERIA[key].weight * 100}%</td>
                    <td className="py-3.5 text-right font-display text-[28px] font-extrabold">{c?.assessed ? c.score : "n/a"}</td>
                  </tr>
                );
              })}
              {evaluation.fluency?.score && (
                <tr className="border-t border-dashed border-ink align-top">
                  <th scope="row" className="py-3.5 pr-3 text-left font-semibold">
                    English fluency
                    {evaluation.fluency.summary && (
                      <span className="mt-1 block text-sm font-normal text-muted">{evaluation.fluency.summary}</span>
                    )}
                  </th>
                  <td className="whitespace-nowrap px-3 py-3.5 font-mono text-[13px] text-muted">not counted</td>
                  <td className="py-3.5 text-right font-display text-[28px] font-extrabold text-muted">{evaluation.fluency.score}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {evaluation?.manipulationAttempt && (
        <p role="alert" className="mb-8 border-l-2 border-signal py-1 pl-4 text-[17px]">
          You asked the evaluator for a particular score during the interview. That was ignored.
        </p>
      )}

      {interview.feedback && (
        <p className="m-0 max-w-[760px] border-t border-ink pb-10 pt-7 text-[19px] leading-normal text-soft">{interview.feedback}</p>
      )}

      {dialogue.length > 0 && (
        <section aria-labelledby="where" className="flex flex-col gap-7 border-t border-ink pt-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <SectionTitle id="where">Where the score came from</SectionTitle>
            <span className="flex gap-5 font-mono text-xs">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-3.5 bg-mark shadow-[inset_0_-2px_0_var(--color-signal)]" />
                EARNED POINTS
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-3.5 border-b-2 border-dashed border-ink" />
                COST POINTS
              </span>
            </span>
          </div>
          <Transcript dialogue={dialogue} evidence={evidence} />
        </section>
      )}

      {(evaluation?.strengths?.length > 0 || evaluation?.improvements?.length > 0) && (
        <section className="mt-12 grid grid-cols-1 gap-10 border-t border-ink pt-7 md:grid-cols-2">
          <Points title="Keep doing" items={evaluation.strengths} />
          <Points title="Next time" items={evaluation.improvements} accent />
        </section>
      )}
    </>
  );
}

function Transcript({ dialogue, evidence }: { dialogue: DialogueItem[]; evidence: Evidence[] }) {
  const unused = [...evidence];
  return (
    <div className="mt-4 grid grid-cols-1 items-start gap-x-8 gap-y-5 text-lg leading-relaxed md:grid-cols-[110px_minmax(0,1fr)_280px]">
      {dialogue.map((item, i) => {
        const isCandidate = item.role === "user";
        // Each quote is attached to the first candidate turn it appears in.
        const { segments, notes } = isCandidate ? annotate(item.message, unused) : { segments: [{ text: item.message }], notes: [] };
        for (const n of notes) unused.splice(unused.indexOf(n), 1);

        return (
          <div key={i} className="contents">
            <span className={`pt-1 font-mono text-xs ${isCandidate ? "text-signal-text" : "text-muted"}`}>
              {isCandidate ? "YOU" : "MARCUS"}
            </span>
            <p className={`m-0 ${isCandidate ? "" : "text-soft"} ${notes.length ? "" : "md:col-span-2"}`}>
              {segments.map((seg, j) =>
                seg.evidence?.polarity === "+" ? (
                  <mark key={j} className="bg-mark px-0.5 text-ink shadow-[inset_0_-3px_0_var(--color-signal)]">
                    {seg.text}
                  </mark>
                ) : seg.evidence ? (
                  <span key={j} className="underline decoration-ink decoration-dashed decoration-2 underline-offset-[5px]">
                    {seg.text}
                  </span>
                ) : (
                  <span key={j}>{seg.text}</span>
                )
              )}
            </p>
            {notes.length > 0 && (
              <div className="flex flex-col gap-4">
                {notes.map((n, j) => (
                  <div
                    key={j}
                    className={`flex flex-col gap-1 py-0.5 pl-4 ${n.polarity === "+" ? "border-l-2 border-signal" : "border-l-2 border-dashed border-ink"}`}
                  >
                    <span className={`font-mono text-xs ${n.polarity === "+" ? "text-signal-text" : ""}`}>
                      {n.polarity === "+" ? "+" : "−"} {CRITERIA[n.criterion]?.label.replace(" knowledge", "").toUpperCase()}
                    </span>
                    <span className="text-[15px] leading-normal">{n.note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Points({ title, items, accent = false }: { title: string; items?: string[]; accent?: boolean }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>
        <span className={accent ? "text-signal-text" : ""}>{title}</span>
      </SectionTitle>
      <ol className="m-0 flex list-none flex-col p-0">
        {items.map((item, i) => (
          <li key={i} className={`border-t border-rule py-3.5 font-display text-lg font-semibold ${i === items.length - 1 ? "border-b" : ""}`}>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}
