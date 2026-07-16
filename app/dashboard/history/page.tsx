export default function HistoryPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="glass-panel p-8 rounded-3xl border border-brand-light-secondary/20 dark:border-brand-dark-primary/20 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session History</h2>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
          Here you will find reports of your completed mock interviews, grading metrics, detail evaluations, and AI suggested correct responses.
        </p>

        {/* Empty state mockup */}
        <div className="bg-brand-light-accent/10 dark:bg-brand-dark-bg/20 rounded-2xl p-8 border border-brand-light-primary/10 dark:border-brand-dark-primary/10 text-center text-gray-400 dark:text-gray-500 py-16 space-y-2">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-bold">No Completed Interviews Yet</p>
          <p className="text-xs">Your completed practice transcripts and scores will appear here.</p>
        </div>
      </div>
    </div>
  );
}
