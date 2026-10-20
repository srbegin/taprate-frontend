'use client'
import { useState } from 'react'
import Link from 'next/link'
import brand from '../brand'
import Wordmark from '../ui/Wordmark'
import U from '../ui/theme'

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/password-reset/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Product': brand.product },
          body: JSON.stringify({ email }),
        }
      )
      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${U.page} px-4`}>
      <div className="w-full max-w-sm">

        {/* Logo / wordmark */}
        <div className="mb-8 text-center">
          <Wordmark />
        </div>

        <div className={`${U.card} rounded-2xl p-8`}>
          {submitted ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-ring/10 border border-brand-ring/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-brand-soft" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className={`text-lg font-semibold ${U.title} mb-2`}>Check your email</h1>
              <p className={`text-sm ${U.sub} leading-relaxed`}>
                If an account exists for <span className={`${U.emphasis}`}>{email}</span>, we've sent a password reset link. It expires in 3 days.
              </p>
              <p className={`text-xs ${U.faint} mt-4`}>
                Didn't get it? Check your spam folder, or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-brand-soft hover:text-brand-softer transition-colors"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h1 className={`text-lg font-semibold ${U.title} mb-1`}>Forgot your password?</h1>
              <p className={`text-sm ${U.sub} mb-6`}>
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium ${U.label} mb-1.5`}>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-lg ${U.input} px-3 py-2.5 text-sm ${U.inputText} outline-none focus:border-brand-ring focus:ring-1 focus:ring-brand-ring transition-colors`}
                    placeholder="you@company.com"
                    autoFocus
                  />
                </div>

                {error && (
                  <p className={`text-xs ${U.error} rounded-lg px-3 py-2`}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className={`mt-4 text-center text-xs ${U.footer}`}>
          <Link href="/auth/login" className="text-brand-soft hover:text-brand-softer transition-colors">
            ← Back to sign in
          </Link>
        </p>

      </div>
    </div>
  )
}