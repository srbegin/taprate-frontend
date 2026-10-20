'use client'

// Early-access request → POST /api/contact/ as a Cleanpulse lead (X-Product).
// The backend emails the ops inbox and auto-replies to the business.

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import brand from '@platform/shared/brand'

const RESTROOM_COUNTS = [
  { value: '1',    label: '1 restroom' },
  { value: '2-5',  label: '2–5 restrooms' },
  { value: '6-20', label: '6–20 restrooms' },
  { value: '20+',  label: 'More than 20' },
]

const inputClass =
  'w-full rounded-lg bg-white border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-brand-ring focus:ring-1 focus:ring-brand-ring'

export default function EarlyAccessForm() {
  const [form, setForm]     = useState({ name: '', business_name: '', email: '', location_count: '2-5', message: '', website: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')   // idle | sending | sent | error

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrors({})
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Product': brand.product },
        body: JSON.stringify(form),
      })
      if (res.ok) return setStatus('sent')
      const data = await res.json().catch(() => ({}))
      setErrors(res.status === 400 ? data : { form: data.detail || 'Something went wrong. Try again.' })
      setStatus('error')
    } catch {
      setErrors({ form: 'Couldn’t send — check your connection and try again.' })
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl bg-white p-6 sm:p-8 text-center shadow-xl shadow-stone-900/10">
        <CheckCircle2 className="mx-auto w-10 h-10 text-teal-700" />
        <p className="mt-3 text-lg font-semibold text-stone-900">Thanks — you’re on the list</p>
        <p className="mt-1 text-sm text-stone-600">We’ll be in touch within one business day.</p>
      </div>
    )
  }

  const field = (key) => errors[key] && <p className="mt-1 text-xs text-red-700">{errors[key]}</p>

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 sm:p-7 shadow-xl shadow-stone-900/10 space-y-4" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ea-name" className="block text-sm font-medium text-stone-700 mb-1.5">Your name</label>
          <input id="ea-name" value={form.name} onChange={set('name')} autoComplete="name" maxLength={120} className={inputClass} />
          {field('name')}
        </div>
        <div>
          <label htmlFor="ea-business" className="block text-sm font-medium text-stone-700 mb-1.5">Business</label>
          <input id="ea-business" value={form.business_name} onChange={set('business_name')} autoComplete="organization" maxLength={200} className={inputClass} />
          {field('business_name')}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ea-email" className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
          <input id="ea-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={254} className={inputClass} />
          {field('email')}
        </div>
        <div>
          <label htmlFor="ea-count" className="block text-sm font-medium text-stone-700 mb-1.5">How many restrooms?</label>
          <select id="ea-count" value={form.location_count} onChange={set('location_count')} className={inputClass}>
            {RESTROOM_COUNTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="ea-message" className="block text-sm font-medium text-stone-700 mb-1.5">
          Anything we should know? <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <textarea id="ea-message" value={form.message} onChange={set('message')} rows={3} maxLength={2000} className={inputClass} />
      </div>

      {/* Honeypot — hidden from people, filled by bots */}
      <div className="hidden" aria-hidden="true">
        <label>Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
      </div>

      {errors.form && <p className="text-sm text-red-700">{errors.form}</p>}

      <button type="submit" disabled={status === 'sending'}
        className="w-full bg-brand hover:bg-brand-hover text-white rounded-lg py-3 text-sm font-semibold transition-colors disabled:opacity-50">
        {status === 'sending' ? 'Sending…' : 'Request early access'}
      </button>
      <p className="text-xs text-stone-500 text-center">We’ll only use this to get in touch about Cleanpulse.</p>
    </form>
  )
}
