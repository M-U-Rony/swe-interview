"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import ProfileOptions from "@/components/profileOptions";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    username: string;
    email: string;
    userId: string;
    fullName?: string;
    profileImage?: string | null;
  };
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const displayName = user.fullName || user.username;
  const initials = displayName.substring(0, 2);

  // Sync theme with document element
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || 
                   localStorage.getItem("theme") === "dark";
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

  const menuItems = [
    {
      name: "Dashboard Overview",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Upload Resume",
      href: "/dashboard/resumes",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "Start AI Interview",
      href: "/dashboard/interview",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      name: "Interview History",
      href: "/dashboard/history",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex bg-brand-light-bg dark:bg-brand-dark-bg text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 fixed lg:inset-y-0 bg-white/70 dark:bg-brand-dark-bg/60 border-r border-brand-light-primary/20 dark:border-brand-dark-primary/20 backdrop-blur-md z-20">
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-brand-light-primary/20 dark:border-brand-dark-primary/20">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-brand-dark-secondary dark:text-brand-light-primary"
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
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-dark-secondary to-brand-dark-accent dark:from-brand-light-primary dark:to-brand-light-accent bg-clip-text text-transparent">
              Interview.AI
            </span>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-brand-light-primary/15 dark:hover:bg-brand-dark-secondary/20 hover:text-brand-dark-secondary dark:hover:text-brand-light-primary"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Trigger */}
        <div className="p-4 border-t border-brand-light-primary/20 dark:border-brand-dark-primary/20 bg-brand-light-accent/10 dark:bg-brand-dark-bg/20">
          <Link
            href="/dashboard/profile"
            className="w-full flex items-center space-x-3 p-2.5 rounded-xl hover:bg-brand-light-primary/20 dark:hover:bg-brand-dark-secondary/35 text-left transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg flex items-center justify-center font-bold text-lg uppercase shadow-sm overflow-hidden flex-shrink-0">
              {user.profileImage ? (
                <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden flex">
          <div className="fixed inset-0 bg-brand-dark-bg/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          
          <aside className="relative flex flex-col w-64 max-w-xs bg-brand-light-bg dark:bg-brand-dark-bg border-r border-brand-light-primary/20 dark:border-brand-dark-primary/20 p-4 space-y-4 animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-brand-light-primary/20 dark:border-brand-dark-primary/20">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-dark-secondary to-brand-dark-accent dark:from-brand-light-primary dark:to-brand-light-accent bg-clip-text text-transparent">
                  Interview.AI
                </span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-brand-light-primary/10">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg shadow-md"
                        : "text-gray-600 dark:text-gray-400 hover:bg-brand-light-primary/15 dark:hover:bg-brand-dark-secondary/20 hover:text-brand-dark-secondary dark:hover:text-brand-light-primary"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-brand-light-primary/20 dark:border-brand-dark-primary/20">
              <Link
                href="/dashboard/profile"
                onClick={() => {
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-2 rounded-xl hover:bg-brand-light-accent/40"
              >
                <div className="w-9 h-9 rounded-full bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg flex items-center justify-center font-bold text-sm uppercase overflow-hidden flex-shrink-0">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/50 dark:bg-brand-dark-bg/40 border-b border-brand-light-primary/20 dark:border-brand-dark-primary/20 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
          
          {/* Hamburger trigger for mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-brand-light-primary/20 dark:hover:bg-brand-dark-secondary/35 text-gray-600 dark:text-gray-300 lg:hidden transition-colors focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title based on route */}
          <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white uppercase">
            {pathname === "/dashboard" && "Overview"}
            {pathname === "/dashboard/resumes" && "My Resumes"}
            {pathname === "/dashboard/interview" && "AI Practice Arena"}
            {pathname === "/dashboard/interview/start" && "Live Interview"}
            {pathname === "/dashboard/history" && "Session History"}
            {pathname === "/dashboard/profile" && "Profile Settings"}
          </h1>

          {/* Nav Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-brand-light-accent/30 dark:hover:bg-brand-dark-secondary/30 text-gray-600 dark:text-gray-300 transition-colors focus:outline-none"
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

            {/* Profile trigger in Navbar (Desktop/Mobile) */}
            <Link
              href="/dashboard/profile"
              className="flex items-center space-x-2 hover:opacity-85 focus:outline-none transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg flex items-center justify-center font-bold text-sm uppercase shadow-sm overflow-hidden flex-shrink-0">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <span className="hidden sm:inline text-sm font-semibold text-gray-700 dark:text-gray-300">
                {displayName}
              </span>
            </Link>
          </div>
        </header>

        {/* Dashboard Main Page Panel */}
        <main className="flex-grow p-6 md:p-8 bg-brand-light-bg/40 dark:bg-brand-dark-bg/10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
