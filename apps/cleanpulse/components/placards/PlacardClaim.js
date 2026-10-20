'use client'

// A business scanned/tapped one of its new placards: link it to a spot
// (an existing location, or a new one — which gets the default Restroom Check
// survey), then offer a test run.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useApi } from '@platform/shared/hooks/useApi'
import Shell from '@/components/Shell'

const SUGGESTIONS = ['Men’s Room', 'Women’s Room', 'Family Restroom', 'All-Gender Restroom', 'Staff Restroom']

export default function PlacardClaim({ placard }) {
  const { status } = useSession()
  const { ready, get, post } = useApi()
  const router = useRouter()

  const [locations, setLocations] = useState(null)
  const [choice, setChoice]       = useState('new')     // 'new' | location id
  const [name, setName]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(null)      // { location }
  const [testing, setTesting]     = useState(false)

  useEffect(() => {
    if (!ready) return
    // Make sure the business has Cleanpulse (starts a trial the first time; no-op after).
    post('/billing/trial/')
      .catch(() => {})
      .then(() => get('/dashboard/locations/'))
      .then(res => {
        const items = res?.items ?? []
        setLocations(items)
        if (items.length) setChoice(items[0].id)
      })
      .catch(() => setLocations([]))
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const claim = async (e) => {
    e.preventDefault()
    setError('')
    if (choice === 'new' && !name.trim()) return setError('Give this spot a name.')
    setSaving(true)
    try {
      const body = choice === 'new' ? { location_name: name.trim() } : { location_id: choice }
      const res = await post(`/placards/${placard.id}/claim/`, body)
      setDone(res)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not set up this placard.')
    } finally {
      setSaving(false)
    }
  }

  const tryIt = async () => {
    setTesting(true)
    try {
      const res = await post(`/dashboard/locations/${done.location.id}/preview/`)
      router.push(`/s/${res.token}`)
    } catch {
      setTesting(false)
    }
  }

  const eyebrow = `Placard ${placard.short_code}`

  if (status === 'loading') {
    return <Shell eyebrow={eyebrow}><p className="text-sm text-stone-500">Loading…</p></Shell>
  }

  if (status === 'unauthenticated') {
    return (
      <Shell eyebrow={eyebrow}>
        <h1 className="text-lg font-semibold text-stone-900">Set up this placard</h1>
        <p className="mt-1 text-sm text-stone-500 leading-relaxed">
          Sign in to link it to your business. It takes a few seconds.
        </p>
        <button
          onClick={() => signIn(undefined, { callbackUrl: `/p/${placard.id}` })}
          className="mt-6 w-full bg-brand hover:bg-brand-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          Sign in
        </button>
        <p className="mt-4 text-center text-xs text-stone-500">
          New to Cleanpulse?{' '}
          <Link href="/auth/signup" className="text-brand-soft hover:text-brand-softer">Create an account</Link>
          , then scan this placard again.
        </p>
      </Shell>
    )
  }

  if (done) {
    return (
      <Shell eyebrow={eyebrow}>
        <p className="text-2xl">✓</p>
        <h1 className="mt-2 text-lg font-semibold text-stone-900">You’re all set</h1>
        <p className="mt-1 text-sm text-stone-600 leading-relaxed">
          This placard now reports to <span className="text-stone-900">{done.location.name}</span>.
          Customers can tap or scan it right away.
        </p>
        <button
          onClick={tryIt}
          disabled={testing}
          className="mt-6 w-full bg-brand hover:bg-brand-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {testing ? 'Opening…' : 'Try it (test — no alerts)'}
        </button>
        <p className="mt-4 text-xs text-stone-500 leading-relaxed text-center">
          More placards? Just scan each one. ·{' '}
          <Link href="/dashboard" className="text-brand-soft hover:text-brand-softer">Dashboard</Link>
        </p>
      </Shell>
    )
  }

  return (
    <Shell eyebrow={eyebrow}>
      <h1 className="text-lg font-semibold text-stone-900">Where is this placard?</h1>
      <p className="mt-1 text-sm text-stone-500">Customers’ ratings and reports will go to this spot.</p>

      {locations === null ? (
        <p className="mt-6 text-sm text-stone-500">Loading your spots…</p>
      ) : (
        <form onSubmit={claim} className="mt-5 space-y-2.5">
          {locations.map(loc => (
            <label key={loc.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
              choice === loc.id ? 'border-brand-ring bg-brand-ring/10' : 'border-stone-200 hover:border-stone-400'
            }`}>
              <input type="radio" name="spot" checked={choice === loc.id} onChange={() => setChoice(loc.id)} className="accent-teal-700" />
              <span className="text-sm text-stone-900">{loc.name}</span>
            </label>
          ))}

          <label className={`block rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
            choice === 'new' ? 'border-brand-ring bg-brand-ring/10' : 'border-stone-200 hover:border-stone-400'
          }`}>
            <span className="flex items-center gap-3">
              <input type="radio" name="spot" checked={choice === 'new'} onChange={() => setChoice('new')} className="accent-teal-700" />
              <span className="text-sm text-stone-900">{locations.length ? 'A new spot' : 'Name this spot'}</span>
            </span>
            {choice === 'new' && (
              <>
                <input
                  type="text"
                  value={name}
                  maxLength={200}
                  autoFocus
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Men’s Room"
                  className="mt-2.5 w-full rounded-lg bg-white border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-brand-ring focus:ring-1 focus:ring-brand-ring"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map(s => (
                    <button key={s} type="button" onClick={() => setName(s)}
                      className="px-2.5 py-1 rounded-full border border-stone-200 text-xs text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </label>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="pt-2.5">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand hover:bg-brand-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Link placard'}
            </button>
          </div>
        </form>
      )}
    </Shell>
  )
}
