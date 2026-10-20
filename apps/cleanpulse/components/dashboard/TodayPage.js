'use client'

// "Today": what needs attention right now, then how every restroom is doing.
// Refreshes every minute so a phone left open stays current.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Wrench, Star, ScanLine } from 'lucide-react'
import { useApi } from '@platform/shared/hooks/useApi'
import AddPlacardForm from './AddPlacardForm'
import { alertChips, timeAgo } from './format'

const REFRESH_MS = 60 * 1000

function lastReported(alerts) {
  const times = alerts.map(a => a.last_reported_at || a.created_at).filter(Boolean)
  return times.length ? timeAgo(times.sort().at(-1)) : null
}

function FirstRun() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Set up your first placard</h1>
      <p className="mt-2 text-stone-600 leading-relaxed">
        Each placard you stick up becomes a restroom here. Two ways to add one:
      </p>
      <ol className="mt-6 space-y-4">
        <li className="flex gap-3 rounded-xl border border-stone-200 bg-white p-4">
          <ScanLine className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Scan or tap it with your phone</p>
            <p className="mt-1 text-sm text-stone-600">
              Point your camera at the placard’s QR code, or hold your phone to it. You’ll be asked which restroom
              it’s in.
            </p>
          </div>
        </li>
        <li className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="font-medium mb-3">Or type the code printed on it</p>
          <AddPlacardForm compact />
        </li>
      </ol>
    </div>
  )
}

function AttentionCard({ location, onDone, busy }) {
  const when = lastReported(location.open_alerts)
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <Wrench className="hidden sm:block w-5 h-5 text-amber-700 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-950 break-words">{location.name}</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {alertChips(location.open_alerts).map(chip => (
            <li key={chip.key} className="text-sm text-amber-950 bg-white/80 border border-amber-200 rounded-full px-2.5 py-0.5">
              {chip.label}
            </li>
          ))}
        </ul>
        {when && <p className="mt-2 text-xs text-amber-800">Last reported {when}</p>}
      </div>
      <button
        onClick={() => onDone(location)}
        disabled={busy}
        className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {busy ? 'Saving…' : 'Mark done'}
      </button>
    </div>
  )
}

function RestroomCard({ location }) {
  const open = alertChips(location.open_alerts).length
  const last = timeAgo(location.last_response_at)
  return (
    <div className="min-w-0 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 font-medium truncate">{location.name}</p>
        {open ? (
          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
            {open} open
          </span>
        ) : (
          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
            All good
          </span>
        )}
      </div>
      <p className="mt-3 flex items-baseline gap-1.5">
        {location.avg_rating_7d != null ? (
          <>
            <span className="text-2xl font-semibold tracking-tight">{location.avg_rating_7d.toFixed(1)}</span>
            <Star className="w-4 h-4 text-amber-500 self-center" fill="currentColor" />
            <span className="text-sm text-stone-500">· {location.ratings_7d} this week</span>
          </>
        ) : (
          <span className="text-sm text-stone-500">No ratings this week</span>
        )}
      </p>
      <p className="mt-1 text-xs text-stone-500">{last ? `Last report ${last}` : 'No reports yet'}</p>
    </div>
  )
}

export default function TodayPage() {
  const { ready, get, post } = useApi()
  const [data, setData]   = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(null)

  const load = useCallback(
    () => get('/dashboard/status/').then(
      (res) => { setData(res); setError('') },
      () => setError('Couldn’t load the latest status. Retrying…'),
    ),
    [get],
  )

  useEffect(() => {
    if (!ready) return
    // First visit from another product: make sure the business has Cleanpulse (no-op after).
    post('/billing/trial/').catch(() => {}).then(load)
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const markDone = async (location) => {
    setBusy(location.id)
    try {
      await post(`/dashboard/locations/${location.id}/resolve-alerts/`)
      await load()
    } finally {
      setBusy(null)
    }
  }

  if (!data) {
    return <p className="text-stone-500">{error || 'Loading…'}</p>
  }
  if (data.locations.length === 0) return <FirstRun />

  const attention = data.locations.filter(l => l.open_alerts.length)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="mt-1 text-sm text-stone-500">
          {data.locations.length} restroom{data.locations.length !== 1 ? 's' : ''}
          {' · '}
          {attention.length ? `${attention.length} need${attention.length === 1 ? 's' : ''} attention` : 'all clear'}
        </p>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Needs attention</h2>
        {attention.length ? (
          <div className="space-y-2.5">
            {attention.map(location => (
              <AttentionCard key={location.id} location={location} onDone={markDone} busy={busy === location.id} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <p className="text-sm text-emerald-900">All clear — nothing reported that needs attention.</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-700">All restrooms · last 7 days</h2>
          <Link href="/dashboard/restrooms" className="text-sm text-brand-soft hover:text-brand-softer">Manage</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.locations.map(location => <RestroomCard key={location.id} location={location} />)}
        </div>
      </section>
    </div>
  )
}
