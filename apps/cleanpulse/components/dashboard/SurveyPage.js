'use client'

// Survey: the Restroom Check customers see. A simplified editor — the rating
// question, the issues step (shown/hidden, which issues, which ones alert),
// when a low rating alerts, and optional comments. No blank builder.

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useApi } from '@platform/shared/hooks/useApi'
import IssueOptionsEditor from '@platform/shared/survey/IssueOptionsEditor'
import Toggle from '@platform/shared/ui/Toggle'
import Card, { inputClass } from './Card'
import SaveBar from './SaveBar'

const SCALES = [
  { value: 'stars',   label: 'Stars' },
  { value: 'emoji',   label: 'Faces' },
  { value: 'numbers', label: '1–5' },
]

// API survey → editable form state (options get stable keys for the editor).
function toForm(survey) {
  return {
    alert_threshold:  survey.alert_threshold,
    comments_enabled: survey.comments_enabled,
    comments_prompt:  survey.comments_prompt,
    questions: [...survey.questions]
      .sort((a, b) => a.position - b.position)
      .map(q => ({
        id: q.id,
        question: q.question,
        question_type: q.question_type,
        scale_type: q.scale_type,
        active: q.active,
        options: (q.options ?? []).map(o => ({ id: o.id, _key: o.id, label: o.label, alerts: o.alerts })),
      })),
  }
}

function RatingCard({ q, onChange, threshold, onThreshold }) {
  return (
    <Card title="Rating">
      <label className="block text-sm text-stone-600 mb-1.5" htmlFor={`q-${q.id}`}>Question</label>
      <input id={`q-${q.id}`} value={q.question} maxLength={255} onChange={e => onChange({ question: e.target.value })}
        className={inputClass} />

      <p className="mt-4 text-sm text-stone-600 mb-1.5">Answer with</p>
      <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-50">
        {SCALES.map(s => (
          <button key={s.value} type="button" onClick={() => onChange({ scale_type: s.value })}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              q.scale_type === s.value ? 'bg-white shadow-sm text-stone-900 font-medium' : 'text-stone-500 hover:text-stone-900'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm text-stone-600 mb-1.5" htmlFor="threshold">Alert me when a rating is</label>
      <div className="flex items-center gap-2">
        <select id="threshold" value={threshold} onChange={e => onThreshold(Number(e.target.value))}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n === 1 ? '1' : n === 5 ? 'anything (every rating)' : `${n} or lower`}</option>
          ))}
        </select>
        <Star className="w-4 h-4 text-amber-500" fill="currentColor" aria-hidden />
      </div>
      <p className="mt-1.5 text-xs text-stone-500">Low ratings show on Today and are emailed to you.</p>
    </Card>
  )
}

function IssuesCard({ q, onChange }) {
  return (
    <Card
      title="Issues"
      aside={
        <span className="flex items-center gap-2 text-sm text-stone-600">
          {q.active ? 'Shown' : 'Hidden'}
          <Toggle enabled={q.active} onChange={v => onChange({ active: v })} accent="brand" label="Show the issues step" />
        </span>
      }
    >
      {q.active ? (
        <>
          <label className="block text-sm text-stone-600 mb-1.5" htmlFor={`q-${q.id}`}>Question</label>
          <input id={`q-${q.id}`} value={q.question} maxLength={255} onChange={e => onChange({ question: e.target.value })}
            className={`${inputClass} mb-4`} />
          <p className="text-sm text-stone-600 mb-2">Customers can report</p>
          <IssueOptionsEditor options={q.options} onChange={options => onChange({ options })} />
        </>
      ) : (
        <p className="text-sm text-stone-500">
          Customers only rate — they aren’t asked what needs attention. Your issue list is kept for when you turn it back on.
        </p>
      )}
    </Card>
  )
}

