import { getSession, signOut } from 'next-auth/react'

/**
 * Logout utility — blacklists the refresh token server-side, then clears
 * the next-auth session client-side.
 *
 * Usage (replace any bare signOut() calls with this):
 *   import { logout } from '@/lib/logout'
 *   await logout()
 *
 * The backend blacklist call is best-effort — if it fails (e.g. network error
 * or token already expired) we still sign out locally so the user isn't stuck.
 */
export async function logout() {
  try {
    const session = await getSession()
    if (session?.refresh) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session.access ? { Authorization: `Bearer ${session.access}` } : {}),
        },
        body: JSON.stringify({ refresh: session.refresh }),
      })
    }
  } catch {
    // Best-effort — always proceed to local sign-out
  }

  await signOut({ callbackUrl: '/auth/login' })
}