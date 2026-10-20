'use client'

// Restrooms: every spot the business has, the placards reporting to each,
// rename / add / move, and a test run. No delete yet (soft-delete session).

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Nfc, QrCode } from 'lucide-react'
import { useApi } from '@platform/shared/hooks/useApi'
import AddPlacardForm from './AddPlacardForm'

const inputClass =
  'w-full min-w-0 rounded-lg bg-white border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-brand-ring focus:ring-1 focus:ring-brand-ring'
const primaryButton =
  'bg-brand hover:bg-brand-hover text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50'
const quietButton =
  'rounded-lg border border-stone-300 hover:border-stone-400 px-3 py-1.5 text-sm text-stone-700 transition-colors disabled:opacity-50'

function NameForm({ initial = '', submitLabel, onSubmit, onCancel }) {
  const [name, setName]     = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Enter a name.')
    setSaving(true)
    setError('')
    try {
      await onSubmit(name.trim())
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.name?.[0] || 'Couldn’t save. Try again.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} maxLength={200} autoFocus
          onFocus={e => e.target.select()} placeholder="e.g. Women’s Room" className={inputClass} />
        <button type="submit" disabled={saving} className={primaryButton}>{saving ? 'Saving…' : submitLabel}</button>
        <button type="button" onClick={onCancel} className="px-2 text-sm text-stone-500 hover:text-stone-900">Cancel</button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  )
}

function PlacardRow({ placard, locations, onMove }) {
  const [moving, setMoving] = useState(false)
  const others = locations.filter(l => l.id !== placard.location?.id)
  const Icon = placard.has_nfc ? Nfc : QrCode

  return (
    <li className="flex items-center gap-2 py-2 text-sm">
      <Icon className="w-4 h-4 text-stone-400 shrink-0" aria-hidden />
      <span className="font-mono tracking-wide text-stone-800">{placard.short_code}</span>
      <span className="text-xs text-stone-500">{placard.has_nfc ? 'QR + tap' : 'QR only'}</span>
      {others.length > 0 && (
        <select
          aria-label={`Move ${placard.short_code}`}
          value=""
          disabled={moving}
          onChange={async (e) => {
            setMoving(true)
            try { await onMove(placard, e.target.value) } finally { setMoving(false) }
          }}
          className="ml-auto min-w-0 max-w-[45%] rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs text-stone-700 disabled:opacity-50"
        >
          <option value="" disabled>{moving ? 'Moving…' : 'Move to…'}</option>
          {others.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      )}
    </li>
  )
}

function RestroomCard({ location, placards, locations, onRename, onMove, onTest, testing }) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="min-w-0 rounded-xl border border-stone-200 bg-white p-4">
      {editing ? (
        <NameForm initial={location.name} submitLabel="Save"
          onSubmit={async (name) => { await onRename(location, name); setEditing(false) }}
          onCancel={() => setEditing(false)} />
      ) : (
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 font-semibold truncate">{location.name}</h2>
          <button onClick={() => setEditing(true)} aria-label={`Rename ${location.name}`}
            className="shrink-0 p-1 rounded text-stone-400 hover:text-stone-800">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onTest(location)} disabled={testing} className={`ml-auto shrink-0 ${quietButton}`}>
            {testing ? 'Opening…' : 'Test'}
          </button>
        </div>
      )}

      {placards.length ? (
        <ul className="mt-2 divide-y divide-stone-100">
          {placards.map(p => <PlacardRow key={p.id} placard={p} locations={locations} onMove={onMove} />)}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-stone-500">
          No placard yet — scan one and choose this restroom.
        </p>
      )}
    </div>
  )
}

export default function RestroomsPage() {
  const { ready, get, post, patch } = useApi()
  const router = useRouter()
  const [locations, setLocations] = useState(null)
  const [placards, setPlacards]   = useState([])
  const [error, setError]         = useState('')
  const [adding, setAdding]       = useState(false)
  const [testing, setTesting]     = useState(null)

  const load = () => Promise.all([get('/dashboard/locations/'), get('/dashboard/placards/')]).then(
    ([locs, plcs]) => {
      setLocations((locs.items ?? []).sort((a, b) => a.name.localeCompare(b.name)))
      setPlacards(plcs.items ?? [])
      setError('')
    },
    () => setError('Couldn’t load your restrooms. Refresh to try again.'),
  )

  useEffect(() => {
    if (ready) load()
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const rename = async (location, name) => {
    await patch(`/dashboard/locations/${location.id}/`, { name })
    await load()
  }

  const add = async (name) => {
    await post('/dashboard/locations/', { name })
    setAdding(false)
    await load()
  }

  const move = async (placard, locationId) => {
    try {
      await post(`/placards/${placard.id}/claim/`, { location_id: locationId })
      await load()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Couldn’t move that placard.')
    }
  }

  const test = async (location) => {
    setTesting(location.id)
    try {
      const res = await post(`/dashboard/locations/${location.id}/preview/`)
      router.push(`/s/${res.token}`)
    } catch {
      setTesting(null)
      setError('Couldn’t open a test survey.')
    }
  }

  if (!locations) return <p className="text-stone-500">{error || 'Loading…'}</p>

  const unlinked = placards.filter(p => !p.location)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Restrooms</h1>
          <p className="mt-1 text-sm text-stone-500">
            {locations.length} restroom{locations.length !== 1 ? 's' : ''} · {placards.length} placard
            {placards.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className={`ml-auto inline-flex items-center gap-1.5 ${quietButton}`}>
            <Plus className="w-4 h-4" /> Add restroom
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {adding && (
        <div className="rounded-xl border border-brand-ring bg-white p-4">
          <p className="text-sm font-medium mb-2">New restroom</p>
          <NameForm submitLabel="Add" onSubmit={add} onCancel={() => setAdding(false)} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {locations.map(location => (
          <RestroomCard
            key={location.id}
            location={location}
            placards={placards.filter(p => p.location?.id === location.id)}
            locations={locations}
            onRename={rename}
            onMove={move}
            onTest={test}
            testing={testing === location.id}
          />
        ))}
      </div>

      {unlinked.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-950">Not linked to a restroom</p>
          <ul className="mt-1 divide-y divide-amber-100">
            {unlinked.map(p => <PlacardRow key={p.id} placard={p} locations={locations} onMove={move} />)}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-stone-200 bg-white p-4 max-w-lg">
        <p className="font-medium">Add a placard</p>
        <p className="mt-1 mb-3 text-sm text-stone-600">
          Scan or tap it with your phone — or type the code printed on it.
        </p>
        <AddPlacardForm compact />
      </div>
    </div>
  )
}
