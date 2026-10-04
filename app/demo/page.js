// app/demo/page.js
// Server component — POSTs to backend to mint a demo session token,
// then redirects to /s/{token}. On failure, redirects to /survey-unavailable.

import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DemoPage() {
  let token = null

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/demo/session/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    )
    if (res.ok) {
      const data = await res.json()
      token = data.token
    }
  } catch {
    // fall through to unavailable
  }

  if (!token) {
    redirect('/survey-unavailable')
  }

  redirect(`/s/${token}`)
}