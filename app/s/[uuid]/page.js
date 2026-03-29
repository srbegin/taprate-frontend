// app/s/[uuid]/page.js
import { notFound } from 'next/navigation'
import SurveyClient from '@/components/survey/SurveyClient'

async function getSurveyData(uuid) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/survey/${uuid}/`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function SurveyPage({ params }) {
  const { uuid } = await params
  const data = await getSurveyData(uuid)

  if (!data) notFound()

  return <SurveyClient locationUuid={uuid} data={data} />
}

export async function generateMetadata({ params }) {
  const { uuid } = await params
  const data = await getSurveyData(uuid)
  return {
    title: data ? `${data.org_name} — Rate Your Experience` : 'Survey',
    description: data?.question || 'Share your feedback',
  }
}