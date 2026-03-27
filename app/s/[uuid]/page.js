import { notFound } from 'next/navigation'
import SurveyWidget from '@/components/survey/SurveyWidget'

async function getSurvey(uuid) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/survey/${uuid}/`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function SurveyPage({ params }) {
  const data = await getSurvey(params.uuid)
  if (!data) notFound()

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: data.survey.brand_color + '10' }} // 10 = ~6% opacity hex
    >
      <SurveyWidget data={data} locationUuid={params.uuid} />
    </main>
  )
}