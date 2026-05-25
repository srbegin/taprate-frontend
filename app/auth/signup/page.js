'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name: '', last_name: '', org_name: '',
    email: '', password: '', invite_code: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        const firstError = Object.values(data)[0]
        setError(Array.isArray(firstError) ? firstError[0] : firstError)
        setLoading(false)
        return
      }
      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      window.location.href = '/dashboard'
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      <input
        type={type}
        required
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e11] px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo / wordmark */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold text-white tracking-tight">
            Tap<span className="text-violet-400">Rate</span>
          </span>
        </div>

        <div className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-8">
          <h1 className="text-lg font-semibold text-white mb-1">Create your account</h1>
          <p className="text-sm text-white/40 mb-6">Set up your organization and get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {field('first_name', 'First name', 'text', 'Jane')}
              {field('last_name',  'Last name',  'text', 'Smith')}
            </div>
            {field('org_name',    'Organization name', 'text',     'Acme Co.')}
            {field('email',       'Work email',        'email',    'you@company.com')}
            {field('password',    'Password',          'password', '8+ characters')}
            {field('invite_code', 'Invite code',       'text',     'Enter your invite code')}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-white/30">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}