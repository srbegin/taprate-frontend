'use client'

import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { X, Gift, Trash2 } from 'lucide-react'

const SCALE_OPTIONS = [
  { value: 'numbers', label: '1–5 Numbers' },
  { value: 'stars', label: '★ Stars' },
  { value: 'emoji', label: '😊 Emoji' },
]

const DEFAULT_FORM = {
  question: '',
  scale_type: 'numbers',
  comments_enabled: true,
}

const DEFAULT_INCENTIVE = {
  win_rate: 10,
  prize_text: '',
}

export default function SurveyBuilderModal({ survey, onSaved, onClose }) {
  const api = useApi()
  const isEdit = !!survey

  const [form, setForm] = useState(
    isEdit
      ? { question: survey.question, scale_type: survey.scale_type, comments_enabled: survey.comments_enabled }
      : DEFAULT_FORM
  )
  const [incentiveEnabled, setIncentiveEnabled] = useState(!!survey?.incentive)
  const [incentive, setIncentive] = useState(
    survey?.incentive
      ? { win_rate: survey.incentive.win_rate, prize_text: survey.incentive.prize_text }
      : DEFAULT_INCENTIVE
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')

    if (!form.question.trim()) return setError('Question is required.')
    if (incentiveEnabled && !incentive.prize_text.trim()) {
      return setError('Prize description is required when incentive is enabled.')
    }
    if (incentiveEnabled && (incentive.win_rate < 2 || incentive.win_rate > 100)) {
      return setError('Win rate must be between 2 and 100.')
    }

    setSubmitting(true)
    try {
      let saved

      if (isEdit) {
        saved = await api.patch(`/dashboard/surveys/${survey.id}/`, form)
      } else {
        saved = await api.post('/dashboard/surveys/', form)
      }

      // Handle incentive
      if (incentiveEnabled) {
        const incentiveData = { win_rate: Number(incentive.win_rate), prize_text: incentive.prize_text.trim() }
        if (isEdit && survey.incentive) {
          const updated = await api.patch(`/dashboard/surveys/${saved.id}/incentive/`, incentiveData)
          saved = { ...saved, incentive: updated }
        } else {
          const created = await api.post(`/dashboard/surveys/${saved.id}/incentive/`, incentiveData)
          saved = { ...saved, incentive: created }
        }
      } else if (isEdit && survey.incentive) {
        // Incentive was removed
        await api.delete(`/dashboard/surveys/${saved.id}/incentive/`)
        saved = { ...saved, incentive: null }
      }

      onSaved(saved, !isEdit)
    } catch (e) {
      const data = e?.response?.data
      const first = data && Object.values(data)[0]
      setError(Array.isArray(first) ? first[0] : first || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit survey' : 'New survey'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="How would you rate your experience today?"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Scale type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating scale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, scale_type: opt.value })}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    form.scale_type === opt.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comments toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Allow comments</p>
              <p className="text-xs text-gray-400 mt-0.5">Respondents can leave optional text feedback</p>
            </div>
            <button
              onClick={() => setForm({ ...form, comments_enabled: !form.comments_enabled })}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                form.comments_enabled ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.comments_enabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Incentive section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setIncentiveEnabled((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-medium text-gray-900">Incentive prize</p>
              </div>
              <button
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  incentiveEnabled ? 'bg-amber-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    incentiveEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {incentiveEnabled && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Prize description
                  </label>
                  <input
                    type="text"
                    value={incentive.prize_text}
                    onChange={(e) => setIncentive({ ...incentive, prize_text: e.target.value })}
                    placeholder="e.g. $10 gift card"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Win rate — 1 in every{' '}
                    <span className="text-amber-600 font-semibold">{incentive.win_rate}</span> responses wins
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={100}
                    value={incentive.win_rate}
                    onChange={(e) => setIncentive({ ...incentive, win_rate: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 in 2 (frequent)</span>
                    <span>1 in 100 (rare)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create survey'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}