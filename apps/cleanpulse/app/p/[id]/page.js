// cleanpulse.app/p/<placard id> — what a placard's QR code (and future vendor NFC) opens.
//   claimed  → customer survey session
//   staff    → pairing panel (unclaimed placards, or any placard with ?admin=1;
//              ?claim=1 shows the claim screen instead, to set one up for your own business)
//   business → claim screen (link this placard to a spot)
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/auth'
import { clientIpFrom, getPlacard, mintPlacardSession } from '@platform/shared/api/server'
import PairingPanel from '@/components/placards/PairingPanel'
import PlacardClaim from '@/components/placards/PlacardClaim'

export const metadata = { title: 'Cleanpulse' }

export default async function PlacardPage({ params, searchParams }) {
  const { id } = await params
  const { admin, claim, via } = await searchParams

  const placard = await getPlacard(id)
  if (!placard || placard.product !== 'cleanpulse') redirect('/survey-unavailable')

  const session   = await auth()
  const staffView = !!session?.user?.is_staff && claim !== '1' && (!placard.claimed || admin === '1')

  if (placard.claimed && !staffView) {
    const data = await mintPlacardSession(id, via === 'nfc' ? 'nfc' : 'qr', clientIpFrom(await headers()))
    redirect(data?.token ? `/s/${data.token}` : '/survey-unavailable')
  }

  return staffView ? <PairingPanel placard={placard} /> : <PlacardClaim placard={placard} />
}
