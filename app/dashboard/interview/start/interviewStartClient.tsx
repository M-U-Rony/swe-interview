"use client";

import { ConversationProvider } from "@elevenlabs/react";
import { Conversation } from "@/components/conversation";

export default function InterviewStartClient({ targetRole, experienceLevel }: { targetRole: string; experienceLevel: string }) {
  return (
    <ConversationProvider>
      <Conversation targetRole={targetRole} experienceLevel={experienceLevel} />
    </ConversationProvider>
  );
}
