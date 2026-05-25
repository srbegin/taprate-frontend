'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { FlaskConical } from 'lucide-react'

export default function TestModeBanner() {
  const { data: session } = useSession()

  if (!session?.user?.organization?.test_mode) return null

  return (
    <div className="flex items-center gap-2.5 bg-amber-50 border-b border-amber-200 px-6 py-2.5">
      <FlaskConical className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      <p className="text-xs text-amber-700 flex-1">
        Test mode is on — survey responses won't count toward analytics or trigger alerts.
      </p>
      <Link
        href="/dashboard/settings"
        className="text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap"
      >
        Turn off →
      </Link>
    </div>
  )
}