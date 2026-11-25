import Link from "next/link";
import { getUserSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getUserSession();
  const username = session?.username ?? "Developer";

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Welcome Banner Card */}
      <section className="bg-gradient-to-br from-brand-dark-secondary via-brand-dark-primary to-brand-dark-accent p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to your AI Prep Arena, {username}!
          </h2>
          <p className="text-sm text-brand-light-bg/85 font-light leading-relaxed">
            Prepare for your dream tech interviews by simulating realistic, experience-based practice sessions. Upload a resume to let our AI build custom interview questions.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/resumes"
              className="inline-block bg-white text-gray-900 font-bold px-6 py-2.5 rounded-xl hover:bg-brand-light-bg transition-all shadow text-sm"
            >
              Upload Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Stat 1 */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex items-center space-x-4 border border-brand-light-secondary/20 dark:border-brand-dark-primary/20">
          <div className="p-3 bg-brand-dark-secondary/15 dark:bg-brand-light-primary/20 text-brand-dark-secondary dark:text-brand-light-primary rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resumes Scan</p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">0</h4>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex items-center space-x-4 border border-brand-light-secondary/20 dark:border-brand-dark-primary/20">
          <div className="p-3 bg-brand-dark-secondary/15 dark:bg-brand-light-primary/20 text-brand-dark-secondary dark:text-brand-light-primary rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interviews</p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">0</h4>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex items-center space-x-4 border border-brand-light-secondary/20 dark:border-brand-dark-primary/20">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Score</p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">N/A</h4>
          </div>
        </div>
      </section>

      {/* Action Quicklinks Grid */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-brand-light-primary/20 pb-2">
          Recommended Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <Link
            href="/dashboard/resumes"
            className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md border border-brand-light-secondary/20 dark:border-brand-dark-primary/20 flex flex-col justify-between group transition-all"
          >
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-gray-900 group-hover:text-brand-dark-secondary dark:text-white dark:group-hover:text-brand-light-primary transition-colors">
                Step 1: Upload a Resume
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                Securely import your profile in PDF or paste raw experience text. The AI parses your technical stacks, seniority, and key achievements automatically.
              </p>
            </div>
            <div className="pt-4 flex items-center space-x-1.5 text-brand-dark-secondary dark:text-brand-light-primary text-sm font-bold">
              <span>Go to upload area</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            href="/dashboard/interview"
            className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md border border-brand-light-secondary/20 dark:border-brand-dark-primary/20 flex flex-col justify-between group transition-all"
          >
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-gray-900 group-hover:text-brand-dark-secondary dark:text-white dark:group-hover:text-brand-light-primary transition-colors">
                Step 2: Start Mock Interview
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                Launch a live simulation session. Answer custom questions tailored to your experience and get evaluated directly on your answers by our AI.
              </p>
            </div>
            <div className="pt-4 flex items-center space-x-1.5 text-brand-dark-secondary dark:text-brand-light-primary text-sm font-bold">
              <span>Enter practice arena</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
