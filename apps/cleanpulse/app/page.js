// cleanpulse.app — marketing landing page.
import Link from 'next/link'
import {
  BellRing, CheckCircle2, ClipboardList, LayoutDashboard, PlugZap, ScanLine, Smartphone, Sparkles, StickyNote, Wrench,
} from 'lucide-react'
import SiteHeader from '@/components/landing/SiteHeader'
import HeroVisual from '@/components/landing/HeroVisual'
import TodayPreview from '@/components/landing/TodayPreview'
import EarlyAccessForm from '@/components/landing/EarlyAccessForm'
import SiteFooter from '@/components/landing/SiteFooter'

const DESCRIPTION =
  'Customers tap or scan a placard to rate the restroom or report what’s out. You get one clear alert, fix it, and mark it done.'

export const metadata = {
  title: 'Cleanpulse — Know the moment a restroom needs attention',
  description: DESCRIPTION,
  openGraph: {
    title: 'Cleanpulse — Know the moment a restroom needs attention',
    description: DESCRIPTION,
    url: 'https://cleanpulse.app',
    siteName: 'Cleanpulse',
    type: 'website',
  },
}

const STEPS = [
  { icon: StickyNote, title: 'Put up a placard',  body: 'Placards arrive ready to go — one per restroom. Nothing to plug in or configure.' },
  { icon: ScanLine,   title: 'Scan to set it up', body: 'Scan a placard with your phone and name the restroom. It’s live in about a minute.' },
  { icon: Smartphone, title: 'Customers report',  body: 'Anyone can tap or scan to rate the restroom or flag what’s out. No app, no sign-up.' },
  { icon: Wrench,     title: 'You fix it',        body: 'You get an alert, your team takes care of it, and you mark it done.' },
]

const FEATURES = [
  { icon: BellRing,        title: 'One alert, not twenty',    body: 'When five customers report the same empty soap dispenser, you get one alert with a count — not five emails.' },
  { icon: ClipboardList,   title: 'The issues you care about', body: 'Start with toilet paper, soap, paper towels, trash and cleaning. Add your own, like “Hand dryer broken”.' },
  { icon: Smartphone,      title: 'No app for anyone',        body: 'Customers use their phone’s camera or tap. You manage everything from a browser on your phone or computer.' },
  { icon: PlugZap,         title: 'Nothing to install',       body: 'No wiring, batteries, Wi-Fi or hubs. A placard is just a sign with a QR code and an NFC tag.' },
  { icon: LayoutDashboard, title: 'Every restroom at a glance', body: 'See what needs attention right now and how each restroom has rated over the last seven days.' },
  { icon: Sparkles,        title: 'Set it and forget it',     body: 'Once a placard is up there’s nothing to maintain. Problems come to you.' },
]

const BUSINESSES = ['Coffee shops', 'Restaurants', 'Bars', 'Gyms', 'Retail stores', 'Offices', 'Gas stations', 'Event venues', 'Salons & spas', 'Clinics']

const FAQ = [
  { q: 'Do customers need to download anything?',
    a: 'No. They point their phone’s camera at the QR code or tap the placard, and a short survey opens in the browser. There’s no app and no account.' },
  { q: 'What if someone’s phone can’t tap?',
    a: 'Every placard also has a QR code, and any phone camera can scan it.' },
  { q: 'Who gets the alerts?',
    a: 'Alerts are emailed to the address you choose in Settings, and everything shows on your dashboard until you mark it done. You choose which issues send an email.' },
  { q: 'What if lots of people report the same thing?',
    a: 'You get one alert. Repeat reports add to its count instead of sending more email, and once you mark it done, the next report starts a fresh alert.' },
  { q: 'Can I change the survey?',
    a: 'Yes. Change the question, choose which issues customers can report, add your own, ask for comments, or turn the issues step off.' },
  { q: 'Do customers have to give their name?',
    a: 'No. Customers don’t sign in or give a name or email to leave feedback.' },
  { q: 'How much does it cost?',
    a: 'Every account starts with a 30-day free trial. We’re finalizing plans now — request early access and we’ll walk you through them.' },
]

