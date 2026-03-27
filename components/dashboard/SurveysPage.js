'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/useApi'
import { Plus, Trash2, ClipboardList, ChevronRight } from 'lucide-react'
import SurveyBuilderModal from './SurveyBuilderModal'

export default function SurveysPage() {
  const { ready, get, post, delete: del } = useApi()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null) // survey object or null for create


  useEffect(() => {
    if (!ready) return
    let cancelled = false

    async function load() {
      try {
        const survs = await get('/dashboard/surveys/')
        if (!cancelled) {
          setSurveys(survs)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id) => {
    if (!confirm('Delete this survey? Any linked locations will lose their survey.')) return
    await del(`/dashboard/surveys/${id}/`)
    setSurveys((prev) => prev.filter((s) => s.id !== id))
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

  const SCALE_LABELS = { numbers: '1–5 Numbers', stars: '★ Stars', emoji: '😊 Emoji' }

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
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
          <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No surveys yet.</p>
          <p className="text-xs text-gray-400 mt-1">Create one to attach to your locations.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              onClick={() => openEdit(survey)}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-gray-300 transition-colors group"
            >
              <ClipboardList className="w-4 h-4 text-gray-400 shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{survey.question}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400">
                    {SCALE_LABELS[survey.scale_type]}
                  </span>
                  {survey.incentive && (
                    <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                      🎁 Incentive
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {survey.location_count} location{survey.location_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(survey.id) }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <SurveyBuilderModal
          survey={editing}
          onSaved={handleSaved}
          onClose={() => { setModalOpen(false); setEditing(null) }}
        />
      )}
    </div>
  )
}