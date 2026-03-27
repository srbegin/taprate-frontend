'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { MapPin, ClipboardList, LogOut, Zap } from 'lucide-react'
import { clsx } from 'clsx'

const NAV = [
  { href: '/dashboard/locations', label: 'Locations', icon: MapPin },
  { href: '/dashboard/surveys', label: 'Surveys', icon: ClipboardList },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const org = session?.user?.organization

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-black" />
          <span className="font-semibold text-gray-900 text-sm">Cleanpulse</span>
        </div>
        {org && (
          <p className="text-xs text-gray-400 mt-1 truncate">{org.name}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-gray-900 truncate">
            {session?.user?.name}
          </p>
          <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}