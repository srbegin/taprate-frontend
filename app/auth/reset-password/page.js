'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const uid   = searchParams.get('uid')
  const token = searchParams.get('token')

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  // Guard against landing on this page without a valid link
  const linkValid = uid && token

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/password-reset/confirm/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, token, new_password: password }),
        }
      )
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'This reset link is invalid or has expired.')
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!linkValid) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-white mb-2">Invalid reset link</h1>
        <p className="text-sm text-white/40 mb-4">
          This link is missing required parameters. Please request a new one.
        </p>
        <Link
          href="/auth/forgot-password"
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          Request a new reset link →
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-white mb-2">Password updated</h1>
        <p className="text-sm text-white/40 mb-6">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-lg font-semibold text-white mb-1">Set a new password</h1>
      <p className="text-sm text-white/40 mb-6">
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">New password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            placeholder="8+ characters"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Confirm password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e11] px-4">
      <div className="w-full max-w-sm">

        {/* Logo / wordmark */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold text-white tracking-tight">
            Tap<span className="text-violet-400">Rate</span>
          </span>
        </div>

        <div className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-8">
          {/* useSearchParams requires Suspense boundary in Next.js App Router */}
          <Suspense fallback={<p className="text-sm text-white/40 text-center">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-xs text-white/30">
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            ← Back to sign in
          </Link>
        </p>

      </div>
    </div>
  )
}