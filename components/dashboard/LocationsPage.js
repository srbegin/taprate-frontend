'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/useApi'
import { Plus, Copy, Trash2, MapPin, Check, ExternalLink } from 'lucide-react'
import { clsx } from 'clsx'

export default function LocationsPage() {
  const { ready, get, post, delete: del } = useApi()
  const [locations, setLocations] = useState([])
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', survey: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)


  useEffect(() => {
    if (!ready) return
    let cancelled = false

    async function load() {
      try {
        const [locs, survs] = await Promise.all([
          get('/dashboard/locations/'),
          get('/dashboard/surveys/'),
        ])
        if (!cancelled) {
          setLocations(locs)
          setSurveys(survs)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    setError('')
    if (!form.name.trim()) return setError('Name is required.')
    if (!form.survey) return setError('Select a survey.')
    setSubmitting(true)
    try {
      const created = await post('/dashboard/locations/', {
        name: form.name.trim(),
        survey: form.survey,
      })
      setLocations((prev) => [created, ...prev])
      setForm({ name: '', survey: '' })
      setShowForm(false)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to create location.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return
    await del(`/dashboard/locations/${id}/`)
    setLocations((prev) => prev.filter((l) => l.id !== id))
  }

  const handleCopy = (location) => {
    navigator.clipboard.writeText(location.nfc_url)
    setCopiedId(location.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

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
          <h1 className="text-xl font-semibold text-gray-900">Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Each location gets a unique NFC URL.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add location
        </button>
      </div>

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
            <label className="block text-xs font-medium text-gray-600 mb-1">Survey</label>
            <select
              value={form.survey}
              onChange={(e) => setForm({ ...form, survey: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="">Select a survey…</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>{s.question}</option>
              ))}
            </select>
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
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4"
            >
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{location.name}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {location.survey_name}
                </p>
              </div>

              {/* NFC URL */}
              <div className="flex items-center gap-1">
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
                
                 <a href={location.nfc_url}
                  target="_blank"
                  rel="noreferrer"
                  title="Preview survey"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(location.id)}
                  title="Delete location"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}