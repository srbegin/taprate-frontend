'use client'

import { useState, useCallback } from 'react'

const EMOJIS = ['😤', '😕', '😐', '🙂', '✨']
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

function isRateLimited(locationId) {
  if (process.env.NEXT_PUBLIC_DISABLE_COOLDOWN === 'true') return false
  try {
    const sessions = JSON.parse(localStorage.getItem('tr_sessions') || '{}')
    const last = sessions[locationId]
    if (last && (Date.now() - last) < COOLDOWN_MS) {
      return Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 60000)
    }
  } catch {}
  return false
}

function recordSession(locationId) {
  try {
    const sessions = JSON.parse(localStorage.getItem('tr_sessions') || '{}')
    sessions[locationId] = Date.now()
    localStorage.setItem('tr_sessions', JSON.stringify(sessions))
  } catch {}
}

function getLuminance(hex) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

// ── Scale components ──────────────────────────────────────────────────────────

function NumberScale({ selected, onSelect }) {
  return (
    <div className="flex gap-3">
      {[1, 2, 3, 4, 5].map(r => (
        <button key={r} onClick={() => onSelect(r)}
          className={`w-14 h-14 rounded-2xl border text-xl font-serif transition-all duration-200 ${
            selected === r
              ? 'border-amber-300/60 text-amber-100 -translate-y-1 scale-110 shadow-lg shadow-black/40'
              : 'border-white/10 text-white/40 bg-white/5 hover:border-amber-300/30 hover:text-white/70 hover:-translate-y-0.5'
          }`}
          style={selected === r ? {
            background: `rgba(${[220,80,80,200,180][r-1]},${[80,120,180,120,160][r-1]},${[80,60,60,80,120][r-1]},0.15)`
          } : {}}
          aria-label={`Rate ${r} out of 5`}
        >{r}</button>
      ))}
    </div>
  )
}

function StarScale({ selected, onSelect }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(r => (
        <button key={r} onClick={() => onSelect(r)}
          className={`text-4xl transition-all duration-150 hover:scale-110 ${
            selected !== null && r <= selected ? 'text-amber-300' : 'text-white/20'
          }`}
          aria-label={`Rate ${r} out of 5`}
        >★</button>
      ))}
    </div>
  )
}

