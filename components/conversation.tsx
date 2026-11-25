'use client';

import { useConversation } from '@elevenlabs/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MicIcon, Squares } from '@/components/ui';

const MAX_SECONDS = 15 * 60;
const MIN_ANSWERS_FOR_SCORE = 3;
const METER_BARS = 8;

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

interface Line {
  role: 'user' | 'agent';
  message: string;
  at: number;
}

export function Conversation({ targetRole, experienceLevel }: { targetRole: string; experienceLevel: string }) {
  const router = useRouter();
  const interviewIdRef = useRef<string | null>(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [lines, setLines] = useState<Line[]>([]);
  const [micLevel, setMicLevel] = useState(0);

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
    onMessage: ({ message, role }) => {
      if (message?.trim()) setLines((prev) => [...prev, { role, message, at: Date.now() }]);
    },
    onDisconnect: async (details) => {
      // Fires for every ending: End button (user), agent hang-up or time limit (agent), network drop (error).
      const interviewId = interviewIdRef.current;
      interviewIdRef.current = null;
      setStartedAt(null);
      if (!interviewId) return;
      await sendEndReason(interviewId, details.reason);
      router.push(`/dashboard/interview/${interviewId}/result`);
    },
    onError: (err) => console.error('Conversation error:', err),
  });

  const isConnected = conversation.status === 'connected';

  // Tick the on-screen timer and the microphone meter while connected.
  useEffect(() => {
    if (!isConnected) return;
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const meter = setInterval(() => setMicLevel(conversation.getInputVolume()), 120);
    return () => {
      clearInterval(clock);
      clearInterval(meter);
    };
  }, [isConnected, conversation]);

  const startConversation = async () => {
    setError('');
    setStarting(true);
    setLines([]);
    try {
      // 1. Microphone first, so a missing mic never creates an interview record (D3).
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (micError) {
        setError(micErrorMessage(micError));
        return;
      }

      // 2. Server checks (profile, one at a time, daily limit) and creates the interview.
      const res = await fetch('/api/interviews', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not start the interview. Please try again.');
        return;
      }
      interviewIdRef.current = data.interviewId;

      // 3. Connect. The prompt lives on the agent (D4); we only send data.
      try {
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

  const elapsed = startedAt === null ? 0 : Math.min(MAX_SECONDS, (now - startedAt) / 1000);
  const answers = lines.filter((l) => l.role === 'user').length;
  const lastAgent = [...lines].reverse().find((l) => l.role === 'agent');
  const lastUser = [...lines].reverse().find((l) => l.role === 'user' && (!lastAgent || l.at < lastAgent.at));
  const litBars = Math.round(Math.min(1, micLevel * 3) * METER_BARS);

  return (
    <div className="flex min-h-screen flex-col bg-night text-night-text">
      <header className="flex flex-wrap items-end justify-between gap-5 px-5 pt-6 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <span className="inline-flex items-center gap-2.5 font-mono text-[13px]">
            <span className={`size-2.5 rounded-full ${isConnected ? 'bg-signal' : 'bg-night-rule'}`} />
            {isConnected ? 'LIVE' : starting || conversation.status === 'connecting' ? 'CONNECTING…' : 'READY'}
          </span>
          <span className="font-mono text-[13px] uppercase text-night-muted">
            {targetRole} · {experienceLevel}
          </span>
        </div>
        <p className="m-0 flex items-baseline gap-2.5">
          <span className="font-display text-5xl font-extrabold leading-none tracking-[-0.03em] tabular-nums sm:text-[64px]">
            {formatClock(elapsed)}
          </span>
          <span className="font-mono text-sm text-night-muted">/ {formatClock(MAX_SECONDS)}</span>
        </p>
      </header>
      <div
        role="progressbar"
        aria-label="Interview time used"
        aria-valuemin={0}
        aria-valuemax={MAX_SECONDS}
        aria-valuenow={Math.round(elapsed)}
        className="mx-5 mt-5 h-0.5 bg-night-rule sm:mx-10"
      >
        <div className="h-0.5 bg-signal" style={{ width: `${(elapsed / MAX_SECONDS) * 100}%` }} />
      </div>

      <main className="flex max-w-[1040px] flex-1 flex-col justify-center gap-9 px-5 py-14 sm:px-10">
        {isConnected ? (
          <>
            {lastUser && (
              <div className="flex flex-col gap-2.5">
                <span className="font-mono text-xs text-night-dim">YOU</span>
                <p className="m-0 text-[22px] leading-normal text-night-dim">{lastUser.message}</p>
              </div>
            )}
            <div className="flex flex-col gap-3.5">
              <span className="font-mono text-xs text-signal-on-night">
                {conversation.isSpeaking ? 'MARCUS IS SPEAKING' : 'YOUR TURN'}
              </span>
              <p aria-live="polite" className="m-0 font-display text-3xl font-semibold leading-[1.18] tracking-[-0.02em] sm:text-5xl">
                {lastAgent?.message ?? 'Connecting you to Marcus…'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-8">
            <h1 className="m-0 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
              Ready when you are.
            </h1>
            <p className="m-0 max-w-xl text-lg leading-normal text-night-muted">
              Fifteen minutes with Marcus. Find a quiet room, wait for each question to finish, then answer out loud.
              Pausing to think is fine.
            </p>
            <button
              type="button"
              onClick={startConversation}
              disabled={starting || conversation.status === 'connecting'}
              className="inline-flex cursor-pointer items-center gap-3.5 bg-night-text px-7 py-5 text-lg font-semibold text-night hover:bg-white disabled:opacity-50"
            >
              <MicIcon /> {starting || conversation.status === 'connecting' ? 'Connecting…' : 'Start interview'}
            </button>
            {error && (
              <p role="alert" className="m-0 max-w-xl border-l-2 border-signal pl-4 text-base text-night-text">
                {error}
              </p>
            )}
            <Link href="/dashboard" className="text-[15px] text-night-muted hover:text-night-text">
              Back to dashboard
            </Link>
          </div>
        )}
      </main>

      {isConnected && (
        <>
          <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-night-rule px-5 py-5 sm:px-10">
            <div className="flex items-center gap-3.5">
              <Squares filled={Math.min(answers, MIN_ANSWERS_FOR_SCORE)} total={MIN_ANSWERS_FOR_SCORE} size={12} light />
              <span className="font-mono text-[13px] text-night-muted">
                {answers} ANSWER{answers === 1 ? '' : 'S'}
                {answers >= MIN_ANSWERS_FOR_SCORE ? ' · ENOUGH FOR A SCORE' : ` · ${MIN_ANSWERS_FOR_SCORE} NEEDED FOR A SCORE`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-night-muted">
              <MicIcon size={18} />
              <div
                role="meter"
                aria-label="Your microphone level"
                aria-valuemin={0}
                aria-valuemax={METER_BARS}
                aria-valuenow={litBars}
                className="flex h-6 items-center gap-[3px]"
              >
                {Array.from({ length: METER_BARS }, (_, i) => (
                  <span
                    key={i}
                    className={`w-[3px] ${i < litBars ? 'bg-night-text' : 'bg-night-rule'}`}
                    style={{ height: 6 + (i % 3) * 4 }}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => conversation.endSession()}
              className="min-h-12 cursor-pointer border-[1.5px] border-night-text px-5 py-3 text-[15px] font-semibold hover:bg-night-text hover:text-night"
            >
              End interview
            </button>
          </footer>
          <p className="m-0 px-5 pb-6 text-sm text-night-dim sm:px-10">
            If the connection drops, everything said so far is kept.
          </p>
        </>
      )}
    </div>
  );
}
