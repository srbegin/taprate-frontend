'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import brand from '../brand'
import Wordmark from '../ui/Wordmark'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password.')
    } else {
      const params = new URLSearchParams(window.location.search)
      window.location.href = params.get('callbackUrl') || '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e11] px-4">
      <div className="w-full max-w-sm">

        {/* Logo / wordmark */}
        <div className="mb-8 text-center">
          <Wordmark />
        </div>

        <div className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-8">
          <h1 className="text-lg font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-white/40 mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-brand-ring focus:ring-1 focus:ring-brand-ring transition-colors"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-white/50">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-brand-soft hover:text-brand-softer transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-brand-ring focus:ring-1 focus:ring-brand-ring transition-colors"
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
              className="w-full bg-brand hover:bg-brand-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-white/30">
          No account?{' '}
          <Link href="/auth/signup" className="text-brand-soft hover:text-brand-softer transition-colors">
            Sign up
          </Link>
        </p>
        {brand.hasLegalPages && (
          <div className="text-xs text-zinc-500 text-center mt-6 flex justify-center gap-4">
            <a href="/terms" className="hover:text-zinc-300">Terms</a>
            <a href="/privacy" className="hover:text-zinc-300">Privacy</a>
          </div>
        )}

      </div>
    </div>
  )
}