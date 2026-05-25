'use client'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/useApi'
import { Plus, Copy, Trash2, MapPin, Check, ExternalLink, Pencil, X, QrCode } from 'lucide-react'
import { clsx } from 'clsx'
import Link from 'next/link'

export default function LocationsPage() {
  const { data: session } = useSession()
  const { ready, get, post, patch, delete: del } = useApi()
  const [locations, setLocations] = useState([])
  const [surveys, setSurveys] = useState([])
  const [locationLimit, setLocationLimit] = useState(null)  // null = unlimited
  const [atLimit, setAtLimit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', survey: '', qr_enabled: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editSurvey, setEditSurvey] = useState('')
  const [editQrEnabled, setEditQrEnabled] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [previewingId, setPreviewingId] = useState(null)

  useEffect(() => {
    if (!ready) return
    let cancelled = false

    async function load() {
      try {
        const [locData, surveyList] = await Promise.all([
          get('/dashboard/locations/'),
          get('/dashboard/surveys/'),
        ])
        if (!cancelled) {
          // GET /dashboard/locations/ now returns { locations, location_limit, at_limit }
          setLocations(locData.locations)
          setLocationLimit(locData.location_limit)
          setAtLimit(locData.at_limit)
          setSurveys(surveyList)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-derive atLimit locally after optimistic updates so the UI stays in sync
  // without a refetch. The server is still the authoritative guard.
  const syncLimit = (newLocations) => {
    if (locationLimit === null) return
    setAtLimit(newLocations.length >= locationLimit)
  }

  const handleCreate = async () => {
    setError('')
    if (!form.name.trim()) return setError('Name is required.')
    setSubmitting(true)
    try {
      const body = { name: form.name.trim(), qr_enabled: form.qr_enabled }
      if (form.survey) body.survey = form.survey

      const created = await post('/dashboard/locations/', body)
      const updated = [created, ...locations]
      setLocations(updated)
      syncLimit(updated)
      setForm({ name: '', survey: '', qr_enabled: false })
      setShowForm(false)
    } catch (e) {
      // Surface the backend limit message directly — it's already user-friendly
      setError(e?.response?.data?.detail || 'Failed to create location.')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (location) => {
    setEditingId(location.id)
    setEditName(location.name)
    setEditSurvey(location.survey ?? '')
    setEditQrEnabled(location.qr_enabled ?? false)
    setEditError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditSurvey('')
    setEditQrEnabled(false)
    setEditError('')
  }

  const handleSaveEdit = async (locationId) => {
    setEditError('')
    if (!editName.trim()) return setEditError('Name is required.')
    setEditSaving(true)
    try {
      const updated = await patch(`/dashboard/locations/${locationId}/`, {
        name: editName.trim(),
        survey: editSurvey || null,
        qr_enabled: editQrEnabled,
      })
      setLocations((prev) => prev.map((l) => l.id === locationId ? updated : l))
      setEditingId(null)
    } catch {
      setEditError('Failed to save. Please try again.')
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return
    await del(`/dashboard/locations/${id}/`)
    const updated = locations.filter((l) => l.id !== id)
    setLocations(updated)
    syncLimit(updated)
  }

  const handleCopy = (location) => {
    navigator.clipboard.writeText(location.nfc_url)
    setCopiedId(location.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownloadQr = async (location) => {
    try {
      const res = await axios({
        method: 'get',
        url: `${process.env.NEXT_PUBLIC_API_URL}/dashboard/locations/${location.id}/qr/`,
        responseType: 'blob',
        headers: { Authorization: `Bearer ${session.access}` },
      })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${location.name.toLowerCase().replace(/\s+/g, '-')}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download QR code.')
    }
  }

  const handlePreview = async (location) => {
    if (previewingId) return
    setPreviewingId(location.id)
    try {
      const { token } = await post(`/dashboard/locations/${location.id}/preview/`, {})
      window.open(`/s/${token}`, '_blank')
    } catch {
      alert('No survey assigned to this location.')
    } finally {
      setPreviewingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  const limitLabel = locationLimit !== null
    ? `${locations.length} / ${locationLimit}`
    : null

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Each location gets a unique NFC URL.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => !atLimit && setShowForm((v) => !v)}
            disabled={atLimit}
            title={atLimit ? `You've reached your ${locationLimit}-location limit` : undefined}
            className={clsx(
              'flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors',
              atLimit
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-700'
            )}
          >
            <Plus className="w-4 h-4" />
            Add location
          </button>
          {limitLabel && (
            <span className="text-xs text-gray-400 tabular-nums">
              {limitLabel} locations used
            </span>
          )}
        </div>
      </div>

      {/* Limit nudge — shown when at the plan cap */}
      {atLimit && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-5">
          <p className="text-sm text-amber-800">
            You've used all {locationLimit} location{locationLimit !== 1 ? 's' : ''} on your current plan.
          </p>
          <Link
            href="/dashboard/billing"
            className="text-sm font-medium text-amber-900 hover:underline whitespace-nowrap ml-6"
          >
            Upgrade →
          </Link>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 space-y-3">
          <h2 className="text-sm font-medium text-gray-900">New location</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Main Entrance, Restroom 2"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Survey
              <span className="ml-1.5 font-normal text-gray-400">(optional — assign later)</span>
            </label>
            <select
              value={form.survey}
              onChange={(e) => setForm({ ...form, survey: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="">No survey</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-medium text-gray-600">Enable QR code</p>
              <p className="text-xs text-gray-400 mt-0.5">Generate a scannable QR for printing</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, qr_enabled: !f.qr_enabled }))}
              className={clsx(
                'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
                form.qr_enabled ? 'bg-gray-900' : 'bg-gray-200'
              )}
            >
              <span
                className={clsx(
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                  form.qr_enabled ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Locations list */}
      {locations.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No locations yet.</p>
          <p className="text-xs text-gray-400 mt-1">Add one to generate your first NFC URL.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((location) => {
            const isEditing = editingId === location.id
            return (
              <div
                key={location.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-3"
              >
                {/* Main row */}
                <div className="flex items-center gap-4">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{location.name}</p>
                    {!isEditing && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400 truncate">
                          {location.survey_name || (
                            <span className="italic text-gray-300">No survey assigned</span>
                          )}
                        </p>
                        {location.qr_enabled && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full leading-none shrink-0">
                            QR
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-gray-400 font-mono truncate max-w-[160px] hidden sm:block">
                      /s/{location.id.slice(0, 8)}…
                    </span>
                    <button
                      onClick={() => handleCopy(location)}
                      title="Copy NFC URL"
                      className={clsx(
                        'p-1.5 rounded-lg transition-colors',
                        copiedId === location.id
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {copiedId === location.id
                        ? <Check className="w-4 h-4" />
                        : <Copy className="w-4 h-4" />
                      }
                    </button>
                    <button
                      onClick={() => handlePreview(location)}
                      title="Preview survey"
                      disabled={previewingId === location.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    {location.qr_enabled && (
                      <button
                        onClick={() => handleDownloadQr(location)}
                        title="View QR code"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => isEditing ? cancelEdit() : startEdit(location)}
                      title={isEditing ? 'Cancel' : 'Edit'}
                      className={clsx(
                        'p-1.5 rounded-lg transition-colors',
                        isEditing
                          ? 'text-gray-500 bg-gray-100'
                          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(location.id)}
                      title="Delete location"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline edit fields */}
                {isEditing && (
                  <div className="pl-8 flex flex-col gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Location name"
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <select
                      value={editSurvey}
                      onChange={(e) => setEditSurvey(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                    >
                      <option value="">No survey</option>
                      {surveys.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between py-0.5">
                      <p className="text-xs text-gray-600">Enable QR code</p>
                      <button
                        type="button"
                        onClick={() => setEditQrEnabled((v) => !v)}
                        className={clsx(
                          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
                          editQrEnabled ? 'bg-gray-900' : 'bg-gray-200'
                        )}
                      >
                        <span
                          className={clsx(
                            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                            editQrEnabled ? 'translate-x-4' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveEdit(location.id)}
                        disabled={editSaving}
                        className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {editSaving ? 'Saving…' : 'Save'}
                      </button>
                      {editError && (
                        <p className="text-xs text-red-600">{editError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}