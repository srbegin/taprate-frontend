'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    org_name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Register via Django
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

      // 2. Auto sign-in after registration
      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        required
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Set up your organization and get started</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {field('first_name', 'First name', 'text', 'Jane')}
            {field('last_name', 'Last name', 'text', 'Smith')}
          </div>
          {field('org_name', 'Organization name', 'text', 'Acme Facilities')}
          {field('email', 'Work email', 'email', 'you@company.com')}
          {field('password', 'Password', 'password', '8+ characters')}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-black font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}