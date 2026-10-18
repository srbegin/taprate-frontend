// app/qr/[locationId]/page.js
import { redirect } from 'next/navigation'
import { mintQrSession } from '@platform/shared/api/server'

export default async function QrPage({ params }) {
  const { locationId } = await params
  const data = await mintQrSession(locationId)
  if (!data?.token) redirect('/survey-unavailable')
  redirect(`/s/${data.token}`)
}
