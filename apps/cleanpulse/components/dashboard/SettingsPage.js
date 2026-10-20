'use client'

// Settings: business name, who gets alert emails, time zone, test mode,
// plan summary (→ /dashboard/billing) and password.

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ChevronRight } from 'lucide-react'
import { useApi } from '@platform/shared/hooks/useApi'
import Toggle from '@platform/shared/ui/Toggle'
import Card, { inputClass } from './Card'
import SaveBar from './SaveBar'
import { planSummary } from './plan'

const FIELDS = ['name', 'alert_email', 'alerts_enabled', 'timezone', 'test_mode']

function pick(org) {
  return Object.fromEntries(FIELDS.map(k => [k, org[k] ?? '']))
}

function timeZones(current) {
  let zones = []
  try { zones = Intl.supportedValuesOf('timeZone') } catch { /* older browsers */ }
  return zones.includes(current) || !current ? zones : [current, ...zones]
}

function PasswordCard() {
  const { post } = useApi()
  const [current, setCurrent] = useState('')
  const [next, setNext]       = useState('')
  const [saving, setSaving]   = useState(false)
  const [message, setMessage] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await post('/auth/change-password/', { current_password: current, new_password: next })
      setCurrent('')
      setNext('')
      setMessage({ kind: 'ok', text: 'Password updated.' })
    } catch (err) {
      setMessage({ kind: 'error', text: err?.response?.data?.detail || 'Couldn’t update your password.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Password">
      <form onSubmit={submit} className="space-y-3">
        <input type="password" value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password"
          placeholder="Current password" aria-label="Current password" className={inputClass} />
        <input type="password" value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password"
          placeholder="New password (8+ characters)" aria-label="New password" className={inputClass} />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || !current || next.length < 8}
            className="rounded-lg border border-stone-300 hover:border-stone-400 px-3 py-1.5 text-sm text-stone-700 transition-colors disabled:opacity-40">
            {saving ? 'Updating…' : 'Update password'}
          </button>
          {message && (
            <p className={`text-sm ${message.kind === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>{message.text}</p>
          )}
        </div>
      </form>
    </Card>
  )
}

export default function SettingsPage() {
  const { ready, get, patch } = useApi()
  const { data: session, update: updateSession } = useSession()

  const [org, setOrg]         = useState(null)
  const [form, setForm]       = useState(null)
  const [saving, setSaving]   = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!ready) return
    get('/dashboard/organization/').then(
      (data) => { setOrg(data); setForm(pick(data)) },
      () => setMessage({ kind: 'error', text: 'Couldn’t load your settings. Refresh to try again.' }),
    )
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const zones = useMemo(() => timeZones(org?.timezone), [org?.timezone])
  const deviceZone = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return null }
  }, [])
  const dirty = form && org && JSON.stringify(form) !== JSON.stringify(pick(org))
  const set = (fields) => { setForm(f => ({ ...f, ...fields })); setMessage(null) }

  const save = async () => {
    if (!form.name.trim()) return setMessage({ kind: 'error', text: 'Your business needs a name.' })
    setSaving(true)
    setMessage(null)
    try {
      const data = await patch('/dashboard/organization/', { ...form, name: form.name.trim(), alert_email: form.alert_email.trim() })
      setOrg(data)
      setForm(pick(data))
      await updateSession({ organization: data })   // top bar name + test-mode banner
      setMessage({ kind: 'ok', text: 'Saved.' })
      setTimeout(() => setMessage(m => (m?.kind === 'ok' ? null : m)), 4000)
    } catch (err) {
      const data = err?.response?.data
      const first = data && Object.values(data)[0]
      setMessage({ kind: 'error', text: String((Array.isArray(first) ? first[0] : first) || 'Couldn’t save. Try again.') })
    } finally {
      setSaving(false)
    }
  }

  if (!form) return <p className="text-stone-500">{message?.text || 'Loading…'}</p>

  const accountEmail = session?.user?.email

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card title="Business">
        <label htmlFor="org-name" className="block text-sm text-stone-600 mb-1.5">Name</label>
        <input id="org-name" value={form.name} maxLength={200} onChange={e => set({ name: e.target.value })} className={inputClass} />
        <p className="mt-1.5 text-xs text-stone-500">Shown to customers at the top of the survey.</p>

        <label htmlFor="tz" className="mt-4 block text-sm text-stone-600 mb-1.5">Time zone</label>
        <select id="tz" value={form.timezone} onChange={e => set({ timezone: e.target.value })}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">
          {zones.map(z => <option key={z} value={z}>{z.replaceAll('_', ' ')}</option>)}
        </select>
        {deviceZone && deviceZone !== form.timezone && (
          <button type="button" onClick={() => set({ timezone: deviceZone })}
            className="mt-1.5 text-xs text-brand-soft hover:text-brand-softer">
            Use this device’s time zone ({deviceZone.replaceAll('_', ' ')})
          </button>
        )}
      </Card>

      <Card
        title="Alert emails"
        aside={<Toggle enabled={form.alerts_enabled} onChange={v => set({ alerts_enabled: v })} accent="brand" label="Email alerts" />}
      >
        {form.alerts_enabled ? (
          <>
            <label htmlFor="alert-email" className="block text-sm text-stone-600 mb-1.5">Send to</label>
            <input id="alert-email" type="email" value={form.alert_email} maxLength={254}
              onChange={e => set({ alert_email: e.target.value })}
              placeholder={accountEmail || 'you@business.com'} className={inputClass} />
            <p className="mt-1.5 text-xs text-stone-500">
              {form.alert_email.trim() ? 'Reported issues and low ratings are emailed here.'
                : `Blank = your account email${accountEmail ? ` (${accountEmail})` : ''}.`}
            </p>
          </>
        ) : (
          <p className="text-sm text-stone-500">Off — problems still show on Today, but nobody is emailed.</p>
        )}
      </Card>

      <Card
        title="Test mode"
        aside={<Toggle enabled={form.test_mode} onChange={v => set({ test_mode: v })} accent="amber" label="Test mode" />}
      >
        <p className="text-sm text-stone-500">
          {form.test_mode
            ? 'On — every response is treated as a test: no alerts, and nothing counts on Today. Turn it off when you’re done trying things out.'
            : 'Turn on while you try out your placards, so test taps don’t send alerts or count.'}
        </p>
      </Card>

      <Link href="/dashboard/billing"
        className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:p-5 hover:border-stone-300 transition-colors">
        <div className="min-w-0">
          <p className="font-semibold">Plan</p>
          <p className="mt-0.5 text-sm text-stone-500">{planSummary(org)}</p>
        </div>
        <ChevronRight className="ml-auto w-4 h-4 text-stone-400 shrink-0" />
      </Link>

      <PasswordCard />

      {accountEmail && <p className="text-xs text-stone-500 px-1">Signed in as {accountEmail}</p>}

      <SaveBar dirty={dirty} saving={saving} message={message} onSave={save} onDiscard={() => setForm(pick(org))} />
    </div>
  )
}
