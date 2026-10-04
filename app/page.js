'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Zap, Smartphone, BarChart2, ChevronDown, CheckCircle } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Landing page
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0e0e11] text-white font-sans antialiased">
      <Nav />
      <Hero />
      <HowItWorks />
     {/* <SocialProof /> */}
    {/* <FAQ /> */}
      <Footer />
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-violet-400" />
        <span className="font-semibold text-sm tracking-tight">TapRate</span>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/auth/login"
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/contact"
          className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Get started
        </Link>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
      <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
        NFC-powered customer feedback
      </div>

      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-5">
        Real feedback from<br />
        <span className="text-violet-400">real customers</span>
        , instantly
      </h1>

      <p className="text-white/55 text-lg leading-relaxed max-w-xl mx-auto mb-10">
        Customers tap an NFC sticker with their phone. Your survey loads in seconds — no app,
        no login, no friction. You see the results in real time.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/contact"
          className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Get TapRate →
        </Link>
        <Link
          href="/demo"
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
        >
          See a live demo
        </Link>
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: Zap,
    number: '01',
    title: 'Stick',
    body: 'Pre-encoded NFC stickers ship directly to you. Peel and place at counters, tables, doors, or point-of-sale — no setup required beyond choosing a spot.',
  },
  {
    icon: Smartphone,
    number: '02',
    title: 'Tap',
    body: 'Customers tap with any modern phone. Your survey loads in 2 seconds via a web app — no app to download, no account to create. Works on every iPhone and Android.',
  },
  {
    icon: BarChart2,
    number: '03',
    title: 'Know',
    body: 'Your dashboard updates in real time. Receive email alerts on low ratings within 60 seconds. Track trends over time and spot issues before they compound.',
  },
]

function HowItWorks() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">How it works</h2>
        <p className="text-white/50 text-base max-w-md mx-auto">
          Three steps. Fifteen minutes from unboxing to first feedback.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {STEPS.map(({ icon: Icon, number, title, body }) => (
          <div
            key={number}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-violet-400/70 font-semibold">{number}</span>
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Icon className="w-4 h-4 text-violet-400" />
              </div>
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Social Proof ──────────────────────────────────────────────────────────────

function SocialProof() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/[0.06]">
      <h2 className="text-xl font-semibold tracking-tight text-center mb-10">
        Trusted by local businesses
      </h2>
      <div className="grid sm:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-3"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, s) => (
                <span key={s} className="text-white/15 text-sm">★</span>
              ))}
            </div>
            <p className="text-sm text-white/25 italic leading-relaxed">
              Testimonial coming soon.
            </p>
            <div className="flex items-center gap-2 mt-auto pt-2">
              <div className="w-7 h-7 rounded-full bg-white/10" />
              <div>
                <div className="h-2.5 w-20 bg-white/10 rounded" />
                <div className="h-2 w-14 bg-white/[0.07] rounded mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Do customers need to download an app?',
    a: 'No. Tapping the NFC sticker opens the survey instantly in the phone\'s browser. There\'s nothing to install.',
  },
  {
    q: 'What if a customer\'s phone doesn\'t support NFC?',
    a: 'Each sticker also has a printed QR code as a fallback. Older phones and any device with NFC disabled can still scan and complete the survey.',
  },
  {
    q: 'Is customer feedback anonymous?',
    a: 'Yes by default. Customers can optionally provide their email if they want to enter a prize draw or receive a follow-up from you.',
  },
  {
    q: 'How much does it cost?',
    a: 'Contact us for current pricing — plans are based on the number of locations.',
  },
  {
    q: 'How quickly can I get started?',
    a: 'Once we ship your NFC stickers (3–5 business days), setup takes about 15 minutes.',
  },
]

function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    
    <section className="max-w-2xl mx-auto px-6 py-16 border-t border-white/[0.06]">
      <h2 className="text-xl font-semibold tracking-tight text-center mb-10">
        Common questions
      </h2>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className="border border-white/[0.07] rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              <span>{item.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-white/30 shrink-0 ml-4 transition-transform ${
                  open === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-white/50 leading-relaxed border-t border-white/[0.06] pt-3">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-white/40 mb-4">Still have questions?</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Get in touch
        </Link>
      </div>
    </section>

  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-8 py-8 px-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-white/60">TapRate</span>
      </div>
      <p className="text-xs text-white/25">
        © {new Date().getFullYear()} TapRate. All rights reserved.
      </p>
    </footer>
  )
}