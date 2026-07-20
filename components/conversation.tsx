'use client';

import { useConversation } from '@elevenlabs/react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export function Conversation({ resumeText }: { resumeText: string }) {
    
    const [conversationId, setConversationId] = useState<string>("");
    const router = useRouter();

  const conversation = useConversation({
    onConnect: (conversationId) => {
        setConversationId(conversationId.conversationId);
        console.log('Connected')
    },
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const getSignedUrl = async (): Promise<string> => {
    const response = await fetch("/api/get-signed-url");
    if (!response.ok) {
      throw new Error(`Failed to get signed url: ${response.statusText}`);
    }
    const { signedUrl } = await response.json();
    return signedUrl;
  };

  const getSummary = async () => {
    try {
      const response = await fetch("/api/setup-agent", {
        method: "POST",
      });
      if (!response.ok) {
        console.error("Failed to run agent configuration setup");
      }
    } catch (err) {
      console.error("Error calling setup-agent API:", err);
    }
  };

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Run agent configuration setup programmatically on start
      await getSummary();

      const signedUrl = await getSignedUrl();

      await conversation.startSession({
        signedUrl,
        overrides: {
          agent: {
            prompt: {
              prompt: `You are Marcus, interviewing this candidate. Here is their resume: ${resumeText}`
            },
            firstMessage: `Hi! Let's start your interview for the SWE position.`
          },
        }
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, resumeText, getSummary]);

  const saveTranscriptToDB = async () => {
    const response = await fetch(`/api/get-transcript?conversationId=${conversationId}`,
      {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to get transcript: ${response.statusText}`);
    }

  };


  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();

      await saveTranscriptToDB();

      router.push(`/dashboard/interview/${conversationId}/result`);
    } catch (error) {
      console.error("Failed to stop and retrieve transcript:", error);
    }
  }, [conversation, conversationId, router, saveTranscriptToDB]);



  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';
  const aiSpeaking = isConnected && conversation.isSpeaking;
  const userSpeaking = isConnected && !conversation.isSpeaking;

  return (
    <div className="space-y-8 w-full">
      {/* Side-by-Side Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        {/* Left Side: AI Recruiter (Marcus) */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-between min-h-[260px] text-center ${
          aiSpeaking 
            ? "border-brand-dark-secondary bg-brand-light-accent/15 dark:border-brand-light-primary dark:bg-brand-dark-secondary/15 shadow-md shadow-brand-dark-secondary/5"
            : "border-brand-light-primary/10 bg-white/20 dark:bg-brand-dark-bg/10 opacity-75"
        }`}>
          <div className="w-full flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
            <span>INTERVIEWER</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              aiSpeaking 
                ? "bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg font-extrabold"
                : "bg-gray-100 dark:bg-brand-dark-accent/20"
            }`}>
              {aiSpeaking ? "SPEAKING" : isConnected ? "LISTENING" : "OFFLINE"}
            </span>
          </div>

          <div className="space-y-4 my-4 flex flex-col items-center">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow transition-all duration-300 ${
              aiSpeaking 
                ? "bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg ring-4 ring-brand-dark-secondary/20 dark:ring-brand-light-primary/20 scale-105"
                : "bg-brand-light-primary/20 dark:bg-brand-dark-primary/20 text-brand-dark-secondary dark:text-brand-light-primary"
            }`}>
              M
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Marcus (AI Recruiter)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {aiSpeaking ? "Marcus is asking a question..." : isConnected ? "Marcus is listening to you" : "Ready to start session"}
              </p>
            </div>
          </div>

          {/* Soundwave animation */}
          <div className={`wave-container text-brand-dark-secondary dark:text-brand-light-primary ${aiSpeaking ? 'wave-active' : ''}`}>
            <span className="wave-bar wave-bar-1 bg-current" />
            <span className="wave-bar wave-bar-2 bg-current" />
            <span className="wave-bar wave-bar-3 bg-current" />
            <span className="wave-bar wave-bar-4 bg-current" />
            <span className="wave-bar wave-bar-5 bg-current" />
          </div>
        </div>

        {/* Right Side: Candidate (You) */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-between min-h-[260px] text-center ${
          userSpeaking 
            ? "border-brand-dark-secondary bg-brand-light-accent/15 dark:border-brand-light-primary dark:bg-brand-dark-secondary/15 shadow-md shadow-brand-dark-secondary/5"
            : "border-brand-light-primary/10 bg-white/20 dark:bg-brand-dark-bg/10 opacity-75"
        }`}>
          <div className="w-full flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
            <span>YOU</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              userSpeaking 
                ? "bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg font-extrabold"
                : "bg-gray-100 dark:bg-brand-dark-accent/20"
            }`}>
              {userSpeaking ? "YOUR TURN" : isConnected ? "SILENT" : "OFFLINE"}
            </span>
          </div>

          <div className="space-y-4 my-4 flex flex-col items-center">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow transition-all duration-300 ${
              userSpeaking 
                ? "bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg ring-4 ring-brand-dark-secondary/20 dark:ring-brand-light-primary/20 scale-105"
                : "bg-brand-light-primary/20 dark:bg-brand-dark-primary/20 text-brand-dark-secondary dark:text-brand-light-primary"
            }`}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">You (Candidate)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {userSpeaking ? "Speak now..." : isConnected ? "Waiting for AI recruiter..." : "Microphone offline"}
              </p>
            </div>
          </div>

          {/* Soundwave animation */}
          <div className={`wave-container text-brand-dark-secondary dark:text-brand-light-primary ${userSpeaking ? 'wave-active' : ''}`}>
            <span className="wave-bar wave-bar-1 bg-current" />
            <span className="wave-bar wave-bar-2 bg-current" />
            <span className="wave-bar wave-bar-3 bg-current" />
            <span className="wave-bar wave-bar-4 bg-current" />
            <span className="wave-bar wave-bar-5 bg-current" />
          </div>
        </div>

      </div>

      {/* Control Buttons Panel */}
      <div className="flex flex-col items-center justify-center pt-6 border-t border-brand-light-primary/10 dark:border-brand-dark-primary/10 gap-3">
        {isConnected ? (
          <button
            onClick={stopConversation}
            className="px-8 py-3.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Stop Interview Call</span>
          </button>
        ) : (
          <button
            onClick={startConversation}
            disabled={isConnecting}
            className="px-8 py-3.5 bg-brand-dark-secondary hover:bg-brand-dark-secondary/95 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/95 text-white dark:text-brand-dark-bg font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Connecting Recruiter...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Start Audio Interview</span>
              </>
            )}
          </button>
        )}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
          Status: {conversation.status}
        </p>
      </div>
    </div>
  );
}
