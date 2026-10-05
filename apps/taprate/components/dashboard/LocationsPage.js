'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@platform/shared/hooks/useApi'
import api from '@platform/shared/api/client'
import { Plus, Copy, MapPin, Check, ExternalLink, QrCode } from 'lucide-react'
import LocationModal from './LocationModal'

const OVERAGE_PRICE_PER_LOCATION = 10

export default function LocationsPage() {
  const { ready, get, delete: del } = useApi()

  const [locations,    setLocations]    = useState([])
  const [baseLocations, setBaseLocations] = useState(null) // null = unlimited (trial)
  const [surveys,      setSurveys]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [copiedId,     setCopiedId]     = useState(null)
  const [qrLoadingId,      setQrLoadingId]      = useState(null)
  const [previewLoadingId, setPreviewLoadingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState(null)

  useEffect(() => {
    if (!ready) return
    let cancelled = false

    async function load() {
      try {
        const [locsRes, survsRes] = await Promise.all([
          get('/dashboard/locations/'),
          get('/dashboard/surveys/'),
        ])
        if (!cancelled) {
          setLocations(locsRes.items ?? [])
          setBaseLocations(locsRes.meta?.base_locations ?? null)
          setSurveys(survsRes.items ?? [])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  // Whether the *next* location created would push the org into overage.
  // null base_locations (trial/free) means no plan cap — never overage.
  const wouldBeOverage = baseLocations !== null && locations.length >= baseLocations

  const handleSaved = (location, isNew) => {
    setLocations((prev) =>
      isNew
        ? [location, ...prev]
        : prev.map((l) => (l.id === location.id ? location : l))
    )
    setModalOpen(false)
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!editing) return
    await del(`/dashboard/locations/${editing.id}/`)
    setLocations((prev) => prev.filter((l) => l.id !== editing.id))
    setEditing(null)
  }

  const handleCopy = (location, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(location.nfc_url)
    setCopiedId(location.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownloadQr = async (location, e) => {
    e.stopPropagation()
    setQrLoadingId(location.id)
    try {
      const res = await api.get(`/dashboard/locations/${location.id}/qr/`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a')
      const safeName = location.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      a.href     = url
      a.download = `qr-${safeName || location.id}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      // Could surface a toast here; fail silently for now
      console.error('Failed to download QR code', err)
    } finally {
      setQrLoadingId(null)
    }
  }

  const handlePreview = async (location, e) => {
    e.stopPropagation()
    setPreviewLoadingId(location.id)
    try {
      const res = await api.post(`/dashboard/locations/${location.id}/preview/`)
      const token = res.data?.token ?? res.data?.session_token
      if (token) window.open(`/s/${token}`, '_blank')
    } catch {
      // fail silently — could surface a toast here
    } finally {
      setPreviewLoadingId(null)
    }
  }

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit   = (location) => { setEditing(location); setModalOpen(true) }

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
          onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add location
        </button>
      </div>

      {/* Locations list */}
      {locations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MapPin className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No locations yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((location) => (
            <div
              key={location.id}
              onClick={() => openEdit(location)}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <MapPin className="w-4 h-4 text-gray-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{location.name}</p>
                {location.survey_name ? (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{location.survey_name}</p>
                ) : (
                  <p className="text-xs text-amber-600 italic mt-0.5">No survey assigned</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {location.qr_enabled && (
                  <button
                    onClick={(e) => handleDownloadQr(location, e)}
                    disabled={qrLoadingId === location.id}
                    title="Download QR code"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors disabled:opacity-40"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleCopy(location, e)}
                  title="Copy NFC URL"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {copiedId === location.id
                    ? <Check className="w-4 h-4 text-green-600" />
                    : <Copy className="w-4 h-4" />
                  }
                </button>
                <button
                  onClick={(e) => handlePreview(location, e)}
                  disabled={previewLoadingId === location.id}
                  title="Preview survey"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <LocationModal
          location={editing}
          surveys={surveys}
          onSaved={handleSaved}
          onDelete={editing ? handleDelete : undefined}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          overageWarning={!editing && wouldBeOverage}
          overageCost={OVERAGE_PRICE_PER_LOCATION}
        />
      )}
    </div>
  )
}