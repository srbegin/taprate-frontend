'use client'

// Landing-page header. Signed-in visitors get a Dashboard link instead of Sign in.

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Wordmark from '@platform/shared/ui/Wordmark'

const LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#features',     label: 'Features' },
  { href: '/#faq',          label: 'FAQ' },
]

export default function SiteHeader() {
  const { status } = useSession()
  const signedIn = status === 'authenticated'

  return (
    <header className="sticky top-0 z-30 bg-stone-50/85 backdrop-blur border-b border-stone-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-8">
        <Link href="/" aria-label="Cleanpulse home"><Wordmark className="text-xl" /></Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-stone-600">
          {LINKS.map(l => <Link key={l.href} href={l.href} className="hover:text-stone-900 transition-colors">{l.label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link href={signedIn ? '/dashboard' : '/auth/login'}
            className="text-sm font-medium text-stone-700 hover:text-stone-900 px-2 py-1.5">
            {signedIn ? 'Dashboard' : 'Sign in'}
          </Link>
          <Link href="/#early-access"
            className="bg-brand hover:bg-brand-hover text-white rounded-lg px-3.5 sm:px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap">
            Get early access
          </Link>
        </div>
      </div>
    </header>
  )
}
