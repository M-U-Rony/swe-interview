"use client";

import Link from "next/link";

interface InterviewClientProps {
  fileName: string;
}

export default function InterviewClient({ fileName }: InterviewClientProps) {
  return (
    <div className="glass-panel p-8 rounded-3xl border border-brand-light-secondary/20 dark:border-brand-dark-primary/20 space-y-6 text-center max-w-2xl mx-auto shadow-md">
      <div className="w-16 h-16 rounded-full bg-brand-dark-secondary/10 dark:bg-brand-light-primary/10 text-brand-dark-secondary dark:text-brand-light-primary flex items-center justify-center mx-auto animate-bounce">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Practice Arena</h2>
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full inline-block">
          Resume Profile Active: {fileName}
        </p>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
        Our AI has successfully read your resume file. Click below to start your customized ElevenLabs voice and conversational mock interview session.
      </p>

      <div className="pt-4">
        <Link
          href="/dashboard/interview/start"
          className="inline-block px-8 py-3.5 bg-brand-dark-secondary hover:bg-brand-dark-secondary/90 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/95 text-white dark:text-brand-dark-bg font-extrabold text-sm rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
        >
          Start Mock Interview
        </Link>
      </div>
    </div>
  );
}
