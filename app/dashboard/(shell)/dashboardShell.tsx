"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/ui";

const NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/resumes", label: "Resume" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/signout", { method: "POST" }).catch(() => undefined);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-18 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink py-5">
        <Wordmark href="/dashboard" />
        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-7 gap-y-1 text-[15px]">
          {NAV.map((item) => {
            const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`py-2.5 ${active ? "font-semibold underline underline-offset-[6px]" : "no-underline hover:text-signal-text"}`}
              >
                {item.label}
              </Link>
            );
          })}
          <button type="button" onClick={signOut} disabled={signingOut} className="cursor-pointer py-2.5 hover:text-signal-text disabled:opacity-50">
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
