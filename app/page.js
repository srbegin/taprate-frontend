import Link from 'next/link'
import { Zap } from 'lucide-react'

export const metadata = {
  title: 'TapRate — NFC-powered customer feedback',
  description: 'Deploy NFC stickers at your locations. Customers tap to rate. You get real-time insights.',
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0e0e11] text-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-violet-400" />
          <span className="font-semibold text-sm tracking-tight">TapRate</span>
        </div>
        <Link
          href="/auth/login"
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">

        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 text-xs text-violet-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
          NFC-powered feedback
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight max-w-2xl leading-[1.1] mb-6">
          Customer feedback,{' '}
          <span className="text-violet-400">one tap</span>{' '}
          away
        </h1>

        <p className="text-white/50 text-base sm:text-lg max-w-md leading-relaxed mb-12">
          Place NFC stickers at your locations. Customers tap to rate their experience.
          You get real-time alerts and insights — no app required.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <a href="mailto:hello@taprate.app?subject=I'm interested in TapRate"
            className="px-6 py-3 bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium rounded-xl transition-colors w-full sm:w-auto text-center"
          >
            Get in touch
          </a>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-medium rounded-xl transition-colors w-full sm:w-auto text-center"
          >
            Go to dashboard →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5 px-6 py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { step: '01', title: 'Stick', body: 'Place NFC tags at your locations — counters, tables, doors.' },
            { step: '02', title: 'Tap', body: 'Customers tap with their phone. No app, no friction, instant survey.' },
            { step: '03', title: 'Know', body: 'Get alerted on low ratings. Track trends. Respond faster.' },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex flex-col items-center gap-3">
              <span className="text-xs font-mono text-violet-400/60">{step}</span>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xs text-white/20">© {new Date().getFullYear()} TapRate</span>
          
           <a href="mailto:hello@taprate.app"
            className="text-xs text-white/20 hover:text-white/50 transition-colors"
          >
            hello@taprate.app
          </a>
        </div>
      </footer>

    </main>
  )
}