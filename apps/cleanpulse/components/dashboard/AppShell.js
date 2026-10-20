'use client'

// Cleanpulse dashboard frame: top bar on desktop, bottom tabs on phones
// (whoever tends the restrooms will mostly be on a phone).

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, DoorOpen, ClipboardCheck, Settings, LogOut } from 'lucide-react'
import Wordmark from '@platform/shared/ui/Wordmark'
import { logout } from '@platform/shared/auth/logout'

const NAV = [
  { href: '/dashboard',           label: 'Today',     icon: Bell },
  { href: '/dashboard/restrooms', label: 'Restrooms', icon: DoorOpen },
  { href: '/dashboard/survey',    label: 'Survey',    icon: ClipboardCheck },
  { href: '/dashboard/settings',  label: 'Settings',  icon: Settings, also: ['/dashboard/billing'] },
]

function isActive(pathname, { href, also = [] }) {
  if (href === '/dashboard') return pathname === href
  return [href, ...also].some(path => pathname.startsWith(path))
}

export default function AppShell({ children }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const orgName  = session?.user?.organization?.name
  const testMode = !!session?.user?.organization?.test_mode

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
          <Link href="/dashboard" aria-label="Cleanpulse home">
            <Wordmark className="text-lg" />
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive(pathname, item)
                    ? 'bg-stone-100 text-stone-900 font-medium'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 min-w-0">
            {orgName && <span className="text-sm text-stone-500 truncate">{orgName}</span>}
            <button
              onClick={() => logout()}
              aria-label="Sign out"
              title="Sign out"
              className="p-2 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {testMode && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-950 text-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
            Test mode is on — responses won’t send alerts or count.{' '}
            <Link href="/dashboard/settings" className="underline underline-offset-2">Turn off</Link>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-12">
        {children}
      </main>

      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-stone-200 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4">
          {NAV.map(item => {
            const { href, label, icon: Icon } = item
            const active = isActive(pathname, item)
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${
                  active ? 'text-brand font-medium' : 'text-stone-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
