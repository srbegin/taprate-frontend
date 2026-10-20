'use client'

// Add a placard by the code printed on it (e.g. CP-7K3Q) — the fallback when a
// phone can't scan. Hands off to the same claim screen a scan/tap opens.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApi } from '@platform/shared/hooks/useApi'

export default function AddPlacardForm({ compact = false }) {
  const { get } = useApi()
  const router = useRouter()
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [looking, setLooking] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!code.trim()) return setError('Enter the code printed on the placard.')
    setLooking(true)
    try {
      const placard = await get(`/placards/code/${encodeURIComponent(code.trim())}/`)
      if (placard.product !== 'cleanpulse') {
        setError('That code isn’t a Cleanpulse placard.')
      } else if (placard.claimed) {
        setError(`${placard.short_code} is already set up. To move it, use Restrooms.`)
      } else {
        router.push(`/p/${placard.id}?claim=1`)
        return
      }
    } catch (err) {
      setError(err?.response?.status === 404 ? 'No placard has that code. Check it and try again.'
        : err?.response?.data?.detail || 'Couldn’t look that up. Try again.')
    }
    setLooking(false)
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      {!compact && (
        <label htmlFor="placard-code" className="block text-sm font-medium text-stone-700">
          Placard code
        </label>
      )}
      <div className="flex gap-2">
        <input
          id="placard-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="CP-7K3Q"
          autoCapitalize="characters"
          autoComplete="off"
          className="flex-1 min-w-0 rounded-lg bg-white border border-stone-300 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 uppercase tracking-wider outline-none focus:border-brand-ring focus:ring-1 focus:ring-brand-ring"
        />
        <button
          type="submit"
          disabled={looking}
          className="bg-brand hover:bg-brand-hover text-white rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {looking ? 'Finding…' : 'Add'}
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  )
}
