'use client'

// Editor for the options on an "issues" question: one-tap presets, custom
// issues, per-issue alert on/off, rename, remove.
//
// Usage:
//   <IssueOptionsEditor options={q.options} onChange={opts => update(q, 'options', opts)} />
// Options are { id?, _key, label, alerts }. Send { id, label, alerts } to the API
// (existing ids are updated, new ones created, missing ones deleted).

import { useState } from 'react'
import { Bell, BellOff, Plus, X } from 'lucide-react'
import brand from '../brand'
import { issuePresetsFor } from './issuePresets'

export const MAX_ISSUE_OPTIONS = 20

export function newIssueOption(label) {
  return { _key: Math.random(), label, alerts: true }
}

export default function IssueOptionsEditor({ options, onChange }) {
  const [custom, setCustom] = useState('')

  const taken   = new Set(options.map(o => o.label.trim().toLowerCase()))
  const presets = issuePresetsFor(brand.product).filter(p => !taken.has(p.toLowerCase()))
  const atLimit = options.length >= MAX_ISSUE_OPTIONS

  const add = (label) => {
    const clean = label.trim()
    if (!clean || taken.has(clean.toLowerCase()) || atLimit) return
    onChange([...options, newIssueOption(clean)])
  }
  const update = (key, field, value) =>
    onChange(options.map(o => (o._key === key ? { ...o, [field]: value } : o)))
  const remove = (key) => onChange(options.filter(o => o._key !== key))

  const addCustom = () => {
    add(custom)
    setCustom('')
  }

  return (
    <div className="space-y-3">
      {options.length > 0 ? (
        <ul className="space-y-1.5">
          {options.map(o => (
            <li key={o._key} className="flex items-center gap-1.5">
              <input
                type="text"
                value={o.label}
                maxLength={80}
                onChange={e => update(o._key, 'label', e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
              />
              <button
                type="button"
                onClick={() => update(o._key, 'alerts', !o.alerts)}
                title={o.alerts ? 'Alerts on — click to stop emailing for this issue' : 'Alerts off — click to email when reported'}
                aria-label={o.alerts ? `Turn off alerts for ${o.label}` : `Turn on alerts for ${o.label}`}
                className={`p-1.5 rounded-lg transition-colors ${
                  o.alerts ? 'text-amber-600 hover:bg-amber-50' : 'text-gray-300 hover:bg-gray-50 hover:text-gray-500'
                }`}
              >
                {o.alerts ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => remove(o._key)}
                aria-label={`Remove ${o.label}`}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-400">Add the issues customers can report. Pick from suggestions or type your own.</p>
      )}

      {presets.length > 0 && !atLimit && (
        <div>
          <p className="text-xs text-gray-400 mb-1.5">Suggestions</p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => add(p)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-gray-300 text-xs text-gray-600 hover:border-gray-500 hover:text-gray-900 transition-colors"
              >
                <Plus className="w-3 h-3" />{p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1.5">
        <input
          type="text"
          value={custom}
          maxLength={80}
          disabled={atLimit}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          placeholder={atLimit ? `Up to ${MAX_ISSUE_OPTIONS} issues` : 'Add your own issue…'}
          className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim() || atLimit}
          className="px-3 rounded-lg bg-gray-900 text-white text-xs font-medium disabled:opacity-30 transition-opacity"
        >
          Add
        </button>
      </div>

      <p className="text-xs text-gray-400 flex items-center gap-1">
        <Bell className="w-3 h-3 text-amber-600" /> = you get an email when it’s reported. Repeat reports won’t re-email until you resolve the alert.
      </p>
    </div>
  )
}