function SectionHeading({ eyebrow, title, body }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold text-teal-700">{eyebrow}</p>
      <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 text-balance">{title}</h2>
      {body && <p className="mt-4 text-lg text-stone-600 leading-relaxed">{body}</p>}
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex-1 bg-stone-50 text-stone-900">
      <SiteHeader />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-8 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-medium text-teal-800">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" /> Restroom feedback for local businesses
              </p>
              <h1 className="mt-5 text-[2.6rem] leading-[1.08] sm:text-6xl font-semibold tracking-tight text-stone-900 text-balance">
                Know the moment a restroom needs attention.
              </h1>
              <p className="mt-5 text-lg sm:text-xl text-stone-600 leading-relaxed max-w-xl">
                Customers tap or scan a Cleanpulse placard to rate the restroom or report what’s out.
                You get one clear alert, fix it, and mark it done.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#early-access"
                  className="bg-brand hover:bg-brand-hover text-white rounded-lg px-6 py-3 text-base font-semibold text-center transition-colors">
                  Request early access
                </a>
                <a href="#how-it-works"
                  className="rounded-lg border border-stone-300 hover:border-stone-400 bg-white px-6 py-3 text-base font-medium text-stone-700 text-center transition-colors">
                  See how it works
                </a>
              </div>
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-stone-500">
                {['30-day free trial', 'Works with any phone', 'No app to install'].map(item => (
                  <li key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" aria-hidden="true" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-16 bg-white border-y border-stone-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <SectionHeading eyebrow="How it works" title="Up and running in an afternoon"
              body="No hardware to install and no app for anyone to download. Put the placards up, scan each one, and you’re done." />
            <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STEPS.map((step, i) => (
                <li key={step.title} className="rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6 flex sm:block gap-4">
                  <div className="flex items-start justify-between shrink-0">
                    <span className="w-10 h-10 rounded-xl bg-teal-700 text-white grid place-items-center">
                      <step.icon className="w-5 h-5" />
                    </span>
                    <span className="hidden sm:inline text-sm font-semibold text-stone-300">0{i + 1}</span>
                  </div>
                  <div>
                    <p className="sm:mt-5 font-semibold text-stone-900">
                      <span className="sm:hidden text-stone-400 font-medium mr-1.5">{i + 1}.</span>{step.title}
                    </p>
                    <p className="mt-1.5 sm:mt-2 text-sm text-stone-600 leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Dashboard ────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div>
            <SectionHeading eyebrow="Your dashboard" title="Your whole day on one screen"
              body="Open Cleanpulse and see which restrooms need attention and why. Tap Mark done when it’s handled. Everything else is quietly working." />
            <ul className="mt-8 space-y-3 text-stone-700">
              {['Issues and low ratings, grouped by restroom', 'Ratings for the last seven days', 'Email alerts to whoever you choose', 'Works on your phone — no app needed'].map(item => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <TodayPreview />
        </section>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <section id="features" className="scroll-mt-16 bg-white border-y border-stone-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <SectionHeading eyebrow="Features" title="Built for the way restrooms actually go wrong" />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {FEATURES.map(f => (
                <div key={f.title}>
                  <span className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 grid place-items-center ring-1 ring-teal-100">
                    <f.icon className="w-5 h-5" />
                  </span>
                  <p className="mt-4 font-semibold text-stone-900">{f.title}</p>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who it's for ─────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 text-balance">
            For any business with a restroom customers use
          </h2>
          <ul className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
            {BUSINESSES.map(b => (
              <li key={b} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700">{b}</li>
            ))}
          </ul>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-16 bg-white border-y border-stone-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">Questions</h2>
            <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
              {FAQ.map(item => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-stone-900 [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="shrink-0 w-6 h-6 rounded-full border border-stone-300 grid place-items-center text-stone-500 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 pr-10 text-stone-600 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Early access ─────────────────────────────────────────────── */}
        <section id="early-access" className="scroll-mt-16 bg-teal-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white text-balance">Get Cleanpulse for your business</h2>
              <p className="mt-4 text-lg text-teal-100 leading-relaxed">
                We’re onboarding a small group of businesses first. Tell us a little about yours and we’ll get you set up —
                every account starts with a 30-day free trial.
              </p>
              <p className="mt-6 text-sm text-teal-200">
                Already have an invite?{' '}
                <Link href="/auth/signup" className="font-medium text-white underline underline-offset-4">Create your account</Link>
              </p>
            </div>
            <EarlyAccessForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
