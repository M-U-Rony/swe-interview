import Link from "next/link";
import InterviewLog, { type LogInterview } from "@/components/interviewLog";
import { Arrow, Label, MicIcon, SectionTitle, Squares, buttonPrimary } from "@/components/ui";
import { getUserSession } from "@/lib/auth";
import { DAILY_INTERVIEW_LIMIT, interviewsStartedToday, reconcileOpenInterviews } from "@/lib/interviews";
import { Interview, Profile, Resume } from "@/models/model";
import dbConnect from "@/utils/dbConnection";

const RECENT = 5;
const editable = "underline decoration-signal decoration-4 underline-offset-[10px] hover:text-signal-text";

export default async function DashboardPage() {
  const session = await getUserSession();
  if (!session) return null; // the layout redirects

  await dbConnect();
  await reconcileOpenInterviews(session.userId);

  const [profile, resume, usedToday, recent, total] = await Promise.all([
    Profile.findOne({ user: session.userId }).lean<{ targetRole?: string; experienceLevel?: string }>(),
    Resume.findOne({ author: session.userId }).select("fileName").lean<{ fileName?: string }>(),
    interviewsStartedToday(session.userId),
    Interview.find({ user: session.userId }).sort({ createdAt: -1 }).limit(RECENT).lean<LogInterview[]>(),
    Interview.countDocuments({ user: session.userId }),
  ]);

  const hasProfile = Boolean(profile?.targetRole && profile?.experienceLevel);
  const left = Math.max(0, DAILY_INTERVIEW_LIMIT - usedToday);
  const ready = hasProfile && Boolean(resume) && left > 0;

  return (
    <>
      <section className="flex flex-col gap-10 pb-14 pt-16 sm:pt-18">
        <Label className="text-muted">Next interview</Label>

        {/* D10: the interview is built from this sentence. Each part links to where it is changed. */}
        <h1 className="m-0 max-w-[1040px] font-display text-4xl font-extrabold leading-[1.15] tracking-[-0.03em] sm:text-[64px] sm:leading-[1.12]">
          You are practising for{" "}
          <Link href="/dashboard/profile" className={editable}>
            {profile?.targetRole || "[set a role]"}
          </Link>{" "}
          at{" "}
          <Link href="/dashboard/profile" className={editable}>
            {profile?.experienceLevel || "[set a level]"}
          </Link>{" "}
          level, using{" "}
          <Link href="/dashboard/resumes" className={editable}>
            {resume?.fileName || "[upload a resume]"}
          </Link>
          .
        </h1>
        <p className="m-0 text-[15px] text-muted">Tap an underlined part to change it.</p>

        <div className="flex flex-wrap items-center gap-8">
          {ready ? (
            <Link href="/dashboard/interview/start" className={buttonPrimary}>
              <MicIcon /> Start interview
            </Link>
          ) : (
            <p className="m-0 max-w-md text-[17px] text-soft">
              {!hasProfile
                ? "Set your role and level to start."
                : !resume
                  ? "Upload your resume to start."
                  : "That's today's three. Come back tomorrow."}
            </p>
          )}
          <div className="flex items-center gap-3.5">
            <Squares filled={usedToday} total={DAILY_INTERVIEW_LIMIT} />
            <Label>
              {left} of {DAILY_INTERVIEW_LIMIT} left today
            </Label>
          </div>
        </div>
      </section>

      <section aria-labelledby="log" className="flex flex-col border-t border-ink pt-7">
        <div className="flex items-baseline justify-between gap-3 pb-5">
          <SectionTitle id="log">Log</SectionTitle>
          {total > RECENT ? (
            <Link href="/dashboard/history" className="inline-flex items-center gap-2 text-[15px] font-semibold">
              All {total} interviews <Arrow />
            </Link>
          ) : (
            <span className="font-mono text-[13px] text-muted">
              {total} interview{total === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <InterviewLog interviews={recent} />
      </section>
    </>
  );
}
