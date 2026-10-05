'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@platform/shared/hooks/useApi'
import { Plus, ClipboardList, ChevronRight, Gift } from 'lucide-react'
import SurveyBuilderModal from './SurveyBuilderModal'

export default function SurveysPage() {
  const { ready, get, delete: del } = useApi()
  const [surveys, setSurveys]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)

  useEffect(() => {
    if (!ready) return
    let cancelled = false

    async function load() {
      try {
        const res = await get('/dashboard/surveys/')
        if (!cancelled) {
          setSurveys(res.items ?? [])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!editing) return
    await del(`/dashboard/surveys/${editing.id}/`)
    setSurveys((prev) => prev.filter((s) => s.id !== editing.id))
    setEditing(null)
  }

  const handleSaved = (survey, isNew) => {
    setSurveys((prev) =>
      isNew ? [survey, ...prev] : prev.map((s) => (s.id === survey.id ? survey : s))
    )
    setModalOpen(false)
    setEditing(null)
  }

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (survey) => { setEditing(survey); setModalOpen(true) }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Surveys</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Build surveys and attach them to locations.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New survey
        </button>
      </div>

      {/* List */}
      {surveys.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No surveys yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {surveys.map((survey) => {
            const questionCount = survey.questions?.length ?? 0
            const locationCount = survey.location_count ?? 0
            return (
              <div
                key={survey.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-gray-300 transition-colors"
                onClick={() => openEdit(survey)}
              >
                <ClipboardList className="w-4 h-4 text-gray-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{survey.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">
                      {questionCount} question{questionCount !== 1 ? 's' : ''}
                    </span>
                    {survey.active_incentive && (
                      <span className="text-xs text-amber-600 inline-flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {survey.active_incentive.prize_text}
                      </span>
                    )}
                    {survey.comments_enabled && (
                      <span className="text-xs text-gray-400">+ comments</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {locationCount} location{locationCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <SurveyBuilderModal
          survey={editing}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSaved={handleSaved}
          onDelete={editing ? handleDelete : undefined}
        />
      )}
    </div>
  )
}