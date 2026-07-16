"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();

  useEffect(() => {
    async function executeSignOut() {
      try {
        const res = await fetch("/api/signout", { method: "POST" });
        if (res.ok) {
          router.refresh();
          router.push("/");
        } else {
          // If fallback fails, force push to home page
          router.push("/");
        }
      } catch (err) {
        console.error("Signout failed:", err);
        router.push("/");
      }
    }

    executeSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-light-bg dark:bg-brand-dark-bg text-gray-900 dark:text-white px-4">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl max-w-sm w-full text-center space-y-6">
        <svg
          className="w-12 h-12 text-brand-light-primary dark:text-brand-dark-primary animate-spin mx-auto"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <h2 className="text-xl font-bold">Signing Out...</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Clearing your secure session cache and returning you to the main page.
        </p>
      </div>
    </div>
  );
}
