// app/s/[uuid]/page.js
import SurveyClient from '@/components/survey/SurveyClient'

async function getSurveyData(token) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/survey/${token}/`,
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

  // Don't hard-404 — an expired/consumed token should show a friendly screen
  return <SurveyClient sessionToken={uuid} data={data} />
}

export async function generateMetadata({ params }) {
  const { uuid } = await params
  const data = await getSurveyData(uuid)
  return {
    title: data?.location_name
      ? `${data.location_name} — Rate Your Experience`
      : 'Survey',
    description: data?.survey?.questions?.[0]?.question || 'Share your feedback',
  }
}