function EmojiScale({ selected, onSelect }) {
  const labels = ['Terrible', 'Poor', 'Okay', 'Good', 'Great']
  return (
    <div className="flex gap-3">
      {EMOJIS.map((emoji, i) => (
        <button key={i} onClick={() => onSelect(i + 1)}
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

const SCALE_MAP = { numbers: NumberScale, stars: StarScale, emoji: EmojiScale }

// ── Shared shell ──────────────────────────────────────────────────────────────

function PageShell({ accentColor, children }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: '#0c0c0e', minHeight: '100svh' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: accentColor || '#e8d5a3' }} />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {children}
      </div>
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="text-xs tracking-widest uppercase text-white/10">Powered by TapRate</span>
      </div>
    </div>
  )
}

// ── No survey state ───────────────────────────────────────────────────────────

function NoSurveyState({ locationName }) {
  return (
    <PageShell accentColor="#e8d5a3">
      <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-white/5 border border-white/10">📋</div>
        <h2 className="font-serif text-2xl text-white/90 text-center mb-3">No survey yet</h2>
        {locationName && <p className="text-xs text-white/30 tracking-wide mb-4">{locationName}</p>}
        <p className="text-sm text-white/35 text-center leading-relaxed">
          This location doesn't have a survey assigned yet.
        </p>
      </div>
    </PageShell>
  )
}

// ── Step progress dots ────────────────────────────────────────────────────────

function StepDots({ total, current, accentColor }) {
  if (total <= 1) return null
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
          style={{
            background: i === current ? accentColor : i < current ? `${accentColor}60` : 'rgba(255,255,255,0.1)',
            transform: i === current ? 'scale(1.3)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  )
}

// ── Session expired state ─────────────────────────────────────────────────────

function SessionExpiredState() {
  return (
    <PageShell accentColor="#e8d5a3">
      <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-white/5 border border-white/10">
          🙏
        </div>
        <h2 className="font-serif text-2xl text-white/90 text-center mb-3">
          Thanks for visiting!
        </h2>
        <p className="text-sm text-white/40 text-center leading-relaxed">
          Come back and tap again soon — we'd love to hear from you next time.
        </p>
      </div>
    </PageShell>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function SurveyClient({ sessionToken, data }) {
  if (!data) return <SessionExpiredState />
  const { location_name, survey } = data
  if (!survey) return <NoSurveyState locationName={location_name} />
  return <SurveyFlow sessionToken={sessionToken} data={data} />
}

// ── Survey flow (inner component — hooks always run) ──────────────────────────

function SurveyFlow({ sessionToken, data }) {
  const { location_id, location_name, survey } = data
  const cooldown = isRateLimited(location_id)
  const {
    questions, comments_enabled, comments_prompt,
    brand_color, logo_url, org_name,
    incentive,
    review_redirect_enabled, review_redirect_url,
    recovery_enabled, recovery_threshold,
    recovery_message, recovery_coupon_text,
  } = survey

  const accentColor     = brand_color || '#e8d5a3'
  const luminance       = getLuminance(accentColor.startsWith('#') ? accentColor : '#e8d5a3')
  const buttonTextColor = luminance > 0.35 ? '#0c0c0e' : '#f5f5f5'

  // ── State ─────────────────────────────────────────────────────────────────
  const [page, setPage]                       = useState(cooldown ? 'limited' : 'survey')
  const [step, setStep]                       = useState(0)
  const [ratings, setRatings]                 = useState({})
  const [comment, setComment]                 = useState('')
  const [email, setEmail]                     = useState('')
  const [marketingOptIn, setMarketingOptIn]   = useState(false)
  const [recoveryTriggered, setRecoveryTriggered] = useState(false)
  const [recoveryComment, setRecoveryComment] = useState('')
  const [recoveryEmail, setRecoveryEmail]     = useState('')
  const [submitting, setSubmitting]           = useState(false)
  const [winCode, setWinCode]                 = useState(null)
  const [prizeText, setPrizeText]             = useState('')

  // ── Step layout ───────────────────────────────────────────────────────────
  // Recovery step is inserted dynamically: it only appears in the flow once
  // recoveryTriggered becomes true (i.e. any rating ≤ recovery_threshold).
  // This means totalSteps may increase by 1 as the user rates a question, but
  // since there is no back navigation the step variable remains consistent.
  const totalQuestionSteps = questions.length
  const hasCommentsStep    = comments_enabled
  const showRecoveryStep   = recovery_enabled && recoveryTriggered
  const hasIncentiveStep   = !!incentive

  const totalSteps =
    totalQuestionSteps +
    (hasCommentsStep  ? 1 : 0) +
    (showRecoveryStep ? 1 : 0) +
    (hasIncentiveStep ? 1 : 0)

  const commentsStepIndex  = hasCommentsStep ? totalQuestionSteps : -1
  const recoveryStepIndex  = showRecoveryStep
    ? totalQuestionSteps + (hasCommentsStep ? 1 : 0)
    : -1
  const incentiveStepIndex = hasIncentiveStep
    ? totalQuestionSteps + (hasCommentsStep ? 1 : 0) + (showRecoveryStep ? 1 : 0)
    : -1

  const currentQuestion = questions[step]
  const isCommentsStep  = step === commentsStepIndex
  const isRecoveryStep  = step === recoveryStepIndex
  const isIncentiveStep = step === incentiveStepIndex

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleRate = useCallback((r) => {
    setRatings(prev => ({ ...prev, [currentQuestion.id]: r }))
    if (navigator.vibrate) navigator.vibrate(10)
    // Trigger recovery once — never un-trigger within the same session.
    // The backend re-derives recovery_triggered from final submitted ratings,
    // so showing the step for a rating that was later changed is harmless.
    if (recovery_enabled && r <= recovery_threshold) {
      setRecoveryTriggered(true)
    }
  }, [currentQuestion, recovery_enabled, recovery_threshold])

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) setStep(s => s + 1)
  }, [step, totalSteps])

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      const responses = questions.map(q => ({
        question_id: q.id,
        rating: ratings[q.id],
      }))

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/survey/${sessionToken}/response/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responses,
            comment,
            email,
            marketing_opt_in: marketingOptIn,
            device_hash: getDeviceHash(),
            // Recovery fields — always sent; backend ignores them when
            // recovery_triggered evaluates to false server-side.
            recovery_comment: recoveryComment,
            recovery_email:   recoveryEmail,
          }),
        }
      )

      const result = await res.json()
      recordSession(location_id)

      if (result.incentive_won) {
        setWinCode(result.win_code || null)
        setPrizeText(result.prize_text || '')
        setPage('win')
      } else {
        setPage('thanks')
      }
    } catch {
      recordSession(location_id)
      setPage('thanks')
    } finally {
      setSubmitting(false)
    }
  }, [
    submitting, questions, ratings, comment, email,
    marketingOptIn, recoveryComment, recoveryEmail,
    sessionToken, location_id,
  ])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageShell accentColor={accentColor}>

      {/* ── SURVEY / STEPPER ── */}
      {page === 'survey' && (
        <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Header */}
          {logo_url && (
            <img
              src={logo_url}
              alt={org_name}
              className="h-10 w-auto max-w-[120px] object-contain rounded mb-4 opacity-90"
            />
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
            <span className="text-xs tracking-widest uppercase text-white/30">{org_name}</span>
          </div>
          <h1 className="font-serif text-3xl text-white/90 text-center leading-snug mb-1">{org_name}</h1>
          {location_name && (
            <p className="text-xs text-white/30 tracking-wide mb-6">{location_name}</p>
          )}

          <StepDots total={totalSteps} current={step} accentColor={accentColor} />

          {/* ── Question step ── */}
          {!isCommentsStep && !isRecoveryStep && !isIncentiveStep && currentQuestion && (() => {
            const ScaleComponent = SCALE_MAP[currentQuestion.scale_type] || NumberScale
            const canAdvance = !!ratings[currentQuestion.id]
            const isLastStep = step === totalSteps - 1

            return (
              <div className="flex flex-col items-center w-full">
                <p className="text-xs tracking-widest uppercase text-white/40 mb-7 text-center">
                  {currentQuestion.question}
                </p>
                <div className="mb-10">
                  <ScaleComponent selected={ratings[currentQuestion.id] || null} onSelect={handleRate} />
                </div>
                <button
                  onClick={isLastStep ? handleSubmit : handleNext}
                  disabled={!canAdvance || submitting}
                  className={`px-10 py-3.5 rounded-xl text-xs tracking-widest uppercase font-medium transition-all duration-200 ${
                    canAdvance && !submitting
                      ? 'opacity-100 translate-y-0 cursor-pointer hover:-translate-y-0.5 active:scale-95'
                      : 'opacity-0 translate-y-3 pointer-events-none'
                  }`}
                  style={{
                    background: accentColor,
                    color: buttonTextColor,
                    boxShadow: canAdvance ? `0 8px 24px ${accentColor}55` : 'none',
                  }}
                >
                  {submitting ? 'Sending…' : isLastStep ? 'Submit' : 'Next →'}
                </button>
              </div>
            )
          })()}

          {/* ── Comments step ── */}
          {isCommentsStep && (
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs tracking-widest uppercase text-white/40 mb-7 text-center">
                {comments_prompt || 'Any additional feedback?'}
              </p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Optional — tell us more…"
                rows={4}
                style={{ fontSize: '16px' }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:border-white/20 transition-colors mb-8"
              />
              <button
                onClick={showRecoveryStep || hasIncentiveStep ? handleNext : handleSubmit}
                disabled={submitting}
                className="px-10 py-3.5 rounded-xl text-xs tracking-widest uppercase font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                style={{ background: accentColor, color: buttonTextColor }}
              >
                {submitting ? 'Sending…' : (showRecoveryStep || hasIncentiveStep) ? 'Next →' : 'Submit'}
              </button>
              <button
                onClick={showRecoveryStep || hasIncentiveStep ? handleNext : handleSubmit}
                disabled={submitting}
                className="mt-3 text-xs text-white/20 hover:text-white/40 transition-colors tracking-wide"
              >
                Skip
              </button>
            </div>
          )}

          {/* ── Recovery step ── */}
          {isRecoveryStep && (
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}
              >
                💬
              </div>

              <p className="font-serif text-lg text-white/90 text-center mb-3 leading-snug px-2">
                {recovery_message || "We're sorry your experience fell short. Tell us what happened."}
              </p>

              {recovery_coupon_text && (
                <p className="text-xs text-white/45 text-center mb-6 leading-relaxed px-1">
                  Leave your email and we'll send you:{' '}
                  <span style={{ color: accentColor }} className="font-medium">
                    {recovery_coupon_text}
                  </span>
                </p>
              )}

              <textarea
                value={recoveryComment}
                onChange={e => setRecoveryComment(e.target.value)}
                placeholder="What could we have done better?"
                rows={3}
                style={{ fontSize: '16px' }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:border-white/20 transition-colors mb-3"
              />

              <input
                type="email"
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
                placeholder={
                  recovery_coupon_text
                    ? 'your@email.com (to receive your coupon)'
                    : 'your@email.com (optional)'
                }
                style={{ fontSize: '16px' }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors mb-7 text-center"
              />

              <button
                onClick={hasIncentiveStep ? handleNext : handleSubmit}
                disabled={submitting}
                className="px-10 py-3.5 rounded-xl text-xs tracking-widest uppercase font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                style={{ background: accentColor, color: buttonTextColor }}
              >
                {submitting ? 'Sending…' : hasIncentiveStep ? 'Next →' : 'Submit'}
              </button>

              <button
                onClick={hasIncentiveStep ? handleNext : handleSubmit}
                disabled={submitting}
                className="mt-3 text-xs text-white/20 hover:text-white/40 transition-colors tracking-wide"
              >
                Skip
              </button>
            </div>
          )}

          {/* ── Incentive email step ── */}
          {isIncentiveStep && (
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}33` }}
              >
                🎁
              </div>
              <p className="text-xs tracking-widest uppercase text-white/40 mb-2 text-center">
                Enter to win
              </p>
              <p className="font-serif text-xl text-white/90 text-center mb-6">
                {incentive.prize_text}
              </p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com (optional)"
                style={{ fontSize: '16px' }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors mb-3 text-center"
              />
              <label className="flex items-center gap-2 cursor-pointer mb-8 select-none">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={e => setMarketingOptIn(e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-white/55">Sign me up for news and deals</span>
              </label>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-10 py-3.5 rounded-xl text-xs tracking-widest uppercase font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                style={{ background: accentColor, color: buttonTextColor }}
              >
                {submitting ? 'Sending…' : 'Submit'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-3 text-xs text-white/20 hover:text-white/40 transition-colors tracking-wide"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── WIN ── */}
      {page === 'win' && (
        <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
            style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}33` }}
          >
            🎉
          </div>
          <h2 className="font-serif text-2xl text-white/90 text-center mb-2">You won!</h2>
          <p className="text-sm text-white/70 text-center mb-6 leading-relaxed">
            {prizeText}
          </p>
          <div
            className="w-full rounded-2xl px-5 py-6 flex flex-col items-center gap-2 mb-6"
            style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}33` }}
          >
            <p className="text-xs tracking-widest uppercase text-white/55 mb-1">Your code</p>
            <p className="text-4xl font-bold tracking-widest font-mono text-white">
              {winCode}
            </p>
            <p className="text-xs text-white/60 text-center mt-2 leading-relaxed">
              Screenshot this screen or write it down.
              Show it to staff when you claim your prize.
            </p>
          </div>
          {review_redirect_enabled && review_redirect_url && (
            <ReviewCTA url={review_redirect_url} accentColor={accentColor} buttonTextColor={buttonTextColor} />
          )}
        </div>
      )}

      {/* ── THANK YOU ── */}
      {page === 'thanks' && (
        <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
            style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}33` }}>
            {EMOJIS[Math.max(...Object.values(ratings), 1) - 1] || '✓'}
          </div>
          <h2 className="font-serif text-2xl text-white/90 text-center mb-3">Thank you!</h2>

          <div className="flex gap-1.5 mb-5">
            {questions.map((q) => {
              const r = ratings[q.id]
              return (
                <div key={q.id} className="w-2 h-2 rounded-full transition-colors duration-500"
                  style={{ background: r ? accentColor : 'rgba(255,255,255,0.1)' }} />
              )
            })}
          </div>

          <p className="text-sm text-white/35 text-center leading-relaxed mb-6">
            Your feedback helps us improve.
          </p>
          {review_redirect_enabled && review_redirect_url && (
            <ReviewCTA url={review_redirect_url} accentColor={accentColor} buttonTextColor={buttonTextColor} />
          )}
        </div>
      )}

      {/* ── RATE LIMITED ── */}
      {page === 'limited' && (
        <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-white/5 border border-white/10">⏱</div>
          <h2 className="font-serif text-xl text-white/90 text-center mb-3">Already submitted</h2>
          <p className="text-sm text-white/70 text-center leading-relaxed">
            Come back in{' '}
            <span style={{ color: accentColor }}>{cooldown} minute{cooldown !== 1 ? 's' : ''}</span>
            {' '}to rate again.
          </p>
        </div>
      )}

    </PageShell>
  )
}

// ── Review CTA ────────────────────────────────────────────────────────────────

function ReviewCTA({ url, accentColor, buttonTextColor }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs tracking-widest uppercase font-medium transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: accentColor, color: buttonTextColor }}
    >
      ⭐ Leave us a review
    </a>
  )
}