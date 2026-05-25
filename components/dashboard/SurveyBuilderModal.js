'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/useApi'
import { X, Gift, Trash2, Plus, ChevronUp, ChevronDown, AlertTriangle, ExternalLink, HeartHandshake } from 'lucide-react'
import Toggle from '@/components/ui/Toggle'

const SCALE_OPTIONS = [
  { value: 'numbers', label: '1–5' },
  { value: 'stars', label: '★ Stars' },
  { value: 'emoji', label: '😊 Emoji' },
]

const DEFAULT_QUESTION = () => ({ _key: Math.random(), question: '', scale_type: 'stars' })

const DEFAULT_RECOVERY_MESSAGE =
  "We're sorry your experience fell short. Tell us what happened and we'll make it right."

export default function SurveyBuilderModal({ survey: surveySet, onSaved, onDelete, onClose }) {
  const api = useApi()
  const isEdit = !!surveySet

  // ── Set-level state ───────────────────────────────────────────────────────
  const [name, setName]                         = useState(surveySet?.name || '')
  const [commentsEnabled, setCommentsEnabled]   = useState(surveySet?.comments_enabled ?? false)
  const [commentsPrompt, setCommentsPrompt]     = useState(surveySet?.comments_prompt || 'Any additional feedback?')
  const [alertThreshold, setAlertThreshold]     = useState(surveySet?.alert_threshold ?? 2)
  const [reviewRedirectEnabled, setReviewRedirectEnabled] = useState(surveySet?.review_redirect_enabled ?? false)
  const [reviewRedirectUrl, setReviewRedirectUrl]         = useState(surveySet?.review_redirect_url || '')

  // ── Recovery flow state ───────────────────────────────────────────────────
  const [recoveryEnabled, setRecoveryEnabled]       = useState(surveySet?.recovery_enabled ?? false)
  const [recoveryThreshold, setRecoveryThreshold]   = useState(surveySet?.recovery_threshold ?? 3)
  const [recoveryMessage, setRecoveryMessage]       = useState(
    surveySet?.recovery_message || DEFAULT_RECOVERY_MESSAGE
  )
  const [recoveryCouponText, setRecoveryCouponText] = useState(surveySet?.recovery_coupon_text || '')

  // ── Incentive picker ──────────────────────────────────────────────────────
  const [incentives, setIncentives]             = useState([])
  const [selectedIncentiveId, setSelectedIncentiveId] = useState(
    surveySet?.active_incentive?.id || ''
  )

  useEffect(() => {
    if (!api.ready) return

    api.get('/dashboard/incentives/').then(setIncentives).catch(() => {})

    if (!isEdit) {
      api.get('/dashboard/organization/').then(org => {
        setAlertThreshold(parseInt(org.default_alert_threshold) || 2)
        setCommentsEnabled(org.default_comments_enabled ?? false)
        setCommentsPrompt(org.default_comments_prompt || 'Any additional feedback?')
        if (org.default_review_url) setReviewRedirectUrl(org.default_review_url)
      }).catch(() => {})
    }
  }, [api.ready]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Questions state ───────────────────────────────────────────────────────
  const [questions, setQuestions] = useState(
    isEdit
      ? surveySet.questions.map(s => ({ ...s, _key: s.id }))
      : [DEFAULT_QUESTION()]
  )

  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [urlError, setUrlError]     = useState('')

  // ── Question helpers ──────────────────────────────────────────────────────

  const addQuestion = () => setQuestions(prev => [...prev, DEFAULT_QUESTION()])

  const removeQuestion = (key) =>
    setQuestions(prev => prev.filter(q => q._key !== key))

  const updateQuestion = (key, field, value) =>
    setQuestions(prev => prev.map(q => q._key === key ? { ...q, [field]: value } : q))

  const moveQuestion = (key, dir) => {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q._key === key)
      const next = idx + dir
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError('')

    if (!name.trim()) return setError('Survey name is required.')
    if (questions.length === 0) return setError('Add at least one question.')
    for (const q of questions) {
      if (!q.question.trim()) return setError('All questions must have text.')
    }
    if (urlError) return setError('Please fix the review redirect URL.')

    setSubmitting(true)
    try {
      let saved

      const surveyPayload = {
        name: name.trim(),
        comments_enabled: commentsEnabled,
        comments_prompt: commentsPrompt,
        alert_threshold: alertThreshold,
        review_redirect_enabled: reviewRedirectEnabled,
        review_redirect_url: reviewRedirectUrl.trim(),
        recovery_enabled: recoveryEnabled,
        recovery_threshold: recoveryThreshold,
        recovery_message: recoveryMessage.trim(),
        recovery_coupon_text: recoveryCouponText.trim(),
      }

      if (isEdit) {
        saved = await api.patch(`/dashboard/surveys/${surveySet.id}/`, surveyPayload)

        const existingIds = new Set(surveySet.questions.map(s => s.id))
        const currentIds  = new Set(questions.filter(q => q.id).map(q => q.id))

        for (const id of existingIds) {
          if (!currentIds.has(id)) {
            await api.delete(`/dashboard/surveys/${surveySet.id}/questions/${id}/`)
          }
        }

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i]
          const payload = { question: q.question.trim(), scale_type: q.scale_type, position: i }
          if (q.id) {
            await api.patch(`/dashboard/surveys/${surveySet.id}/questions/${q.id}/`, payload)
          } else {
            await api.post(`/dashboard/surveys/${surveySet.id}/questions/`, payload)
          }
        }

        saved = await api.get(`/dashboard/surveys/${surveySet.id}/`)
      } else {
        const questionsPayload = questions.map((q, i) => ({
          question: q.question.trim(),
          scale_type: q.scale_type,
          position: i,
        }))

        saved = await api.post('/dashboard/surveys/', {
          ...surveyPayload,
          questions: questionsPayload,
        })
      }

      // ── Incentive assignment ──────────────────────────────────────────────
      const previousIncentiveId = surveySet?.active_incentive?.id || ''
      if (selectedIncentiveId !== previousIncentiveId) {
        if (selectedIncentiveId) {
          await api.patch(`/dashboard/incentives/${selectedIncentiveId}/assign/`, {
            survey: saved.id,
          })
        } else if (previousIncentiveId) {
          await api.patch(`/dashboard/incentives/${previousIncentiveId}/assign/`, {
            survey: null,
          })
        }
        saved = await api.get(`/dashboard/surveys/${saved.id}/`)
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit survey' : 'New survey'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Set name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Survey name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Customer Experience, Staff Feedback"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Questions
                <span className="ml-2 text-xs font-normal text-gray-400">{questions.length} total</span>
              </label>
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={q._key} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-start gap-2 p-3">
                    <div className="flex flex-col gap-0.5 pt-1 shrink-0">
                      <button onClick={() => moveQuestion(q._key, -1)} disabled={i === 0}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveQuestion(q._key, 1)} disabled={i === questions.length - 1}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={q.question}
                        onChange={e => updateQuestion(q._key, 'question', e.target.value)}
                        placeholder={`Question ${i + 1}…`}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 mb-2"
                      />
                      <div className="flex gap-1.5">
                        {SCALE_OPTIONS.map(opt => (
                          <button key={opt.value}
                            onClick={() => updateQuestion(q._key, 'scale_type', opt.value)}
                            className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                              q.scale_type === opt.value
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}
                          >{opt.label}</button>
                        ))}
                      </div>
                    </div>

                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(q._key)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addQuestion}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add question
            </button>
          </div>

          {/* Comments toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Comments step</p>
              <p className="text-xs text-gray-400 mt-0.5">Show a free-text feedback field after all questions</p>
            </div>
            <Toggle enabled={commentsEnabled} onChange={setCommentsEnabled} />
          </div>

          {commentsEnabled && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Comments prompt</label>
              <input
                type="text"
                value={commentsPrompt}
                onChange={e => setCommentsPrompt(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          )}

          {/* Recovery flow */}
          <div className="py-3 px-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Recovery flow</p>
                  <p className="text-xs text-gray-400 mt-0.5">Prompt low-rating customers to share feedback and their email</p>
                </div>
              </div>
              <Toggle enabled={recoveryEnabled} onChange={setRecoveryEnabled} />
            </div>

            {recoveryEnabled && (
              <div className="space-y-3 pt-1">
                {/* Threshold */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">Trigger when rating is at or below</p>
                  <select
                    value={recoveryThreshold}
                    onChange={e => setRecoveryThreshold(parseInt(e.target.value))}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                  >
                    {[1, 2, 3, 4, 5].map(v => (
                      <option key={v} value={v}>{v} star{v !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Recovery message */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Message shown to customer
                  </label>
                  <textarea
                    value={recoveryMessage}
                    onChange={e => setRecoveryMessage(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  />
                </div>

                {/* Coupon text */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Coupon or offer <span className="text-gray-400 font-normal">(shown as the incentive for leaving an email)</span>
                  </label>
                  <input
                    type="text"
                    value={recoveryCouponText}
                    onChange={e => setRecoveryCouponText(e.target.value)}
                    placeholder="e.g. 10% off your next visit"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    You fulfill this offer directly — TapRate emails you the customer's address so you can follow up.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Incentive picker */}
          <div className="py-3 px-4 bg-gray-50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Incentive prize draw</p>
                  <p className="text-xs text-gray-400 mt-0.5">Attach an incentive to this survey</p>
                </div>
              </div>
            </div>
            {incentives.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No incentives yet — create one on the{' '}
                <a href="/dashboard/incentives" className="underline hover:text-gray-600">Incentives page</a>.
              </p>
            ) : (
              <select
                value={selectedIncentiveId}
                onChange={e => setSelectedIncentiveId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                <option value="">None</option>
                {incentives.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    {inc.name} — {inc.prize_text} ({inc.win_rate}% win rate)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Review redirect */}
          <div className="py-3 px-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Review redirect</p>
                  <p className="text-xs text-gray-400 mt-0.5">Prompt customers to leave a review after submitting</p>
                </div>
              </div>
              <Toggle enabled={reviewRedirectEnabled} onChange={setReviewRedirectEnabled} />
            </div>
            {reviewRedirectEnabled && (
              <div>
                <input
                  type="url"
                  value={reviewRedirectUrl}
                  onChange={e => { setReviewRedirectUrl(e.target.value); setUrlError("") }}
                  onBlur={e => {
                    const v = e.target.value.trim()
                    if (v) { try { new URL(v) } catch { setUrlError("Must be a valid URL (include https://).") } }
                  }}
                  placeholder="https://g.page/your-business/review"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 ${
                    urlError ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
              </div>
            )}
            {!reviewRedirectEnabled && reviewRedirectUrl && (
              <p className="text-xs text-gray-400">
                Pre-filled from your org default — enable the toggle to activate.
              </p>
            )}
          </div>

          {/* Alert threshold */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Alert threshold</p>
                <p className="text-xs text-gray-400 mt-0.5">Alert when a rating is at or below this</p>
              </div>
            </div>
            <select
              value={alertThreshold}
              onChange={e => setAlertThreshold(Number(e.target.value))}
              className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              {[1, 2, 3].map(v => (
                <option key={v} value={v}>{v} star{v !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create survey'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          {isEdit && onDelete && (
            <button
              onClick={() => {
                if (confirm('Delete this survey? Any linked locations will lose their survey.')) {
                  onDelete()
                  onClose()
                }
              }}
              className="px-4 py-2.5 text-sm text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}