'use client';

import { useConversation } from '@elevenlabs/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const MAX_SECONDS = 15 * 60;

function micErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Microphone access is blocked. Click the microphone icon in your browser\'s address bar, allow access, then try again.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No microphone found. Connect a microphone and try again.';
  }
  return 'Could not use your microphone. Check your browser settings and try again.';
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function sendEndReason(interviewId: string, endReason: string) {
  // keepalive lets the request finish even if the page is navigating away.
  return fetch(`/api/interviews/${interviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endReason }),
    keepalive: true,
  }).catch(() => undefined);
}

export function Conversation() {
  const router = useRouter();
  const interviewIdRef = useRef<string | null>(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const conversation = useConversation({
    onConnect: ({ conversationId }) => {
      setStartedAt(Date.now());
      const interviewId = interviewIdRef.current;
      if (!interviewId) return;
      fetch(`/api/interviews/${interviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      }).catch((err) => console.error('Failed to register conversation:', err));
    },
    onDisconnect: async (details) => {
      // Fires for every ending: Stop button (user), agent hang-up or time limit (agent), network drop (error).
      const interviewId = interviewIdRef.current;
      interviewIdRef.current = null;
      setStartedAt(null);
      if (!interviewId) return;
      await sendEndReason(interviewId, details.reason);
      router.push(`/dashboard/interview/${interviewId}/result`);
    },
    onError: (err) => console.error('Conversation error:', err),
  });

  // Tick the on-screen timer while connected.
  useEffect(() => {
    if (startedAt === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  const startConversation = async () => {
    setError('');
    setStarting(true);
    try {
      // 1. Microphone first, so a missing mic never creates an interview record (D3).
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (micError) {
        setError(micErrorMessage(micError));
        return;
      }

      // 2. Server checks (one at a time, daily limit) and creates the interview.
      const res = await fetch('/api/interviews', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not start the interview. Please try again.');
        return;
      }
      interviewIdRef.current = data.interviewId;

      // 3. Connect to the interviewer.
      try {
        // The prompt lives on the agent (D4); we only send data.
        await conversation.startSession({
          signedUrl: data.signedUrl,
          dynamicVariables: data.dynamicVariables,
        });
      } catch (connectError) {
        console.error('Failed to start conversation:', connectError);
        interviewIdRef.current = null;
        setError('Could not connect to the interviewer. Please try again.');
      }
    } finally {
      setStarting(false);
    }
  };

  const stopConversation = () => {
    // onDisconnect (reason "user") records the ending and opens the result page.
    conversation.endSession();
  };

  const elapsed = startedAt === null ? 0 : Math.min(MAX_SECONDS, (now - startedAt) / 1000);

  const isConnected = conversation.status === 'connected';
  const isConnecting = starting || conversation.status === 'connecting';
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
        {isConnected && (
          <p className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-200" aria-label="Time used">
            {formatClock(elapsed)} / {formatClock(MAX_SECONDS)}
          </p>
        )}
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
        {error && (
          <p role="alert" className="max-w-md text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
          Status: {conversation.status}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          If your connection drops, everything said so far is saved.
        </p>
      </div>
    </div>
  );
}
