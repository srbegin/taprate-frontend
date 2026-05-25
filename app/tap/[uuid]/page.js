// app/tap/[uuid]/page.js
import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'

async function mintSession(tagId, clientIp) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tags/${tagId}/session/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Forward the real client IP so Django rate-limits by customer,
          // not by the Vercel edge node IP.
          ...(clientIp && { 'X-Forwarded-For': clientIp }),
        },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function TapPage({ params }) {
  const { uuid } = await params
  const headersList = await headers()

  // Vercel sets x-forwarded-for; fall back to x-real-ip
  const clientIp =
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headersList.get('x-real-ip') ||
    ''

  const data = await mintSession(uuid, clientIp)

  if (!data?.token) notFound()

  redirect(`/s/${data.token}`)
}