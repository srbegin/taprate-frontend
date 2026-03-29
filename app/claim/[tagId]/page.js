import { redirect } from 'next/navigation'
import ClaimTagClient from '@/components/claim/ClaimTagClient'

export default async function ClaimPage({ params }) {
  const { tagId } = await params

  let claimed = false
  let locationId = null

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tags/${tagId}/`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data = await res.json()
      claimed = data.claimed
      locationId = data.location_id
    }
  } catch {}

  // Already claimed — send customer straight to survey
  if (claimed && locationId) {
    redirect(`/s/${locationId}`)
  }

  // Unclaimed — show setup UI
  return <ClaimTagClient tagId={tagId} />
}