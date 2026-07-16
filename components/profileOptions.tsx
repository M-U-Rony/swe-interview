"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username: string;
    email: string;
    userId: string;
  };
}

export default function ProfileOptions({ isOpen, onClose, user }: ProfileOptionsProps) {
  const router = useRouter();
  const [username, setUsername] = useState<string>(user.username);
  const [email, setEmail] = useState<string>(user.email);
  const [updating, setUpdating] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    // Mock API call to simulate profile updates
    setTimeout(() => {
      setUpdating(false);
      setMessage({ type: "success", text: "Profile updated successfully! (Demo Mode)" });
    }, 1200);
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/signout", { method: "POST" });
      if (res.ok) {
        router.refresh();
        router.push("/");
      }
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Overlay backdrop */}
        <div 
          onClick={onClose}
          className="absolute inset-0 bg-brand-dark-bg/40 dark:bg-brand-dark-bg/60 backdrop-blur-sm transition-opacity duration-300" 
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300">
            <div className="flex h-full flex-col bg-brand-light-bg dark:bg-brand-dark-bg/95 border-l border-brand-light-primary/20 dark:border-brand-dark-primary/20 shadow-2xl overflow-y-auto">
              
              {/* Header */}
              <div className="bg-brand-dark-secondary dark:bg-brand-dark-accent p-6 text-white flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight" id="slide-over-title">
                  My Profile Settings
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md hover:bg-brand-dark-primary/30 p-1.5 transition-colors focus:outline-none"
                >
                  <span className="sr-only">Close panel</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content / Body */}
              <div className="flex-grow p-6 space-y-8">
                {/* User Large Avatar / Initials */}
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="w-20 h-20 rounded-full bg-brand-dark-secondary text-white dark:bg-brand-light-primary dark:text-brand-dark-bg flex items-center justify-center font-bold text-3xl shadow-md uppercase">
                    {user.username.substring(0, 2)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.username}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>

                {/* Profile Edit Form */}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-brand-light-primary/20 pb-2">
                    Account Details
                  </h4>

                  {message && (
                    <div className={`p-4 rounded-xl text-xs font-semibold border ${
                      message.type === "success" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-white dark:bg-brand-dark-bg/40 text-sm text-gray-900 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-white dark:bg-brand-dark-bg/40 text-sm text-gray-900 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Account ID</label>
                    <input
                      type="text"
                      value={user.userId}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-light-secondary/30 dark:border-brand-dark-primary/10 bg-gray-100 dark:bg-brand-dark-accent/10 text-sm text-gray-500 dark:text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full mt-2 py-3 bg-brand-dark-secondary hover:bg-brand-dark-secondary/90 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/90 text-white dark:text-brand-dark-bg font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {updating ? "Saving Changes..." : "Save Profile Settings"}
                  </button>
                </form>
              </div>

              {/* Footer */}
              <div className="border-t border-brand-light-primary/20 dark:border-brand-dark-primary/20 p-6 bg-brand-light-accent/10 dark:bg-brand-dark-bg/40 flex flex-col space-y-3">
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out Session</span>
                </button>
                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                  Interview.AI Platform Demo. &copy; {new Date().getFullYear()}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
