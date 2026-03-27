'use client'

import { useState } from 'react'

const EMOJI_MAP = {
  1: { icon: '😞', label: 'Terrible' },
  2: { icon: '😕', label: 'Bad' },
  3: { icon: '😐', label: 'Okay' },
  4: { icon: '😊', label: 'Good' },
  5: { icon: '😄', label: 'Great' },
}

export default function SurveyWidget({ data, locationUuid }) {
  const { survey, location_name } = data
  const [step, setStep] = useState('rate')   // 'rate' | 'details' | 'submitting' | 'done'
  const [rating, setRating] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [comment, setComment] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const accentColor = survey.brand_color || '#000000'

  // ── Step 1: Rating ──────────────────────────────────────────────
  const handleRatingSelect = (value) => {
    setRating(value)
    // small delay so the selection is visible before advancing
    setTimeout(() => setStep('details'), 300)
  }

  // ── Step 2: Submit ──────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('')
    setStep('submitting')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/survey/${locationUuid}/response/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating, comment, email }),
        }
      )
      const json = await res.json()
      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        setStep('details')
        return
      }
      setResult(json)
      setStep('done')
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('details')
    }
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
          {survey.org_name}
        </p>
        <h1 className="text-lg font-semibold text-gray-900 mt-1">{location_name}</h1>
      </div>

      {/* Step: Rate */}
      {step === 'rate' && (
        <div className="flex flex-col gap-5">
          <p className="text-gray-700 font-medium">{survey.question}</p>
          <RatingScale
            scaleType={survey.scale_type}
            rating={rating}
            hovered={hovered}
            accentColor={accentColor}
            onSelect={handleRatingSelect}
            onHover={setHovered}
          />
        </div>
      )}

      {/* Step: Details */}
      {step === 'details' && (
        <div className="flex flex-col gap-4">
          {/* Show selected rating as summary */}
          <SelectedRatingSummary
            scaleType={survey.scale_type}
            rating={rating}
            accentColor={accentColor}
            onBack={() => setStep('rate')}
          />

          {survey.comments_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any comments? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': accentColor }}
              />
            </div>
          )}

          {survey.incentive && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email{' '}
                <span className="text-gray-400 font-normal">
                  — enter to win: {survey.incentive.prize_text}
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ '--tw-ring-color': accentColor }}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full text-white rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            Submit
          </button>
        </div>
      )}

      {/* Step: Submitting */}
      {step === 'submitting' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: accentColor, borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-gray-500">Submitting…</p>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          {result?.incentive_won ? (
            <>
              <span className="text-5xl">🎉</span>
              <h2 className="text-xl font-semibold text-gray-900">You won!</h2>
              <p className="text-sm text-gray-500">
                Prize: <span className="font-medium text-gray-700">{result.prize_text}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Check your email for details.</p>
            </>
          ) : (
            <>
              <span className="text-5xl">🙏</span>
              <h2 className="text-xl font-semibold text-gray-900">Thank you!</h2>
              <p className="text-sm text-gray-500">Your feedback helps us improve.</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────

function RatingScale({ scaleType, rating, hovered, accentColor, onSelect, onHover }) {
  const active = hovered ?? rating

  if (scaleType === 'emoji') {
    return (
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            onMouseEnter={() => onHover(value)}
            onMouseLeave={() => onHover(null)}
            className="flex flex-col items-center gap-1 group"
          >
            <span
              className="text-3xl transition-transform duration-100"
              style={{ transform: active === value ? 'scale(1.25)' : 'scale(1)' }}
            >
              {EMOJI_MAP[value].icon}
            </span>
            <span className="text-xs text-gray-400 group-hover:text-gray-600">
              {EMOJI_MAP[value].label}
            </span>
          </button>
        ))}
      </div>
    )
  }

  if (scaleType === 'stars') {
    return (
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            onMouseEnter={() => onHover(value)}
            onMouseLeave={() => onHover(null)}
            className="text-3xl transition-transform duration-100 hover:scale-110"
            style={{ color: value <= (active ?? 0) ? accentColor : '#d1d5db' }}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  // default: numbers
  return (
    <div className="flex justify-between gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          onMouseEnter={() => onHover(value)}
          onMouseLeave={() => onHover(null)}
          className="flex-1 rounded-xl py-3 text-sm font-semibold border-2 transition-all duration-100"
          style={{
            borderColor: active === value ? accentColor : '#e5e7eb',
            backgroundColor: active === value ? accentColor : 'white',
            color: active === value ? 'white' : '#374151',
          }}
        >
          {value}
        </button>
      ))}
    </div>
  )
}

function SelectedRatingSummary({ scaleType, rating, accentColor, onBack }) {
  const display =
    scaleType === 'emoji'
      ? `${EMOJI_MAP[rating].icon} ${EMOJI_MAP[rating].label}`
      : scaleType === 'stars'
      ? '★'.repeat(rating) + '☆'.repeat(5 - rating)
      : `${rating} / 5`

  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2">
      <span className="text-sm text-gray-500">Your rating:</span>
      <span className="font-semibold text-sm" style={{ color: accentColor }}>
        {display}
      </span>
      <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 underline">
        change
      </button>
    </div>
  )
}