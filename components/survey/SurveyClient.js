'use client'

import { useState, useCallback } from 'react'

const EMOJIS = ['😤', '😕', '😐', '🙂', '✨']
const ALERT_THRESHOLD = 2
const COOLDOWN_MS = 5 * 60 * 1000

function getDeviceHash() {
  const raw = navigator.userAgent + screen.width + screen.height + navigator.language
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(16)
}

function isRateLimited(locationUuid) {
  try {
    const sessions = JSON.parse(localStorage.getItem('tr_sessions') || '{}')
    const last = sessions[locationUuid]
    if (last && (Date.now() - last) < COOLDOWN_MS) {
      return Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 60000)
    }
  } catch {}
  return false
}

function recordSession(locationUuid) {
  try {
    const sessions = JSON.parse(localStorage.getItem('tr_sessions') || '{}')
    sessions[locationUuid] = Date.now()
    localStorage.setItem('tr_sessions', JSON.stringify(sessions))
  } catch {}
}

// ── Scale components
function NumberScale({ selected, onSelect }) {
  return (
    <div className="flex gap-3">
      {[1, 2, 3, 4, 5].map(r => (
        <button
          key={r}
          onClick={() => onSelect(r)}
          className={`
            w-14 h-14 rounded-2xl border text-xl font-serif transition-all duration-200
            ${selected === r
              ? 'border-amber-300/60 text-amber-100 -translate-y-1 scale-110 shadow-lg shadow-black/40'
              : 'border-white/10 text-white/40 bg-white/5 hover:border-amber-300/30 hover:text-white/70 hover:-translate-y-0.5'
            }
          `}
          style={selected === r ? {
            background: `rgba(${[220,80,80,200,180][r-1]}, ${[80,120,180,120,160][r-1]}, ${[80,60,60,80,120][r-1]}, 0.15)`
          } : {}}
          aria-label={`Rate ${r} out of 5`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}

function StarScale({ selected, onSelect }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(r => (
        <button
          key={r}
          onClick={() => onSelect(r)}
          className={`text-4xl transition-all duration-150 hover:scale-110 ${
            selected !== null && r <= selected ? 'text-amber-300' : 'text-white/20'
          }`}
          aria-label={`Rate ${r} out of 5`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function EmojiScale({ selected, onSelect }) {
  const labels = ['Terrible', 'Poor', 'Okay', 'Good', 'Great']
  return (
    <div className="flex gap-3">
      {EMOJIS.map((emoji, i) => (
        <button
          key={i}
          onClick={() => onSelect(i + 1)}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            selected === i + 1 ? 'scale-125' : 'opacity-40 hover:opacity-70 hover:scale-110'
          }`}
          aria-label={labels[i]}
        >
          <span className="text-3xl">{emoji}</span>
          {selected === i + 1 && (
            <span className="text-xs text-amber-300/80 tracking-wide">{labels[i]}</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Main component
export default function SurveyClient({ locationUuid, data }) {
  const cooldown = isRateLimited(locationUuid)

  const [page, setPage] = useState(cooldown ? 'limited' : 'survey')
  const [selectedRating, setSelectedRating] = useState(null)
  const [comment, setComment] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [incentiveWon, setIncentiveWon] = useState(false)
  const [error, setError] = useState(null)

  const { location_name, location_floor, survey } = data
  const { question, scale_type, comments_enabled, comments_prompt, incentive, brand_color, org_name } = survey
  const accentColor = brand_color || '#e8d5a3'

  const handleRate = useCallback((r) => {
    setSelectedRating(r)
    if (navigator.vibrate) navigator.vibrate(10)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!selectedRating || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/survey/${locationUuid}/response/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: selectedRating,
            comment,
            email,
            device_hash: getDeviceHash(),
          }),
        }
      )

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Submission failed')

      recordSession(locationUuid)
      setIncentiveWon(result.incentive_won || false)

      // If incentive won and no email collected yet, go to incentive page
      if (result.incentive_won && !email) {
        setPage('incentive')
      } else {
        setPage('thanks')
      }
    } catch (err) {
      // Still show thanks — don't block the user on network errors
      recordSession(locationUuid)
      setPage('thanks')
    } finally {
      setSubmitting(false)
    }
  }, [selectedRating, comment, email, submitting, locationUuid])

  const handleIncentiveClaim = useCallback(async () => {
    if (!email) return
    setSubmitting(true)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/survey/${locationUuid}/response/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: selectedRating,
            comment,
            email,
            device_hash: getDeviceHash(),
            claim_incentive: true,
          }),
        }
      )
    } catch {}
    setSubmitting(false)
    setPage('thanks')
  }, [email, selectedRating, comment, locationUuid])

  const ScaleComponent = {
    numbers: NumberScale,
    stars: StarScale,
    emoji: EmojiScale,
  }[scale_type] || NumberScale

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: '#0c0c0e' }}
    >
      {/* Background glow based on brand color */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: accentColor }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* ── SURVEY PAGE ── */}
        {page === 'survey' && (
          <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Location info */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
              <span className="text-xs tracking-widest uppercase text-white/30">
                {location_floor || org_name}
              </span>
            </div>

            <h1 className="font-serif text-3xl text-white/90 text-center leading-snug mb-1">
              {org_name}
            </h1>
            {location_name && (
              <p className="text-xs text-white/30 tracking-wide mb-10">{location_name}</p>
            )}

            {/* Question */}
            <p className="text-xs tracking-widest uppercase text-white/40 mb-7 text-center">
              {question}
            </p>

            {/* Rating scale */}
            <div className="mb-8">
              <ScaleComponent selected={selectedRating} onSelect={handleRate} />
            </div>

            {/* Comments (if enabled and rating selected) */}
            {comments_enabled && selectedRating && (
              <div className="w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={comments_prompt || 'Any additional feedback?'}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!selectedRating || submitting}
              className={`
                px-10 py-3.5 rounded-xl text-xs tracking-widest uppercase font-medium transition-all duration-200
                ${selectedRating && !submitting
                  ? 'opacity-100 translate-y-0 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-95'
                  : 'opacity-0 translate-y-3 pointer-events-none'
                }
              `}
              style={{
                background: accentColor,
                color: '#0c0c0e',
                boxShadow: selectedRating ? `0 8px 24px ${accentColor}33` : 'none'
              }}
            >
              {submitting ? 'Sending…' : 'Submit'}
            </button>

            {error && (
              <p className="mt-4 text-xs text-red-400/70 text-center">{error}</p>
            )}
          </div>
        )}

        {/* ── INCENTIVE CLAIM PAGE ── */}
        {page === 'incentive' && (
          <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
              style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}33` }}
            >
              🎉
            </div>
            <h2 className="font-serif text-2xl text-white/90 text-center mb-3">You won!</h2>
            <p className="text-sm text-white/40 text-center mb-2 leading-relaxed">
              {incentive?.prize_text || "You've won a prize!"}
            </p>
            <p className="text-xs text-white/30 text-center mb-8">
              Enter your email and we'll send it right over.
            </p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors mb-4 text-center"
            />
            <button
              onClick={handleIncentiveClaim}
              disabled={!email || submitting}
              className="w-full py-3.5 rounded-xl text-xs tracking-widest uppercase font-medium transition-all duration-200 disabled:opacity-40"
              style={{ background: accentColor, color: '#0c0c0e' }}
            >
              {submitting ? 'Sending…' : 'Claim Prize'}
            </button>
            <button
              onClick={() => setPage('thanks')}
              className="mt-3 text-xs text-white/20 hover:text-white/40 transition-colors tracking-wide"
            >
              Skip
            </button>
          </div>
        )}

        {/* ── THANK YOU PAGE ── */}
        {page === 'thanks' && (
          <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
              style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}33` }}
            >
              {selectedRating ? EMOJIS[selectedRating - 1] : '✓'}
            </div>

            <h2 className="font-serif text-2xl text-white/90 text-center mb-3">Thank you!</h2>

            {/* Rating dots */}
            <div className="flex gap-1.5 mb-5">
              {[1,2,3,4,5].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-colors duration-500"
                  style={{
                    background: selectedRating && i <= selectedRating ? accentColor : 'rgba(255,255,255,0.1)'
                  }}
                />
              ))}
            </div>

            <p className="text-sm text-white/35 text-center leading-relaxed">
              Your feedback helps us improve.<br />
              {selectedRating <= ALERT_THRESHOLD && 'Our team has been notified.'}
            </p>

            {incentiveWon && email && (
              <p className="mt-4 text-xs text-center" style={{ color: accentColor }}>
                🎁 Your prize is on its way to {email}
              </p>
            )}
          </div>
        )}

        {/* ── RATE LIMITED PAGE ── */}
        {page === 'limited' && (
          <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-white/5 border border-white/10">
              ⏱
            </div>
            <h2 className="font-serif text-xl text-white/90 text-center mb-3">Already submitted</h2>
            <p className="text-sm text-white/35 text-center leading-relaxed">
              Come back in{' '}
              <span style={{ color: accentColor }}>{cooldown} minute{cooldown !== 1 ? 's' : ''}</span>
              {' '}to rate again.
            </p>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="text-xs tracking-widest uppercase text-white/10">
          Powered by TapRate
        </span>
      </div>
    </div>
  )
}