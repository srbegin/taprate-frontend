'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useApi } from '../hooks/useApi'
import brand from '../brand'
import { useRouter } from 'next/navigation'

export default function ClaimTagClient({ tagId }) {
  const { data: session, status } = useSession()
  const { ready, get, post } = useApi()
  const router = useRouter()

  const [locations,        setLocations]        = useState([])
  const [atLimit,          setAtLimit]          = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [submitting,       setSubmitting]       = useState(false)
  const [error,            setError]            = useState('')
  const [loadingLocations, setLoadingLocations] = useState(true)


  useEffect(() => {
    if (!ready) return
    get('/dashboard/locations/')
      .then((res) => {
        setLocations(res.items ?? [])
        setAtLimit(res.meta?.at_limit ?? false)
      })
      .catch(() => setError('Failed to load locations.'))
      .finally(() => setLoadingLocations(false))
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClaim = async () => {
    if (!selectedLocation) return
    setSubmitting(true)
    setError('')
    try {
      await post(`/tags/${tagId}/`, { location_id: selectedLocation })
      router.push(`/s/${selectedLocation}`)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to claim tag.')
      setSubmitting(false)
    }
  }

  // Not logged in
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">📡</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Set up this NFC tag</h1>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to your {brand.name} account to assign this tag to a location.
          </p>
          <button
            onClick={() => signIn(undefined, { callbackUrl: `/claim/${tagId}` })}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  // Loading session or locations
  if (status === 'loading' || loadingLocations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  // At location limit — can't assign
  if (atLimit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">📡</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Location limit reached</h1>
          <p className="text-sm text-gray-500 mb-6">
            You've used all the locations on your current plan. Upgrade to add more locations
            and assign this tag.
          </p>
          
          <a href="/dashboard/billing"
            className="block w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors text-center"
          >
            Upgrade plan
          </a>
          
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-4xl mb-4 text-center">📡</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1 text-center">Assign NFC tag</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Choose a location to link this tag to.
        </p>

        {locations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No locations found.{' '}
            <a href="/dashboard/locations" className="text-gray-900 font-medium underline">
              Create one first.
            </a>
          </p>
        ) : (
          <>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white mb-4"
            >
              <option value="">Select a location…</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <button
              onClick={handleClaim}
              disabled={!selectedLocation || submitting}
              className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Assigning…' : 'Assign tag'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}