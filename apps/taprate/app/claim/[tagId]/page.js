import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import ClaimTagClient from '@platform/shared/claim/ClaimTagClient'
import { clientIpFrom, getTagStatus, mintTagSession } from '@platform/shared/api/server'
import { SITE_URLS } from '@platform/shared/brand'

export default async function ClaimPage({ params }) {
  const { tagId } = await params

  const tag = await getTagStatus(tagId)

  // Cleanpulse stock (e.g. the Seritag tags encoded taprate.app/claim/<uid>)
  // lives on cleanpulse.app. Printed tags are permanent, so this must stay.
  if (tag?.product === 'cleanpulse') {
    redirect(`${SITE_URLS.cleanpulse}/t/${tagId}`)
  }

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
