// Placeholder landing — the real Cleanpulse site comes with the design pass (session 5).
import Link from 'next/link'
import Wordmark from '@platform/shared/ui/Wordmark'

const STEPS = [
  { title: 'Stick', body: 'Placards arrive ready to go. Put one up in each restroom.' },
  { title: 'Tap', body: 'Customers tap or scan to rate it or report what needs attention.' },
  { title: 'Fix', body: 'Your team gets one alert per issue — not a flood of repeats.' },
]

export default function Home() {
  return (
    <main className="full-screen-page flex flex-col items-center justify-center px-6 py-16 bg-[#0e0e11]">
      <div className="w-full max-w-xl text-center">
        <Wordmark className="text-3xl" />

        <h1 className="mt-8 text-4xl sm:text-5xl font-semibold text-white tracking-tight leading-tight">
          Restroom feedback that runs itself.
        </h1>
        <p className="mt-4 text-base text-white/60 leading-relaxed">
          Customers tap or scan a placard, report what needs attention, and the right person hears
          about it. Nothing to configure.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signup"
            className="bg-brand hover:bg-brand-hover text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Create an account
          </Link>
          <Link
            href="/auth/login"
            className="border border-white/15 hover:border-white/30 text-white/80 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>

        <ol className="mt-14 grid sm:grid-cols-3 gap-4 text-left">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-medium text-brand-soft">0{i + 1}</p>
              <p className="mt-1 text-sm font-semibold text-white">{step.title}</p>
              <p className="mt-1 text-sm text-white/55 leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}
