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
    <div className="flex min-h-screen items-center justify-center px-4">
      <p role="status" className="m-0 font-mono text-[13px] uppercase tracking-[0.04em]">
        Signing out…
      </p>
    </div>
  );
}
