'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    message: '',
    website: '', // honeypot
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())          e.name = 'Name is required.'
    if (!form.business_name.trim()) e.business_name = 'Business name is required.'
    if (!form.email.trim())         e.email = 'Email is required.'
    else if (!form.email.includes('@')) e.email = 'Enter a valid email address.'
    return e
  }

  const handleSubmit = async () => {
    setServerError('')
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, location_count: '' }),
        }
      )
      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setServerError(
          data?.detail || 'Something went wrong. Please try again or email hello@taprate.app.'
        )
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e11] text-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
          <Zap className="w-5 h-5 text-violet-400" />
          <span className="font-semibold text-sm tracking-tight">TapRate</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-16">
        {success ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-3">We'll be in touch</h1>
            <p className="text-white/60 leading-relaxed">
              Thanks for reaching out. Expect a reply within 1 business day.
            </p>
            <Link
              href="/"
              className="inline-block mt-8 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Get TapRate</h1>
              <p className="text-white/55 leading-relaxed">
                Tell us about your business and we'll get you set up — usually within a day.
              </p>
            </div>

            <div className="space-y-5">
              <Field label="Your name" error={errors.name} required>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Warren Zevon"
                  className={inputClass(errors.name)}
                />
              </Field>

              <Field label="Business name" error={errors.business_name} required>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={set('business_name')}
                  placeholder="Enjoy Every Sandwich Deli"
                  className={inputClass(errors.business_name)}
                />
              </Field>

              <Field label="Email address" error={errors.email} required>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="jane@yourbusiness.com"
                  className={inputClass(errors.email)}
                />
              </Field>

              <Field label="Phone" hint="optional">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="(401) 555-0100"
                  className={inputClass()}
                />
              </Field>

              <Field label="Anything else?" hint="optional">
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Tell us about your setup, timeline, or any questions."
                  rows={4}
                  className={inputClass() + ' resize-none'}
                />
              </Field>

              {/* Honeypot — hidden from humans */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={set('website')}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {serverError && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                  {serverError}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors text-sm"
              >
                {submitting ? 'Sending…' : 'Send message'}
              </button>

              <p className="text-center text-xs text-white/30">
                We'll reply within 1 business day.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function inputClass(error) {
  return [
    'w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25',
    'outline-none focus:ring-2 transition-colors',
    error
      ? 'border-red-500/60 focus:ring-red-500/30'
      : 'border-white/10 focus:ring-violet-500/40 focus:border-violet-500/50',
  ].join(' ')
}

function Field({ label, hint, error, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">
        {label}
        {required && <span className="text-violet-400 ml-0.5">*</span>}
        {hint && <span className="text-white/30 font-normal ml-1.5">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}