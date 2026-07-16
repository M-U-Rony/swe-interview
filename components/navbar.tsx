"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
            setUsername(data.user.username);
          }
        }
      } catch (err) {
        console.error("Failed to check auth status:", err);
      }
    }
    checkAuth();
  }, []);

  // Initialize theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || 
                   localStorage.getItem("theme") === "dark" ||
                   (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    if (isDark) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/signout", { method: "POST" });
      if (res.ok) {
        setIsAuthenticated(false);
        setUsername("");
        router.refresh();
        router.push("/");
      }
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <svg
                className="w-8 h-8 text-brand-dark-secondary dark:text-brand-light-primary transition-colors"
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
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-dark-secondary via-brand-dark-primary to-brand-dark-accent bg-clip-text text-transparent dark:from-brand-light-primary dark:via-brand-light-secondary dark:to-brand-light-accent">
                Interview.AI
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#features"
              className="text-sm font-medium text-gray-600 hover:text-brand-dark-secondary dark:text-gray-300 dark:hover:text-brand-light-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-brand-dark-secondary dark:text-gray-300 dark:hover:text-brand-light-primary transition-colors"
            >
              How It Works
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-brand-dark-secondary dark:text-gray-300 dark:hover:text-brand-light-primary transition-colors"
              >
                My Interviews
              </Link>
            )}
          </div>

          {/* Actions: Theme Toggle + Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-brand-light-accent/30 dark:hover:bg-brand-dark-secondary/30 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 11-7.072 0 5 5 0 017.072 0zm-.586-7.072l.707-.707M17 17l.707.707M6.343 17.657l-.707-.707" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-brand-light-accent/20 dark:bg-brand-dark-secondary/20 px-3 py-1.5 rounded-full border border-brand-light-primary/10 dark:border-brand-dark-primary/10">
                  Hi, {username}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-red-200 dark:border-red-900/30"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/signin"
                  className="text-sm font-semibold px-4 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-brand-light-accent/20 dark:hover:bg-brand-dark-accent/20 border border-transparent transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/signin?signup=true"
                  className="text-sm font-semibold bg-brand-dark-secondary hover:bg-brand-dark-secondary/90 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/90 text-white dark:text-brand-dark-bg px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-brand-light-accent/30 dark:hover:bg-brand-dark-secondary/30 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 11-7.072 0 5 5 0 017.072 0zm-.586-7.072l.707-.707M17 17l.707.707M6.343 17.657l-.707-.707" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-brand-light-accent/30 dark:hover:bg-brand-dark-secondary/30 transition-colors focus:outline-none"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-brand-light-primary/10 dark:border-brand-dark-primary/10 animate-fade-in">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link
              href="/#features"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-brand-light-accent/20 dark:hover:bg-brand-dark-accent/20"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-brand-light-accent/20 dark:hover:bg-brand-dark-accent/20"
            >
              How It Works
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-brand-light-accent/20 dark:hover:bg-brand-dark-accent/20"
              >
                My Interviews
              </Link>
            )}
            <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
              {isAuthenticated ? (
                <div className="px-3 space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Signed in as: <span className="text-gray-900 dark:text-white font-semibold">{username}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-center text-sm font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="px-3 flex flex-col space-y-2">
                  <Link
                    href="/signin"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center text-sm font-semibold border border-brand-light-primary/30 dark:border-brand-dark-primary/30 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl hover:bg-brand-light-accent/10 dark:hover:bg-brand-dark-accent/10 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signin?signup=true"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center text-sm font-semibold bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg px-4 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
