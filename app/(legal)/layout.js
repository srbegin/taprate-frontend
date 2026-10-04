import Link from 'next/link';

export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0e0e11] text-zinc-200">
      <header className="border-b border-zinc-800/60">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-white hover:text-violet-400 transition-colors"
          >
            TapRate
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        {children}
      </main>

      <footer className="border-t border-zinc-800/60 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-zinc-500 flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TapRate. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <a href="mailto:hello@taprate.app" className="hover:text-zinc-300 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}