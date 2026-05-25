// app/qr/[locationId]/page.js
import { redirect, notFound } from 'next/navigation'

async function mintSession(locationId) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/survey/location/${locationId}/session/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function QrPage({ params }) {
  const { locationId } = await params
  const data = await mintSession(locationId)
  if (!data?.token) notFound()
  redirect(`/s/${data.token}`)
}