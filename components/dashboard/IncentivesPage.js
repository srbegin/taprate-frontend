'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/useApi'
import { Plus, Trash2, Gift, Pencil, Link2, Unlink } from 'lucide-react'

export default function IncentivesPage() {
  const { ready, get, post, patch, delete: del } = useApi()

  const [incentives, setIncentives] = useState([])
  const [surveys, setSurveys]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [assigningId, setAssigningId] = useState(null)

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    async function load() {
      try {
        const [inc, surveyList] = await Promise.all([
          get('/dashboard/incentives/'),
          get('/dashboard/surveys/'),
        ])
        if (!cancelled) {
          setIncentives(inc)
          setSurveys(surveyList)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id) => {
    if (!confirm('Delete this incentive?')) return
    await del(`/dashboard/incentives/${id}/`)
    setIncentives((prev) => prev.filter((i) => i.id !== id))
  }

  const handleSaved = (incentive, isNew) => {
    setIncentives((prev) =>
      isNew ? [incentive, ...prev] : prev.map((i) => (i.id === incentive.id ? incentive : i))
    )
    setModalOpen(false)
    setEditing(null)
  }

  const handleAssign = async (incentiveId, surveyId) => {
    await patch(`/dashboard/incentives/${incentiveId}/assign/`, {
      survey: surveyId || null,
    })
    const fresh = await get('/dashboard/incentives/')
    setIncentives(fresh)
    setAssigningId(null)
  }

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit   = (inc) => { setEditing(inc); setModalOpen(true) }

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
          <h1 className="text-xl font-semibold text-gray-900">Incentives</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create prize draws and assign them to surveys.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New incentive
        </button>
      </div>

      {/* List */}
      {incentives.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
          <Gift className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No incentives yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Create one and assign it to a survey.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {incentives.map((inc) => (
            <IncentiveRow
              key={inc.id}
              incentive={inc}
              surveys={surveys}
              assigning={assigningId === inc.id}
              onEdit={() => openEdit(inc)}
              onDelete={() => handleDelete(inc.id)}
              onToggleAssign={() =>
                setAssigningId((prev) => (prev === inc.id ? null : inc.id))
              }
              onAssign={(surveyId) => handleAssign(inc.id, surveyId)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <IncentiveModal
          incentive={editing}
          onSaved={handleSaved}
          onClose={() => { setModalOpen(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

// ── Incentive row ─────────────────────────────────────────────────────────────

function IncentiveRow({
  incentive, surveys, assigning,
  onEdit, onDelete, onToggleAssign, onAssign,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 group">
      <div className="flex items-center gap-4">
        <Gift className="w-4 h-4 text-gray-400 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">{incentive.name}</p>
            {!incentive.active && (
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                inactive
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-500">🏆 {incentive.prize_text}</span>
            <span className="text-xs text-gray-400">{incentive.win_rate}% win rate</span>
            {incentive.survey ? (
              <span className="text-xs text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">
                → {incentive.survey_name}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">unassigned</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleAssign}
            title="Assign to survey"
            className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          >
            {incentive.survey ? (
              <Unlink className="w-4 h-4" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Assign dropdown */}
      {assigning && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Assign to survey:</p>
          <div className="flex flex-col gap-1">
            {surveys.map((s) => (
              <button
                key={s.id}
                onClick={() => onAssign(s.id)}
                className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  incentive.survey === s.id
                    ? 'bg-violet-50 text-violet-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {s.name}
                {incentive.survey === s.id && (
                  <span className="ml-2 text-xs text-violet-400">current</span>
                )}
              </button>
            ))}
            {incentive.survey && (
              <button
                onClick={() => onAssign(null)}
                className="text-left text-sm px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                Unassign
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Create / Edit modal ───────────────────────────────────────────────────────

function IncentiveModal({ incentive, onSaved, onClose }) {
  const { post, patch } = useApi()
  const isNew = !incentive

  const [form, setForm] = useState({
    name:          incentive?.name          ?? '',
    prize_text:    incentive?.prize_text    ?? '',
    win_rate:      incentive?.win_rate      ?? 10,
    active:        incentive?.active        ?? true,
    email_subject: incentive?.email_subject ?? 'You won a prize!',
    email_body:    incentive?.email_body    ?? '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())       e.name       = 'Name is required.'
    if (!form.prize_text.trim()) e.prize_text = 'Prize is required.'
    const rate = Number(form.win_rate)
    if (!rate || rate < 1 || rate > 100)
      e.win_rate = 'Win rate must be between 1 and 100.'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = { ...form, win_rate: Number(form.win_rate) }
      const result = isNew
        ? await post('/dashboard/incentives/', payload)
        : await patch(`/dashboard/incentives/${incentive.id}/`, payload)
      onSaved(result, isNew)
    } catch (err) {
      const data = err?.response?.data
      if (data && typeof data === 'object') setErrors(data)
      else setErrors({ non_field: 'Something went wrong.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isNew ? 'New incentive' : 'Edit incentive'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {errors.non_field && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {errors.non_field}
            </p>
          )}

          <Field label="Incentive name" error={errors.name}>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Monthly coffee giveaway"
              className={input(errors.name)}
            />
          </Field>

          <Field label="Prize" error={errors.prize_text}>
            <input
              value={form.prize_text}
              onChange={set('prize_text')}
              placeholder="e.g. Free coffee"
              className={input(errors.prize_text)}
            />
          </Field>

          <Field
            label="Win rate"
            hint="Percentage chance any submission wins."
            error={errors.win_rate}
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={100}
                value={form.win_rate}
                onChange={set('win_rate')}
                className={`w-24 ${input(errors.win_rate)}`}
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </Field>

          <Field label="Active">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Incentive is live</span>
            </label>
          </Field>

          <hr className="border-gray-100" />
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Winner email (optional)
          </p>

          <Field label="Email subject">
            <input
              value={form.email_subject}
              onChange={set('email_subject')}
              className={input()}
            />
          </Field>

          <Field label="Email body">
            <textarea
              rows={4}
              value={form.email_body}
              onChange={set('email_body')}
              placeholder="Congratulations! Show this email at the counter to claim your prize."
              className={input()}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400 -mt-0.5">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const input = (error) =>
  `w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 ${
    error ? 'border-red-300 bg-red-50' : 'border-gray-200'
  }`