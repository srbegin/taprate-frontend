'use client'

import { useState } from 'react'
import { useApi } from '@platform/shared/hooks/useApi'
import { X, QrCode, AlertTriangle } from 'lucide-react'
import Toggle from '@platform/shared/ui/Toggle'

/**
 * Props:
 *   location        — the location object when editing, or null/undefined when creating
 *   surveys         — array of org's surveys for the picker
 *   onSaved         — called with (savedLocation, isNew) after a successful save
 *   onDelete        — optional; called after user confirms delete (edit mode only)
 *   onClose         — close the modal without saving
 *   overageWarning  — when true and creating a new location, shows a cost warning
 *   overageCost     — monthly cost (in dollars) of one additional overage location
 */
export default function LocationModal({
  location,
  surveys,
  onSaved,
  onDelete,
  onClose,
  overageWarning = false,
  overageCost = 10,
}) {
  const { post, patch } = useApi()
  const isEdit = !!location

  const [name,       setName]       = useState(location?.name || '')
  const [surveyId,   setSurveyId]   = useState(location?.survey || '')
  const [qrEnabled,  setQrEnabled]  = useState(location?.qr_enabled ?? false)

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) return setError('Name is required.')

    setSubmitting(true)
    try {
      const payload = {
        name:       name.trim(),
        survey:     surveyId || null,
        qr_enabled: qrEnabled,
      }
      const saved = isEdit
        ? await patch(`/dashboard/locations/${location.id}/`, payload)
        : await post('/dashboard/locations/', payload)
      onSaved(saved, !isEdit)
    } catch (e) {
      const data = e?.response?.data
      const first = data && Object.values(data)[0]
      setError(
        (Array.isArray(first) ? first[0] : first) ||
        data?.detail ||
        'Failed to save location.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit location' : 'New location'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Overage warning — only shown when creating a location beyond plan base */}
          {!isEdit && overageWarning && (
            <div className="flex items-start gap-2.5 py-3 px-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                This will add a location beyond your plan's included allowance —{' '}
                <strong>${overageCost}/month</strong> will be added to your subscription.
              </p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main Entrance, Restroom 2"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Survey */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Survey <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={surveyId}
              onChange={(e) => setSurveyId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="">No survey yet</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {surveys.length === 0 ? (
              <p className="text-xs text-gray-400 mt-1.5">
                No surveys yet. <a href="/dashboard/surveys" className="underline hover:text-gray-700">Create one first.</a>
              </p>
            ) : !surveyId ? (
              <p className="text-xs text-gray-400 mt-1.5">
                You can assign a survey later from the location's settings.
              </p>
            ) : null}
          </div>

          {/* QR code toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">QR code fallback</p>
                <p className="text-xs text-gray-400 mt-0.5">Allow downloading a QR code for this location</p>
              </div>
            </div>
            <Toggle enabled={qrEnabled} onChange={setQrEnabled} />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create location'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          {isEdit && onDelete && (
            <button
              onClick={() => {
                if (confirm('Delete this location? This cannot be undone.')) {
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