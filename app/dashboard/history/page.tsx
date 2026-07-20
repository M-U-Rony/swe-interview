import dbConnect from "@/utils/dbConnection";
import { Interview, AiFeedback } from "@/models/model";
import { getUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const userId = await getUserId();
  if (!userId) {
    redirect("/signin");
  }

  await dbConnect();
  
 
  const interviews = await Interview.find({ user: userId }).sort({ createdAt: -1 });

  const interviewIds = interviews.map((i) => i._id);
  const convIds = interviews.map((i) => i.conversationId).filter(Boolean);
  
  const feedbacks = await AiFeedback.find({
    $or: [
      { interviewId: { $in: interviewIds } },
      { conversationId: { $in: convIds } }
    ]
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-brand-dark-secondary to-brand-dark-accent dark:from-brand-light-primary dark:to-brand-light-accent bg-clip-text text-transparent">
          Session History
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
          Review reports of your completed mock interviews, grading metrics, detail evaluations, and conversation transcripts.
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white/40 dark:bg-brand-dark-bg/20 border border-brand-light-secondary/20 dark:border-brand-dark-primary/10 rounded-3xl p-12 text-center text-gray-400 dark:text-gray-500 py-16 space-y-3">
          <svg className="w-14 h-14 mx-auto mb-2 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base font-bold text-gray-700 dark:text-gray-300">No Completed Interviews Yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Your completed practice sessions, transcript logs, and AI feedback will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {interviews.map((interview) => {
            // Find feedback document matching this interview session
            const feedbackDoc = feedbacks.find(
              (f) => 
                String(f.interviewId) === String(interview._id) || 
                (f.conversationId && f.conversationId === interview.conversationId)
            );
            
            const feedbackText = feedbackDoc?.aiFeedback || "";
            const score = interview.score;
            
            // Parse transcript
            let dialogue = [];
            try {
              dialogue = JSON.parse(interview.transcript || "[]");
            } catch (err) {
              console.error("Failed to parse transcript for interview:", interview._id, err);
            }

            const formattedDate = new Date(interview.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div 
                key={String(interview._id)}
                className="bg-white/50 dark:bg-brand-dark-bg/15 border border-brand-light-secondary/25 dark:border-brand-dark-primary/10 rounded-3xl p-6 shadow-sm space-y-6 hover:shadow-md transition-all"
              >
                {/* Top session summary bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-brand-light-primary/20 dark:border-brand-dark-primary/10">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Mock Interview Session
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formattedDate} • ID: {interview.conversationId}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Score:</span>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-extrabold shadow-sm ${
                      score && score >= 8
                        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                        : score && score >= 5
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    }`}>
                      {score ? `${score} / 10` : "Pending"}
                    </span>
                  </div>
                </div>

                {/* AI Feedback Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    AI Evaluation Summary
                  </h4>
                  {feedbackText ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-light leading-relaxed whitespace-pre-line bg-brand-light-accent/10 dark:bg-brand-dark-bg/20 border border-brand-light-primary/10 dark:border-brand-dark-primary/10 p-4 rounded-2xl">
                      {feedbackText}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic bg-brand-light-accent/5 dark:bg-brand-dark-bg/5 p-4 rounded-2xl border border-dashed border-brand-light-primary/10 dark:border-brand-dark-primary/10">
                      AI feedback was not generated or is currently pending for this session.
                    </p>
                  )}
                </div>

                {/* Collapsible dialogue transcript accordion */}
                <details className="group border border-brand-light-secondary/40 dark:border-brand-dark-primary/10 rounded-2xl overflow-hidden bg-white/30 dark:bg-brand-dark-bg/10">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-brand-light-primary/10 dark:hover:bg-brand-dark-primary/10 transition-colors select-none">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      View Conversation Transcript ({dialogue.length} exchanges)
                    </span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200">
                      ▼
                    </span>
                  </summary>
                  <div className="p-4 border-t border-brand-light-primary/20 dark:border-brand-dark-primary/10 space-y-4 max-h-96 overflow-y-auto bg-white/20 dark:bg-brand-dark-bg/5">
                    {dialogue.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-2">
                        No transcript recorded.
                      </p>
                    ) : (
                      dialogue.map((item: any, idx: number) => {
                        const isAgent = item.role === "agent";
                        return (
                          <div 
                            key={idx} 
                            className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
                          >
                            <div 
                              className={`p-3 rounded-2xl max-w-[85%] sm:max-w-[75%] text-xs leading-relaxed shadow-sm ${
                                isAgent 
                                  ? "bg-white dark:bg-brand-dark-accent/25 border border-brand-light-secondary/30 dark:border-brand-dark-primary/15 text-gray-900 dark:text-white rounded-tl-none" 
                                  : "bg-brand-dark-secondary text-white dark:bg-brand-light-primary dark:text-brand-dark-bg rounded-tr-none"
                              }`}
                            >
                              <p className="text-[8px] font-bold uppercase tracking-widest mb-1 opacity-60">
                                {isAgent ? "Marcus (AI Interviewer)" : "You (Candidate)"}
                              </p>
                              <p>{item.message}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
