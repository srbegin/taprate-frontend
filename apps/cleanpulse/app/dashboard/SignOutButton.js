'use client'

import { logout } from '@platform/shared/auth/logout'

export default function SignOutButton() {
  return (
    <button
      onClick={() => logout()}
      className="text-sm text-brand-soft hover:text-brand-softer transition-colors"
    >
      Sign out
    </button>
  )
}
