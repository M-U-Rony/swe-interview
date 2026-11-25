"use client";

import { ConversationProvider } from "@elevenlabs/react";
import { Conversation } from "@/components/conversation";

export default function InterviewStartClient() {
  return (
    <ConversationProvider>
      
      <main className="flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-brand-dark-secondary to-brand-dark-accent dark:from-brand-light-primary dark:to-brand-light-accent bg-clip-text text-transparent">
            ElevenLabs AI Recruiter
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
            Ensure your microphone is enabled. Click the button below to start your real-time voice interview with Marcus.
          </p>
        </div>

        <div className="w-full bg-white/50 dark:bg-brand-dark-bg/30 p-6 rounded-3xl border border-brand-light-secondary dark:border-brand-dark-primary/20 shadow-md">
          <Conversation />
        </div>
      </main>
    </ConversationProvider>
  );
}
