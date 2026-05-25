'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { MapPin, ClipboardList, LogOut, Zap, Menu, X, BarChart2, CreditCard, Settings, Gift, CheckCircle2 } from 'lucide-react'
import { clsx } from 'clsx'
import theme from '@/lib/theme'

const NAV = [
  { href: '/dashboard/locations', label: 'Locations', icon: MapPin },
  { href: '/dashboard/surveys',   label: 'Surveys',   icon: ClipboardList },
  { href: '/dashboard/insights',  label: 'Insights',  icon: BarChart2 },
  { href: '/dashboard/incentives',  label: 'Incentives',  icon: Gift },
  { href: '/dashboard/redeem',  label: 'Redeem',  icon: CheckCircle2 },
  { href: '/dashboard/billing',   label: 'Billing',   icon: CreditCard },
  { href: '/dashboard/settings',  label: 'Settings',  icon: Settings },
  
]

const { sidebar: s, topBar, accent } = theme

function SidebarContent({ onNav }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const org = session?.user?.organization

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`px-5 py-5 border-b ${s.border.replace('border-r ', '')}`}>
        <div className="flex items-center gap-2.5">
          <Zap className={`w-4 h-4 ${s.logo.icon}`} />
          <span className={s.logo.text}>TapRate</span>
        </div>
        {org && <p className={s.logo.orgName}>{org.name}</p>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={clsx(s.nav.base, active ? s.nav.active : s.nav.inactive)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && (
                <span className="ml-auto">
                  <span className={`block ${s.nav.dot}`} />
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 ${s.footer.border}`}>
        <div className="px-3 py-2 mb-1">
          <p className={s.footer.name}>{session?.user?.name}</p>
          <p className={s.footer.email}>{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className={s.footer.signOut}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className={`hidden md:flex ${s.width} shrink-0 h-screen sticky top-0 ${s.bg} ${s.border} flex-col`}>
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-30 ${topBar.bg} flex items-center justify-between px-4 h-14`}>
        <div className="flex items-center gap-2.5">
          <Zap className={`w-4 h-4 ${topBar.icon}`} />
          <span className={topBar.text}>TapRate</span>
        </div>
        <button onClick={() => setOpen(true)} className={topBar.menuButton} aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div className={clsx(
        `md:hidden fixed top-0 left-0 z-50 h-full w-64 ${s.bg} shadow-2xl transition-transform duration-300 ease-in-out`,
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent onNav={() => setOpen(false)} />
      </div>
    </>
  )
}