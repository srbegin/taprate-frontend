// app/tap/[uuid]/page.js
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { clientIpFrom, mintTagSession } from '@platform/shared/api/server'

export default async function TapPage({ params }) {
  const { uuid } = await params
  const data = await mintTagSession(uuid, clientIpFrom(await headers()))
  if (!data?.token) redirect('/survey-unavailable')
  redirect(`/s/${data.token}`)
}
