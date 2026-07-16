import Link from "next/link";

export default function InterviewPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="glass-panel p-8 rounded-3xl border border-brand-light-secondary/20 dark:border-brand-dark-primary/20 space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-light-primary/20 dark:bg-brand-dark-primary/20 text-brand-dark-secondary dark:text-brand-light-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Practice Arena</h2>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-lg mx-auto">
          You need to upload at least one resume profile before starting a mock interview. Our AI will compile behavioral and technical questions based on your actual work history.
        </p>

        <div className="pt-4">
          <Link
            href="/dashboard/resumes"
            className="inline-block bg-brand-dark-secondary hover:bg-brand-dark-secondary/90 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/90 text-white dark:text-brand-dark-bg font-bold px-8 py-3.5 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
          >
            Go Upload Resume
          </Link>
        </div>
      </div>
    </div>
  );
}
