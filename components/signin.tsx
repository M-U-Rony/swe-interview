"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Sync mode based on query params
  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isSignUp ? "/api/signup" : "/api/signin";
      const payload = isSignUp ? { username, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong. Please check your credentials.");
      }

      if (isSignUp) {
        setSuccess("Account created successfully! Switching to Sign In...");
        setTimeout(() => {
          setIsSignUp(false);
          setUsername("");
          setPassword("");
          setSuccess("");
          router.push("/signin");
        }, 2000);
      } else {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          router.refresh();
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-brand-light-bg via-brand-light-accent/20 to-brand-light-secondary/20 dark:from-brand-dark-bg dark:via-brand-dark-accent/20 dark:to-brand-dark-secondary/10">
      {/* Dynamic background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-dark-secondary/10 dark:bg-brand-dark-primary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl border border-brand-light-secondary dark:border-brand-dark-primary/25">
          {/* Logo / Header */}
          <div className="text-center space-y-3 mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <svg
                className="w-8 h-8 text-brand-dark-secondary dark:text-brand-light-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-dark-secondary to-brand-dark-accent dark:from-brand-light-primary dark:to-brand-light-accent bg-clip-text text-transparent">
                Interview.AI
              </span>
            </Link>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isSignUp
                ? "Start preparing for your experience-based interviews"
                : "Welcome back! Enter your details to continue"}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/30">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-900/30 animate-pulse">
                {success}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-white dark:bg-brand-dark-bg/40 text-sm text-gray-900 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark-primary/50 dark:focus:ring-brand-dark-primary/50 transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-white dark:bg-brand-dark-bg/40 text-sm text-gray-900 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark-primary/50 dark:focus:ring-brand-dark-primary/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-white dark:bg-brand-dark-bg/40 text-sm text-gray-900 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark-primary/50 dark:focus:ring-brand-dark-primary/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 font-bold text-sm bg-brand-dark-secondary hover:bg-brand-dark-secondary/90 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/90 text-white dark:text-brand-dark-bg rounded-2xl shadow-lg hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
              )}
            </button>
          </form>

          {/* Toggle link */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError("");
                    setSuccess("");
                    router.push("/signin");
                  }}
                  className="font-bold text-brand-dark-primary hover:text-brand-dark-secondary dark:text-brand-light-primary dark:hover:text-brand-light-secondary hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError("");
                    setSuccess("");
                    router.push("/signin?signup=true");
                  }}
                  className="font-bold text-brand-dark-primary hover:text-brand-dark-secondary dark:text-brand-light-primary dark:hover:text-brand-light-secondary hover:underline"
                >
                  Sign Up Free
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
