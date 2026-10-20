'use client'

// Plan & billing. Cleanpulse has no prices yet, so this shows the trial and a
// way to reach us. The shared API client sends expired accounts here, so it
// only uses /auth/me/ (not subscription-gated).

import { useEffect, useState } from 'react'
import { useApi } from '@platform/shared/hooks/useApi'
import { planState, planSummary } from './plan'

const HELLO_EMAIL = 'hello@cleanpulse.app'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function BillingPage() {
  const { ready, get, post } = useApi()
  const [org, setOrg]         = useState(null)
  const [error, setError]     = useState('')
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    if (!ready) return
    get('/auth/me/').then(
      (me) => setOrg(me.organization),
      () => setError('Couldn’t load your plan. Refresh to try again.'),
    )
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const manage = async () => {
    setOpening(true)
    try {
      const { url } = await post('/billing/portal/')
      window.location.href = url
    } catch {
      setOpening(false)
      setError('Couldn’t open billing. Try again.')
    }
  }

  if (!org) return <p className="text-stone-500">{error || 'Loading…'}</p>

  const state = planState(org)
  const restrooms = org.location_count ?? 0

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Plan</h1>

      <section className={`rounded-xl border p-4 sm:p-5 ${
        state === 'expired' ? 'border-amber-200 bg-amber-50' : 'border-stone-200 bg-white'
      }`}>
        <p className="text-lg font-semibold">{planSummary(org)}</p>
        {state === 'trial' && (
          <p className="mt-1 text-sm text-stone-600">
            Everything is included while you try it. Your trial ends {formatDate(org.trial_ends_at)}.
          </p>
        )}
        {state === 'expired' && (
          <p className="mt-1 text-sm text-amber-900">
            Your trial ended {formatDate(org.trial_ends_at)}. Get in touch and we’ll keep your restrooms running.
          </p>
        )}
        <p className="mt-3 text-sm text-stone-500">
          {restrooms} restroom{restrooms !== 1 ? 's' : ''} set up
        </p>
        {state === 'active' && (
          <button onClick={manage} disabled={opening}
            className="mt-4 bg-brand hover:bg-brand-hover text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
            {opening ? 'Opening…' : 'Manage billing'}
          </button>
        )}
      </section>

      {state !== 'active' && (
        <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
          <p className="font-semibold">Pricing is coming soon</p>
          <p className="mt-1 text-sm text-stone-600 leading-relaxed">
            We’re finalizing Cleanpulse plans. Want to keep going after your trial, or have a question?
            Email us and we’ll set you up.
          </p>
          <a href={`mailto:${HELLO_EMAIL}?subject=${encodeURIComponent('Cleanpulse plan')}`}
            className="mt-4 inline-block bg-brand hover:bg-brand-hover text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
            Email {HELLO_EMAIL}
          </a>
        </section>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
