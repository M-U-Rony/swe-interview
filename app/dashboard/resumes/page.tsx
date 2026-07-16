import Link from "next/link";

export default function ResumesPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="glass-panel p-8 rounded-3xl border border-brand-light-secondary/20 dark:border-brand-dark-primary/20 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
          Upload and manage your resumes here. You can paste raw resume text or upload documents. Once scanned, our AI will generate interview questions tailored specifically to your experience.
        </p>

        {/* Mock Upload Box */}
        <div className="border-2 border-dashed border-brand-light-primary/45 dark:border-brand-dark-primary/40 rounded-2xl p-12 text-center space-y-4 hover:bg-brand-light-accent/10 dark:hover:bg-brand-dark-secondary/5 transition-all">
          <div className="w-12 h-12 rounded-full bg-brand-light-primary/20 dark:bg-brand-dark-primary/20 text-brand-dark-secondary dark:text-brand-light-primary flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Drag & Drop your resume here, or <span className="text-brand-dark-secondary dark:text-brand-light-primary hover:underline cursor-pointer">browse</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Supports PDF, DOCX, and TXT up to 5MB</p>
          </div>
        </div>

        {/* Text Area fallback option */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Or Paste Raw Text</h3>
          <textarea
            rows={6}
            placeholder="Paste your professional experience, summary, and skills list directly here..."
            className="w-full px-4 py-3 rounded-2xl border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-white dark:bg-brand-dark-bg/40 text-sm text-gray-900 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark-primary/50 transition-all"
          />
          <button
            type="button"
            className="px-6 py-3 bg-brand-dark-secondary hover:bg-brand-dark-secondary/90 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/90 text-white dark:text-brand-dark-bg font-semibold text-sm rounded-xl transition-all shadow-md"
          >
            Submit Text Profile
          </button>
        </div>
      </div>
    </div>
  );
}
