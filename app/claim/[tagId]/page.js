import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import ClaimTagClient from '@/components/claim/ClaimTagClient'

export default async function ClaimPage({ params }) {
  const { tagId } = await params

  let claimed = false

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tags/${tagId}/`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data = await res.json()
      claimed = data.claimed
    }
  } catch {}

  // Already claimed — mint a session token then send customer to survey
  if (claimed) {
    const headersList = await headers()
    const clientIp =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headersList.get('x-real-ip') ||
      ''

    let token = null
    try {
      const sessionRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tags/${tagId}/session/`,
        {
          method: 'POST',  
          headers: {
            'Content-Type': 'application/json',
            ...(clientIp && { 'X-Forwarded-For': clientIp }),
          },
          cache: 'no-store',
        }
      )
      if (sessionRes.ok) {
        const body = await sessionRes.json()
        token = body.token
      }
    } catch {}

    // redirect() must be called outside try/catch — it works by throwing
    // internally and catch blocks will swallow it
    if (token) {
      redirect(`/s/${token}`)
    } else {
      redirect('/survey-unavailable')
    }
  }

  // Unclaimed — show setup UI
  return <ClaimTagClient tagId={tagId} />
}