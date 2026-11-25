import Link from "next/link";
import { Arrow, buttonPrimary, SectionTitle, Wordmark } from "@/components/ui";
import { CRITERIA, type Criterion } from "@/lib/rubric";

const WEIGHT_STYLES: Record<Criterion, string> = {
  technical: "bg-ink text-paper",
  problemSolving: "bg-signal text-ink",
  communication: "bg-surface",
  behavioral: "bg-[#D9D7CF]",
};

const RULES = [
  ["A", "Your level, your role", "Set them once in your profile. A Junior gets fundamentals; a Senior gets trade-offs and system design."],
  ["B", "Finish to be scored", "At least three answers and a proper ending. Drop out early and you keep the transcript, not a number."],
  ["C", "Three a day", "Enough to practise, few enough that each one counts."],
] as const;

export default function LandingPage({ signedIn }: { signedIn: boolean }) {
  const start = signedIn ? "/dashboard" : "/signin?signup=true";

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink py-5">
        <Wordmark />
        <nav className="flex flex-wrap items-center gap-7 text-[15px]">
          <a href="#script" className="py-2.5 no-underline hover:text-signal-text">Sample</a>
          <a href="#scoring" className="py-2.5 no-underline hover:text-signal-text">Scoring</a>
          <Link href={signedIn ? "/dashboard" : "/signin"} className="py-2.5 no-underline hover:text-signal-text">
            {signedIn ? "Dashboard" : "Sign in"}
          </Link>
        </nav>
      </header>

      <main>
        <section className="flex flex-col gap-14 pb-16 pt-16 sm:pt-22">
          <h1 className="m-0 max-w-[1080px] font-display text-6xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-8xl lg:text-[120px]">
            Rehearse the interview out loud.
          </h1>
          <div className="grid grid-cols-1 items-end gap-8 border-t border-rule pt-7 md:grid-cols-3">
            <p className="m-0 font-mono text-[13px] uppercase leading-relaxed tracking-[0.04em] text-muted">
              Voice mock interviews
              <br />
              for software engineers
            </p>
            <p className="m-0 text-[19px] leading-normal">
              Marcus reads your resume, asks questions at your level, and listens. Fifteen minutes later you get a score
              you can argue with — every number points to something you said.
            </p>
            <div className="flex flex-col items-start gap-3">
              <Link href={start} className={buttonPrimary}>
                Start an interview <Arrow />
              </Link>
              <span className="font-mono text-[13px] text-muted">15 MIN · ENGLISH · 3 PER DAY</span>
            </div>
          </div>
        </section>

        <section id="script" className="flex flex-col gap-9 border-t border-ink py-16">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <SectionTitle>(01) What it sounds like</SectionTitle>
            <span className="font-mono text-[13px] text-muted">Example · Backend Engineer · Mid</span>
          </div>
          <div className="grid grid-cols-1 items-start gap-x-8 gap-y-5 md:grid-cols-[120px_minmax(0,1fr)_260px]">
            <span className="pt-1.5 font-mono text-[13px] text-muted">MARCUS</span>
            <p className="m-0 font-display text-2xl font-semibold leading-snug tracking-[-0.01em] md:col-span-2">
              You moved the orders service onto a queue. What happens when a message arrives twice?
            </p>

            <span className="pt-1.5 font-mono text-[13px] text-signal-text">YOU</span>
            <p className="m-0 font-display text-2xl font-semibold leading-snug tracking-[-0.01em]">
              The consumer checks a table of processed IDs first.{" "}
              <mark className="bg-mark px-0.5 text-ink shadow-[inset_0_-3px_0_var(--color-signal)]">
                A unique index means a duplicate insert fails, so it is skipped.
              </mark>
            </p>
            <div className="flex flex-col gap-1.5 border-l-2 border-signal py-1 pl-4">
              <span className="font-mono text-xs text-signal-text">+ TECHNICAL</span>
              <span className="text-[15px] leading-normal">Correct idempotency pattern, named the mechanism.</span>
            </div>

            <span className="pt-1.5 font-mono text-[13px] text-muted">MARCUS</span>
            <p className="m-0 font-display text-2xl font-semibold leading-snug tracking-[-0.01em] text-muted md:col-span-2">
              And how long do you keep those IDs?
            </p>
          </div>
        </section>

        <section className="border-t border-ink py-16">
          <div className="mb-6">
            <SectionTitle>(02) The rules</SectionTitle>
          </div>
          {RULES.map(([letter, title, text], i) => (
            <div
              key={letter}
              className={`grid grid-cols-1 items-baseline gap-3 border-t border-rule py-6 md:grid-cols-[80px_minmax(0,1fr)_minmax(0,1.4fr)] md:gap-6 ${
                i === RULES.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="font-mono text-sm">{letter}</span>
              <h3 className="m-0 font-display text-[28px] font-extrabold tracking-[-0.02em]">{title}</h3>
              <p className="m-0 text-[17px] leading-normal text-soft">{text}</p>
            </div>
          ))}
        </section>

        <section id="scoring" className="flex flex-col gap-7 border-t border-ink pb-22 pt-16">
          <SectionTitle>(03) How the score adds up</SectionTitle>
          <div
            role="img"
            aria-label="Score weights: technical 35 percent, problem solving 25, communication 25, behavioral 15"
            className="flex flex-col border border-ink sm:min-h-22 sm:flex-row"
          >
            {(Object.keys(CRITERIA) as Criterion[]).map((key, i) => (
              <div
                key={key}
                style={{ flex: CRITERIA[key].weight * 100 }}
                className={`flex min-w-0 flex-row items-baseline justify-between gap-2 px-4 py-3.5 sm:flex-col sm:items-start ${WEIGHT_STYLES[key]} ${i > 0 ? "border-t border-ink sm:border-l sm:border-t-0" : ""}`}
              >
                <span className="font-mono text-xs">{CRITERIA[key].weight * 100}%</span>
                <span className="order-first text-[15px] font-semibold sm:order-none sm:truncate">{CRITERIA[key].label.replace(" knowledge", "")}</span>
              </div>
            ))}
          </div>
          <p className="m-0 max-w-[640px] text-[17px] leading-normal text-soft">
            English fluency is reported next to the score, never inside it. Accents and transcription slips are not marked
            down.
          </p>
        </section>
      </main>

      <footer className="flex flex-wrap justify-between gap-3 border-t border-ink pb-8 pt-6 font-mono text-xs text-muted">
        <span>swe/interview — portfolio project</span>
        <span>voice: elevenlabs · scoring: gemini</span>
      </footer>
    </div>
  );
}
