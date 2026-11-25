"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const POLL_MS = 3000;

/** While the interview is processing or being scored, poll and refresh the page when it moves on. */
export function ResultPoller({ id, status, scoring }: { id: string; status: string; scoring: string | null }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/interviews/${id}`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.status !== status || data.scoring !== scoring) router.refresh();
      } catch {
        // Network blip: try again on the next tick.
      }
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [id, status, scoring, router]);

  return null;
}

export function RetryScoringButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const retry = async () => {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/interviews/${id}/score`, { method: "POST" }).catch(() => null);
    if (res?.ok) {
      router.refresh();
    } else {
      setError("Could not restart scoring. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={retry}
        disabled={busy}
        className="px-5 py-2.5 bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg font-bold text-sm rounded-xl disabled:opacity-50"
      >
        {busy ? "Retrying…" : "Try scoring again"}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