export default function SurveyPage() {
  const { ready, get, post, patch } = useApi()
  const router = useRouter()

  const [surveys, setSurveys]     = useState(null)
  const [locations, setLocations] = useState([])
  const [selected, setSelected]   = useState(null)
  const [form, setForm]           = useState(null)
  const [saved, setSaved]         = useState(null)   // JSON of the last saved form
  const [saving, setSaving]       = useState(false)
  const [message, setMessage]     = useState(null)   // { kind: 'ok' | 'error', text }
  const [previewing, setPreviewing] = useState(false)

  const select = (survey) => {
    const next = toForm(survey)
    setSelected(survey)
    setForm(next)
    setSaved(JSON.stringify(next))
  }

  useEffect(() => {
    if (!ready) return
    Promise.all([get('/dashboard/surveys/'), get('/dashboard/locations/')]).then(
      ([s, l]) => {
        const items = s.items ?? []
        setSurveys(items)
        setLocations(l.items ?? [])
        // The survey most restrooms use (normally the only one).
        const main = [...items].sort((a, b) => b.location_count - a.location_count)[0]
        if (main) select(main)
      },
      () => setMessage({ kind: 'error', text: 'Couldn’t load your survey. Refresh to try again.' }),
    )
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = form && JSON.stringify(form) !== saved
  const usedBy = useMemo(
    () => (selected ? locations.filter(l => l.survey === selected.id) : []),
    [selected, locations],
  )

  const update = (fields) => { setForm(f => ({ ...f, ...fields })); setMessage(null) }
  const updateQuestion = (id, fields) => update({
    questions: form.questions.map(q => (q.id === id ? { ...q, ...fields } : q)),
  })

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const before = JSON.parse(saved)
      for (const q of form.questions) {
        const prev = before.questions.find(p => p.id === q.id)
        if (JSON.stringify(prev) === JSON.stringify(q)) continue
        const body = { question: q.question.trim(), scale_type: q.scale_type, active: q.active }
        if (q.question_type === 'issues') {
          body.options = q.options.map(o => ({ ...(o.id ? { id: o.id } : {}), label: o.label.trim(), alerts: o.alerts }))
        }
        await patch(`/dashboard/surveys/${selected.id}/questions/${q.id}/`, body)
      }
      const survey = await patch(`/dashboard/surveys/${selected.id}/`, {
        alert_threshold:  form.alert_threshold,
        comments_enabled: form.comments_enabled,
        comments_prompt:  form.comments_prompt.trim() || 'Anything else?',
      })
      setSurveys(list => list.map(s => (s.id === survey.id ? survey : s)))
      select(survey)
      setMessage({ kind: 'ok', text: 'Saved. Customers see the new version on their next tap or scan.' })
      setTimeout(() => setMessage(m => (m?.kind === 'ok' ? null : m)), 5000)
    } catch (err) {
      const data = err?.response?.data
      const text = data?.options?.[0] || data?.options || data?.question?.[0] || data?.detail || 'Couldn’t save. Try again.'
      setMessage({ kind: 'error', text: String(text) })
    } finally {
      setSaving(false)
    }
  }

  const preview = async () => {
    if (!usedBy.length) return
    setPreviewing(true)
    try {
      const res = await post(`/dashboard/locations/${usedBy[0].id}/preview/`)
      router.push(`/s/${res.token}`)
    } catch {
      setPreviewing(false)
      setMessage({ kind: 'error', text: 'Couldn’t open a preview.' })
    }
  }

  if (!surveys) return <p className="text-stone-500">{message?.text || 'Loading…'}</p>

  if (!surveys.length) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold tracking-tight">Survey</h1>
        <p className="mt-2 text-stone-600">
          Your Restroom Check is created when you set up your first placard.{' '}
          <Link href="/dashboard" className="text-brand-soft hover:text-brand-softer">Set one up</Link>
        </p>
      </div>
    )
  }

  const rating = form.questions.filter(q => q.question_type === 'rating')
  const issues = form.questions.filter(q => q.question_type === 'issues')

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Survey</h1>
          <p className="mt-1 text-sm text-stone-500">
            What customers see when they tap or scan
            {usedBy.length ? ` · used by ${usedBy.length} restroom${usedBy.length !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <button onClick={preview} disabled={!usedBy.length || dirty || previewing}
          title={dirty ? 'Save your changes to preview them' : undefined} aria-label="Preview survey"
          className="ml-auto shrink-0 rounded-lg border border-stone-300 hover:border-stone-400 px-3 py-1.5 text-sm text-stone-700 transition-colors disabled:opacity-40">
          {previewing ? 'Opening…' : 'Preview'}
        </button>
      </div>

      {surveys.length > 1 && (
        <select value={selected.id} onChange={e => select(surveys.find(s => s.id === e.target.value))}
          aria-label="Survey to edit" disabled={dirty}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm disabled:opacity-50">
          {surveys.map(s => <option key={s.id} value={s.id}>{s.name} ({s.location_count})</option>)}
        </select>
      )}

      {rating.map(q => (
        <RatingCard key={q.id} q={q} onChange={f => updateQuestion(q.id, f)}
          threshold={form.alert_threshold} onThreshold={v => update({ alert_threshold: v })} />
      ))}

      {issues.map(q => <IssuesCard key={q.id} q={q} onChange={f => updateQuestion(q.id, f)} />)}

      <Card
        title="Comments"
        aside={<Toggle enabled={form.comments_enabled} onChange={v => update({ comments_enabled: v })} accent="brand" label="Ask for comments" />}
      >
        {form.comments_enabled ? (
          <>
            <label className="block text-sm text-stone-600 mb-1.5" htmlFor="comments-prompt">Prompt</label>
            <input id="comments-prompt" value={form.comments_prompt} maxLength={255}
              onChange={e => update({ comments_prompt: e.target.value })} className={inputClass} />
          </>
        ) : (
          <p className="text-sm text-stone-500">Off — customers aren’t asked for a written note.</p>
        )}
      </Card>

      <SaveBar dirty={dirty} saving={saving} message={message} onSave={save} onDiscard={() => select(selected)} />
    </div>
  )
}
