import "server-only";
import { env } from "@/lib/env";

const API = "https://api.elevenlabs.io/v1/convai";

export interface DialogueEntry {
  role: "agent" | "user";
  message: string;
  timeInCallSecs: number;
}

export interface ElevenLabsConversation {
  status: "initiated" | "in-progress" | "processing" | "done" | "failed";
  dialogue: DialogueEntry[];
  durationSecs: number | null;
  terminationReason: string | null;
}

function headers() {
  return { "xi-api-key": env().ELEVENLABS_API_KEY };
}

/** A one-time URL the browser uses to open a conversation with our agent. */
export async function getSignedUrl(): Promise<string> {
  const res = await fetch(
    `${API}/conversation/get-signed-url?agent_id=${encodeURIComponent(env().ELEVENLABS_AGENT_ID)}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`ElevenLabs signed URL failed: ${res.status}`);
  const data = await res.json();
  return data.signed_url;
}

/** Fetch a conversation. Returns null if ElevenLabs has no such conversation. */
export async function getConversation(conversationId: string): Promise<ElevenLabsConversation | null> {
  const res = await fetch(`${API}/conversations/${encodeURIComponent(conversationId)}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`ElevenLabs conversation fetch failed: ${res.status}`);

  const data = await res.json();
  const transcript: Array<{ role?: string; message?: string | null; time_in_call_secs?: number }> =
    Array.isArray(data.transcript) ? data.transcript : [];

  const dialogue: DialogueEntry[] = transcript
    .filter((t) => (t.role === "agent" || t.role === "user") && typeof t.message === "string" && t.message.trim())
    .map((t) => ({
      role: t.role as "agent" | "user",
      message: (t.message as string).trim(),
      timeInCallSecs: t.time_in_call_secs ?? 0,
    }));

  return {
    status: data.status,
    dialogue,
    durationSecs: typeof data.metadata?.call_duration_secs === "number" ? data.metadata.call_duration_secs : null,
    terminationReason: typeof data.metadata?.termination_reason === "string" ? data.metadata.termination_reason : null,
  };
}
