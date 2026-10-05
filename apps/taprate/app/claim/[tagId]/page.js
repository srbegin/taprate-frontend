import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import ClaimTagClient from '@platform/shared/claim/ClaimTagClient'
import { clientIpFrom, getTagStatus, mintTagSession } from '@platform/shared/api/server'

export default async function ClaimPage({ params }) {
  const { tagId } = await params

  const tag = await getTagStatus(tagId)

  // Already claimed — mint a session token then send customer to survey
  if (tag?.claimed) {
    const session = await mintTagSession(tagId, clientIpFrom(await headers()))

    // redirect() must be called outside try/catch — it works by throwing
    // internally and catch blocks will swallow it
    if (session?.token) {
      redirect(`/s/${session.token}`)
    } else {
      redirect('/survey-unavailable')
    }
  }

  // Unclaimed — show setup UI
  return <ClaimTagClient tagId={tagId} />
}
