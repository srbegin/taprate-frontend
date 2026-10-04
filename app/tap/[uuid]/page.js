// app/tap/[uuid]/page.js
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

async function mintSession(tagId, clientIp) {
  try {
    const res = await fetch(
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
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function TapPage({ params }) {
  const { uuid } = await params
  const headersList = await headers()
  const clientIp =
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headersList.get('x-real-ip') ||
    ''
  const data = await mintSession(uuid, clientIp)
  if (!data?.token) redirect('/survey-unavailable')
  redirect(`/s/${data.token}`)
}