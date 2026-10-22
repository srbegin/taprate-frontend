// Public-site footer (landing + legal pages).

import Link from 'next/link'
import Wordmark from '@platform/shared/ui/Wordmark'

export const HELLO_EMAIL = 'hello@cleanpulse.app'

export default function SiteFooter() {
  return (
    <footer className="bg-stone-50 border-t border-stone-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row gap-6 md:items-center justify-between text-sm text-stone-500">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
          <Link href="/" aria-label="Cleanpulse home"><Wordmark className="text-base" /></Link>
          <span>Restroom feedback that runs itself.</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 whitespace-nowrap">
          <a href={`mailto:${HELLO_EMAIL}`} className="hover:text-stone-900">{HELLO_EMAIL}</a>
          <Link href="/terms" className="hover:text-stone-900">Terms</Link>
          <Link href="/privacy" className="hover:text-stone-900">Privacy</Link>
          <Link href="/auth/login" className="hover:text-stone-900">Sign in</Link>
          <span>© {new Date().getFullYear()} Beginnings LLC</span>
        </div>
      </div>
    </footer>
  )
}
