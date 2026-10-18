// cleanpulse.app/t/<tag uid> — where Cleanpulse NFC tags land (Seritag stock is
// forwarded here from taprate.app/claim/<uid>).
//   paired + claimed → customer survey session
//   paired, unclaimed → the placard's page (claim, or pairing panel for staff)
//   unpaired → staff pairing panel; customers see "unavailable"
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/auth'
import { clientIpFrom, getTagStatus, mintTagSession } from '@platform/shared/api/server'
import PairingPanel from '@/components/placards/PairingPanel'

export const metadata = { title: 'Cleanpulse' }

export default async function TagPage({ params, searchParams }) {
  const { uid } = await params
  const { admin } = await searchParams

  const tag = await getTagStatus(uid)
  if (!tag || tag.product !== 'cleanpulse') redirect('/survey-unavailable')

  const session = await auth()
  const isStaff = !!session?.user?.is_staff

  if (tag.placard_id) {
    if (tag.claimed && !(isStaff && admin === '1')) {
      const data = await mintTagSession(uid, clientIpFrom(await headers()))
      redirect(data?.token ? `/s/${data.token}` : '/survey-unavailable')
    }
    redirect(`/p/${tag.placard_id}${isStaff ? '?admin=1' : ''}`)
  }

  if (!isStaff) redirect('/survey-unavailable')
  return <PairingPanel tagId={uid} />
}
