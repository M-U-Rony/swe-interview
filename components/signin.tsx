"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Arrow, Label, Wordmark, buttonPrimary, inputClass } from "@/components/ui";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Starts from ?signup=true; the toggle below switches it locally.
  const [isSignUp, setIsSignUp] = useState<boolean>(searchParams.get("signup") === "true");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const switchMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setError("");
    setSuccess("");
  };

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
        // Validation errors carry a specific message (e.g. "Password must be at least 8 characters").
        throw new Error(data.errors?.[0]?.message || data.message || "Something went wrong. Please check your details.");
      }

      if (isSignUp) {
        setSuccess("Account created. You can sign in now.");
        setPassword("");
        setIsSignUp(false);
      } else {
        setSuccess("Signed in. Taking you to your dashboard…");
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 sm:px-8">
      <header className="border-b border-ink py-5">
        <Wordmark />
      </header>

      <main className="grid flex-1 grid-cols-1 gap-12 py-16 md:grid-cols-2">
        <h1 className="m-0 font-display text-6xl font-extrabold leading-[0.95] tracking-[-0.045em] sm:text-8xl">
          {isSignUp ? "Make an account." : "Welcome back."}
        </h1>

        <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-6">
          {isSignUp && (
            <label className="flex flex-col gap-2">
              <Label>Username</Label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
              <span className="text-sm text-muted">3–30 letters, numbers or _</span>
            </label>
          )}

          <label className="flex flex-col gap-2">
            <Label>Email</Label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-2">
            <Label>Password</Label>
            <input
              type="password"
              required
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            {isSignUp && <span className="text-sm text-muted">At least 8 characters</span>}
          </label>

          {error && (
            <p role="alert" className="m-0 border-l-2 border-signal pl-4 text-base">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="m-0 border-l-2 border-ink pl-4 text-base">
              {success}
            </p>
          )}

          <button type="submit" disabled={loading} className={`${buttonPrimary} cursor-pointer justify-center`}>
            {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"} <Arrow />
          </button>

          <p className="m-0 border-t border-rule pt-5 text-[15px] text-muted">
            {isSignUp ? "Already have an account? " : "New here? "}
            <button
              type="button"
              onClick={() => switchMode(!isSignUp)}
              className="cursor-pointer font-semibold text-ink underline underline-offset-4 hover:text-signal-text"
            >
              {isSignUp ? "Sign in" : "Make an account"}
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
