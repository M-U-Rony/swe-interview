"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.isAuthenticated);
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkAuth();
  }, []);

  return (
    <div className="flex-grow flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden py-20 lg:py-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-dark-secondary/10 dark:bg-brand-dark-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-light-secondary/10 dark:bg-brand-dark-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-brand-dark-secondary/30 dark:border-brand-dark-primary/30 bg-brand-light-accent/30 dark:bg-brand-dark-accent/10 text-xs font-semibold tracking-wide text-brand-dark-secondary dark:text-brand-light-primary mb-4 animate-bounce">
            <span>🚀 AI-Powered Interview Preparation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-gray-900 via-gray-800 to-brand-dark-secondary dark:from-white dark:via-gray-200 dark:to-brand-dark-primary bg-clip-text text-transparent">
            Master Your Next Job Interview <br />
            <span className="bg-gradient-to-r from-brand-dark-secondary via-brand-dark-primary to-brand-dark-accent bg-clip-text text-transparent dark:from-brand-light-primary dark:via-brand-light-secondary dark:to-brand-light-accent">
              Powered by Experience-Based AI
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Upload your resume, and our intelligent AI will design and conduct a realistic, custom technical or behavioral interview tailored directly to your actual experience.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href={isAuthenticated ? "/dashboard" : "/signin?signup=true"}
              className="w-full sm:w-auto text-center font-bold bg-brand-dark-secondary hover:bg-brand-dark-secondary/90 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/90 text-white dark:text-brand-dark-bg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Start Interviewing Now
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto text-center font-bold border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-brand-light-bg/40 dark:bg-brand-dark-bg/20 text-gray-700 dark:text-gray-200 hover:bg-brand-light-accent/20 dark:hover:bg-brand-dark-accent/25 px-8 py-4 rounded-2xl transition-all"
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* Hero Interactive Console Mockup */}
        <div className="mt-16 w-full max-w-4xl px-4 relative z-10">
          <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden border border-brand-light-secondary/40 dark:border-brand-dark-primary/20 transition-transform duration-500 hover:scale-[1.01]">
            {/* Window controls header */}
            <div className="bg-brand-light-accent/40 dark:bg-brand-dark-accent/30 px-4 py-3 flex items-center justify-between border-b border-brand-light-primary/10 dark:border-brand-dark-primary/10">
              <div className="flex space-x-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-400" />
              </div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                AI Interviewer Session: Senior Frontend Developer
              </span>
              <div className="w-10" />
            </div>
            {/* Console Content */}
            <div className="p-6 sm:p-8 text-left font-mono text-sm space-y-6 bg-brand-light-bg/35 dark:bg-brand-dark-bg/40 transition-colors">
              <div className="flex items-start space-x-3">
                <span className="text-brand-dark-secondary dark:text-brand-light-primary font-bold">AI:</span>
                <p className="text-gray-700 dark:text-gray-200">
                  "Hello, Rony! I see from your resume that you worked at Netflx building complex React applications. Could you tell me how you optimized page load performance and implemented state-management in your team?"
                </p>
              </div>
              <div className="flex items-start space-x-3 pl-4 border-l-2 border-brand-light-secondary dark:border-brand-dark-secondary">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">You (Voice/Text):</span>
                <p className="text-gray-600 dark:text-gray-300">
                  "We implemented lazy loading, code-splitting using Next.js dynamics, and transitioned from a heavy Redux architecture to lighter Zustand state managers to reduce bundle size by 35%."
                </p>
              </div>
              <div className="flex items-start space-x-3 text-brand-dark-secondary dark:text-brand-light-primary">
                <span className="font-bold">AI:</span>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-200">
                    "Excellent response. Your focus on measurable metrics (35% bundle reduction) is strong. Let's dig deeper: how did you handle React Server Components vs. Client Components hydration issues during this transition?"
                  </p>
                  <span className="inline-block px-2.5 py-1 rounded bg-brand-dark-secondary/10 dark:bg-brand-dark-primary/20 text-xs text-brand-dark-secondary dark:text-brand-light-primary font-sans font-bold">
                    Feedback Grade: Excellent (9/10)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 bg-brand-light-accent/20 dark:bg-brand-dark-bg/20 border-y border-brand-light-primary/10 dark:border-brand-dark-primary/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Why Prepare with Interview.AI?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Traditional mock interviews are static. Our AI platform parses your exact profile to create a custom-tailored simulation designed to test your actual experience.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-brand-dark-secondary/10 dark:bg-brand-light-primary/20 flex items-center justify-center text-brand-dark-secondary dark:text-brand-light-primary mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Resume Deep-Parsing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Our AI analyzes your experience, technologies, and achievements. No generic questions; every question relates directly to your personal tech stack.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-brand-dark-primary/10 dark:bg-brand-dark-secondary/20 flex items-center justify-center text-brand-dark-secondary dark:text-brand-light-primary mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Real-Time AI Speech</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Interact with the AI via text or mock voice, simulating a live interview scenario. The AI responds naturally to your answers and guides the flow dynamically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Actionable AI Feedback</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Receive comprehensive grading metrics, tips to improve technical answers, phrasing feedback, and resources to strengthen weak spots immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Simple 3-Step Process
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Prepare for your dream role in less than 5 minutes.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-dark-secondary dark:bg-brand-light-primary text-white dark:text-brand-dark-bg font-extrabold text-xl flex items-center justify-center shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload Your Resume</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                Upload your resume in PDF or raw text format. Our AI securely scans it to identify your career path.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-dark-primary dark:bg-brand-light-secondary text-white dark:text-brand-dark-bg font-extrabold text-xl flex items-center justify-center shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Conduct the AI Mock</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                Answer experience-based behavioral and technical questions customized exactly to your credentials.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white font-extrabold text-xl flex items-center justify-center shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review Detailed Feedback</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                Receive specific grading on all answers, correct code/responses recommendations, and visual reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="w-full max-w-5xl rounded-3xl bg-gradient-to-br from-brand-dark-secondary via-brand-dark-primary to-brand-dark-accent dark:from-brand-dark-accent dark:via-brand-dark-secondary dark:to-brand-dark-bg p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to Ace Your Next Interview?</h2>
            <p className="text-sm sm:text-base text-brand-light-bg/90 font-light leading-relaxed">
              Don't leave your performance to chance. Practice with realistic AI simulations tailored to your experience and improve your hiring odds.
            </p>
            <div className="pt-4">
              <Link
                href={isAuthenticated ? "/dashboard" : "/signin?signup=true"}
                className="inline-block bg-white text-gray-900 font-bold px-8 py-3.5 rounded-2xl hover:bg-brand-light-bg transition-all shadow hover:shadow-md transform hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
