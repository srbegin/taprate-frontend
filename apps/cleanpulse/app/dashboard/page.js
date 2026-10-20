// Placeholder — the Cleanpulse dashboard (placards, alerts, setup) is built in session 5.
// proxy.js already redirects signed-out visitors to /auth/login.
import { auth } from '@/auth'
import Wordmark from '@platform/shared/ui/Wordmark'
import SignOutButton from './SignOutButton'

export const metadata = { title: 'Dashboard — Cleanpulse' }

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user

  return (
    <main className="full-screen-page flex items-center justify-center px-4 bg-stone-50">
      <div className="w-full max-w-sm text-center">
        <Wordmark />
        <div className="mt-8 bg-white border border-stone-200 shadow-sm rounded-2xl p-8">
          <h1 className="text-lg font-semibold text-stone-900">You’re signed in</h1>
          <p className="mt-1 text-sm text-stone-500">
            {user?.name || user?.email}
            {user?.organization?.name && <> · {user.organization.name}</>}
          </p>
          <p className="mt-5 text-sm text-stone-600 leading-relaxed">
            Your Cleanpulse dashboard is on its way. Placard setup and alerts will live here.
          </p>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </div>
      </div>
    </main>
  )
}
