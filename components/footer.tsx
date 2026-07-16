import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-light-bg/40 dark:bg-brand-dark-bg/40 border-t border-brand-light-primary/10 dark:border-brand-dark-primary/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <svg
                className="w-6 h-6 text-brand-light-primary dark:text-brand-dark-primary"
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
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-light-primary to-brand-dark-primary bg-clip-text text-transparent dark:from-brand-dark-primary dark:to-brand-light-primary">
                Interview.AI
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Empowering job seekers to land their dream role with advanced, experience-based AI mock interviews. Perfect your pitch, refine your answers, and build interview confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Product
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-sm text-gray-500 hover:text-brand-light-primary dark:text-gray-400 dark:hover:text-brand-dark-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-sm text-gray-500 hover:text-brand-light-primary dark:text-gray-400 dark:hover:text-brand-dark-primary transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company / Legal */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Legal & Community
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-sm text-gray-400 dark:text-gray-600">Privacy Policy (Demo)</span>
              </li>
              <li>
                <span className="text-sm text-gray-400 dark:text-gray-600">Terms of Service (Demo)</span>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-brand-light-primary dark:text-gray-400 dark:hover:text-brand-dark-primary transition-colors"
                >
                  Github Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-brand-light-primary/10 dark:border-brand-dark-primary/10 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Interview.AI. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-1">
            <span>Designed with</span>
            <span className="text-red-500 animate-pulse">♥</span>
            <span>for Web Dev Interviews</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
