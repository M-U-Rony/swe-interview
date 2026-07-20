import dbConnect from "@/utils/dbConnection";
import { Interview,AiFeedback} from "@/models/model";

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params;

  await dbConnect();
  const interview = await Interview.findOne({ conversationId: id });

  // Parse dialogue
  let dialogue = [];
  try {
    dialogue = JSON.parse(interview.transcript || "[]");
  } catch (err) {
    console.error("Failed to parse transcript json:", err);
  }

  let feedback = "";
  let score = 0;

  try {
    const res= await fetch(`http://localhost:3000/api/get-summary`,{
      method: "POST",
      headers:{
        "Content-type": "application/json"
      },
      body:interview.transcript
    })

    if(!res.ok){
      console.log("error in getting summary");
    } else {
      const data = await res.json();
      score = data.score || 0;
      feedback = data.feedback || "";


      await Interview.updateOne(
        {conversationId: id},
        {$set: { score: data.score} }
      )

      await AiFeedback.updateOne(
  { conversationId: id },
  {
    $set: { 
      aiFeedback: data.feedback,
      interviewId: interview._id
    }
  },
  { upsert: true }
);

    }
  } catch (error) {
    console.log(error)
  }


  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-brand-dark-secondary to-brand-dark-accent dark:from-brand-light-primary dark:to-brand-light-accent bg-clip-text text-transparent">
          Interview Complete
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Review your performance summary, evaluation score, and transcription.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Badge Card */}
        <div className="bg-white/40 dark:bg-brand-dark-bg/20 border border-brand-light-secondary dark:border-brand-dark-primary/10 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            Evaluation Score
          </h2>
          {score ? (
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-brand-light-secondary/40 dark:border-brand-dark-primary/10 flex items-center justify-center">
                <span className="text-4xl font-black text-brand-dark-secondary dark:text-brand-light-accent">
                  {score}
                </span>
                <span className="text-xs text-gray-400 font-medium ml-0.5 mt-2">/10</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Score</p>
          )}
        </div>

        {/* AI Feedback Card */}
        <div className="md:col-span-2 bg-white/40 dark:bg-brand-dark-bg/20 border border-brand-light-secondary dark:border-brand-dark-primary/10 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Marcus's Feedback Summary
            </h2>
            {feedback ? (
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-light whitespace-pre-line">
                {feedback}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No feedback summary generated.</p>
            )}
          </div>
        </div>
      </div>

      {/* Transcript List */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Dialogue Transcript
        </h2>
        <div className="space-y-4 pt-4 border-t border-brand-light-primary/20 dark:border-brand-dark-primary/10">
          {dialogue.length === 0 ? (
            <div className="text-center p-8 bg-white/50 dark:bg-brand-dark-bg/25 border border-brand-light-secondary dark:border-brand-dark-primary/10 rounded-2xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">No transcript entries recorded.</p>
            </div>
          ) : (
            dialogue.map((item: any, index: number) => {
              const isAgent = item.role === "agent";
              return (
                <div 
                  key={index} 
                  className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
                >
                  <div 
                    className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm transition-all ${
                      isAgent 
                        ? "bg-white dark:bg-brand-dark-accent/20 border border-brand-light-secondary dark:border-brand-dark-primary/10 text-gray-900 dark:text-white rounded-tl-none" 
                        : "bg-brand-dark-secondary text-white dark:bg-brand-light-primary dark:text-brand-dark-bg rounded-tr-none"
                    }`}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5 opacity-65">
                      {isAgent ? "Marcus (AI Interviewer)" : "You (Candidate)"}
                    </p>
                    <p className="text-sm leading-relaxed">{item.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}