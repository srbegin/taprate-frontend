'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import api from '@/lib/axios'

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidHex(hex) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)
}

function isValidUrl(str) {
  try { new URL(str); return true } catch { return false }
}

function expandShortHex(hex) {
  const [, r, g, b] = hex.match(/^#(.)(.)(.)$/)
  return `#${r}${r}${g}${g}${b}${b}`
}

const TIMEZONES = [
  { value: 'UTC',                  label: 'UTC' },
  { value: 'America/New_York',     label: 'Eastern Time (ET)' },
  { value: 'America/Chicago',      label: 'Central Time (CT)' },
  { value: 'America/Denver',       label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles',  label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage',    label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu',     label: 'Hawaii Time (HT)' },
  { value: 'Europe/London',        label: 'London (GMT/BST)' },
  { value: 'Europe/Paris',         label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin',        label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Dubai',           label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata',         label: 'India (IST)' },
  { value: 'Asia/Shanghai',        label: 'China (CST)' },
  { value: 'Asia/Tokyo',           label: 'Japan (JST)' },
  { value: 'Australia/Sydney',     label: 'Sydney (AEST/AEDT)' },
]

// ── Reusable layout components ────────────────────────────────────────────────

function Section({ title, description, children }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 py-8 border-b border-gray-100 last:border-0">
      <div className="md:w-64 shrink-0">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="flex-1 max-w-lg space-y-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', readOnly, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors
        ${readOnly
          ? 'bg-gray-50 text-gray-400 cursor-default'
          : 'bg-white text-gray-900 focus:border-gray-400 focus:ring-1 focus:ring-gray-200'
        }`}
      {...props}
    />
  )
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors"
    >
      {children}
    </select>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1
          ${checked ? 'bg-gray-900' : 'bg-gray-200'}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200
            ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}

function ThresholdPicker({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
            ${value === n
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      {msg}
    </p>
  )
}

function SaveButton({ loading, saved, onClick, label = 'Save changes' }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        onClick={onClick}
        disabled={loading}
        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving…' : label}
      </button>
      {saved && <span className="text-xs text-emerald-600 font-medium">Saved ✓</span>}
    </div>
  )
}

// ── Color field — hex text input + native picker swatch ───────────────────────

function ColorField({ value, onChange, hint }) {
  const pickerRef = useRef(null)

  const pickerValue = isValidHex(value)
    ? (value.length === 4 ? expandShortHex(value) : value)
    : '#000000'

  return (
    <Field label="Brand color" hint={hint}>
      <div className="flex items-center gap-2">
        <div
          className="relative w-8 h-8 rounded-md border border-gray-200 shrink-0 cursor-pointer overflow-hidden"
          style={{ background: isValidHex(value) ? value : '#e5e7eb' }}
          onClick={() => pickerRef.current?.click()}
          title="Open color picker"
        >
          <input
            ref={pickerRef}
            type="color"
            value={pickerValue}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            tabIndex={-1}
          />
        </div>
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#a855f7"
        />
      </div>
    </Field>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session, update } = useSession()

  // ── Branding state
  const [orgName, setOrgName]       = useState('')
  const [brandColor, setBrandColor] = useState('')
  const [logoUrl, setLogoUrl]       = useState('')
  const [orgLoading, setOrgLoading] = useState(false)
  const [orgSaved, setOrgSaved]     = useState(false)
  const [orgError, setOrgError]     = useState('')

  // ── Notifications state
  const [alertEmail, setAlertEmail]       = useState('')
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [testMode, setTestMode]           = useState(false)
  const [notifLoading, setNotifLoading]   = useState(false)
  const [notifSaved, setNotifSaved]       = useState(false)
  const [notifError, setNotifError]       = useState('')

  // ── Survey defaults state
  const [defThreshold, setDefThreshold]             = useState(2)
  const [defReviewUrl, setDefReviewUrl]             = useState('')
  const [defCommentsEnabled, setDefCommentsEnabled] = useState(false)
  const [defCommentsPrompt, setDefCommentsPrompt]   = useState('Any additional feedback?')
  const [defTimezone, setDefTimezone]               = useState('UTC')
  const [defsLoading, setDefsLoading]               = useState(false)
  const [defsSaved, setDefsSaved]                   = useState(false)
  const [defsError, setDefsError]                   = useState('')

  // ── Password state
  const [pwForm, setPwForm]       = useState({ current: '', next: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSaved, setPwSaved]     = useState(false)
  const [pwError, setPwError]     = useState('')

  // Load org from API
  useEffect(() => {
    async function loadOrg() {
      try {
        const { data } = await api.get('/dashboard/organization/')
        setOrgName(data.name || '')
        setBrandColor(data.brand_color || '#0c0c0e')
        setLogoUrl(data.logo_url || '')
        setAlertEmail(data.alert_email || '')
        setAlertsEnabled(data.alerts_enabled ?? true)
        setTestMode(data.test_mode ?? false)
        setDefThreshold(parseInt(data.default_alert_threshold) || 2)
        setDefReviewUrl(data.default_review_url || '')
        setDefCommentsEnabled(data.default_comments_enabled ?? false)
        setDefCommentsPrompt(data.default_comments_prompt || 'Any additional feedback?')
        setDefTimezone(data.timezone || 'UTC')
      } catch {}
    }
    loadOrg()
  }, [])

  // ── Save handlers

  const handleOrgSave = async () => {
    setOrgError('')
    if (brandColor && !isValidHex(brandColor)) {
      setOrgError('Brand color must be a valid hex value, e.g. #a855f7')
      return
    }
    if (logoUrl && !isValidUrl(logoUrl)) {
      setOrgError('Logo URL must be a valid URL.')
      return
    }
    setOrgLoading(true)
    try {
      const { data } = await api.patch('/dashboard/organization/', {
        name: orgName,
        brand_color: brandColor,
        logo_url: logoUrl,
      })
      await update({
        organization: {
          ...session?.user?.organization,
          name: data.name,
          brand_color: data.brand_color,
          logo_url: data.logo_url,
        },
      })
      setOrgSaved(true)
      setTimeout(() => setOrgSaved(false), 3000)
    } catch (e) {
      setOrgError(e?.response?.data?.detail || 'Failed to save changes.')
    } finally {
      setOrgLoading(false)
    }
  }

  const handleNotifSave = async () => {
    setNotifError('')
    setNotifLoading(true)
    try {
      await api.patch('/dashboard/organization/', {
        alert_email:    alertEmail,
        alerts_enabled: alertsEnabled,
        test_mode:      testMode,
      })
      await update({
        organization: {
          ...session?.user?.organization,
          test_mode:      testMode,
          alerts_enabled: alertsEnabled,
          alert_email:    alertEmail,
        },
      })
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 3000)
    } catch (e) {
      setNotifError(e?.response?.data?.detail || 'Failed to save changes.')
    } finally {
      setNotifLoading(false)
    }
  }

  const handleDefaultsSave = async () => {
    setDefsError('')
    if (defReviewUrl && !isValidUrl(defReviewUrl)) {
      setDefsError('Review URL must be a valid URL.')
      return
    }
    setDefsLoading(true)
    try {
      await api.patch('/dashboard/organization/', {
        default_alert_threshold:  defThreshold,
        default_review_url:       defReviewUrl,
        default_comments_enabled: defCommentsEnabled,
        default_comments_prompt:  defCommentsPrompt,
        timezone:                 defTimezone,
      })
      setDefsSaved(true)
      setTimeout(() => setDefsSaved(false), 3000)
    } catch (e) {
      setDefsError(e?.response?.data?.detail || 'Failed to save changes.')
    } finally {
      setDefsLoading(false)
    }
  }

  const handlePasswordSave = async () => {
    setPwError('')
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError('All password fields are required.')
      return
    }
    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    setPwLoading(true)
    try {
      await api.post('/auth/change-password/', {
        current_password: pwForm.current,
        new_password:     pwForm.next,
      })
      setPwForm({ current: '', next: '', confirm: '' })
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 3000)
    } catch (e) {
      setPwError(e?.response?.data?.detail || 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  const user = session?.user

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your organization and account preferences.</p>
      </div>

      {/* ── Branding ── */}
      <Section
        title="Branding"
        description="Displayed on your survey pages and in customer-facing emails."
      >
        <Field label="Organization name">
          <Input
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="Acme Coffee Co."
          />
        </Field>

        <ColorField
          value={brandColor}
          onChange={setBrandColor}
          hint="Accent color on survey pages. Click the swatch to open a picker, or type a hex value."
        />

        <Field
          label="Logo URL"
          hint="A publicly accessible image URL. Displayed at the top of your survey page."
        >
          <Input
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
          {logoUrl && isValidUrl(logoUrl) && (
            <div className="mt-2 p-3 border border-gray-100 rounded-lg bg-gray-50 flex items-center gap-3">
              <img
                src={logoUrl}
                alt="Logo preview"
                className="h-10 w-auto max-w-[120px] object-contain rounded"
                onError={e => { e.target.style.display = 'none' }}
              />
              <span className="text-xs text-gray-400">Preview</span>
            </div>
          )}
        </Field>

        <ErrorMsg msg={orgError} />
        <SaveButton loading={orgLoading} saved={orgSaved} onClick={handleOrgSave} />
      </Section>

      {/* ── Notifications ── */}
      <Section
        title="Notifications"
        description="Configure alert emails and testing behavior."
      >
        <Toggle
          checked={alertsEnabled}
          onChange={setAlertsEnabled}
          label="Send email alerts for low ratings"
        />

        <Field
          label="Alert email"
          hint="Receives low-rating alerts. Defaults to your account email if left blank."
        >
          <Input
            type="email"
            value={alertEmail}
            onChange={e => setAlertEmail(e.target.value)}
            placeholder="alerts@yourcompany.com"
          />
        </Field>

        {/* Test mode — visually separated to signal it's a different kind of setting */}
        <div className={`rounded-lg border p-4 space-y-2 transition-colors ${
          testMode ? 'border-amber-200 bg-amber-50' : 'border-gray-100'
        }`}>
          <Toggle
            checked={testMode}
            onChange={setTestMode}
            label="Test mode"
          />
          <p className="text-xs text-gray-400 leading-relaxed">
            When on, all survey submissions are marked as test responses and excluded
            from analytics, insights, and alert emails. Turn on before physically
            testing your setup, off when done.
          </p>
          {testMode && (
            <p className="text-xs font-medium text-amber-600">
              ⚠ Test mode is active — responses are not counted.
            </p>
          )}
        </div>

        <ErrorMsg msg={notifError} />
        <SaveButton loading={notifLoading} saved={notifSaved} onClick={handleNotifSave} />
      </Section>

      {/* ── Survey defaults ── */}
      <Section
        title="Survey defaults"
        description="These values pre-fill when you create a new survey. You can override any of them per survey."
      >
        <Field
          label="Alert threshold"
          hint="Trigger an alert when a rating falls at or below this value."
        >
          <ThresholdPicker value={defThreshold} onChange={setDefThreshold} />
        </Field>

        <Field
          label="Review redirect URL"
          hint="After a positive rating, optionally redirect customers to leave a public review."
        >
          <Input
            value={defReviewUrl}
            onChange={e => setDefReviewUrl(e.target.value)}
            placeholder="https://g.page/r/your-business/review"
          />
        </Field>

        <div className="space-y-3 rounded-lg border border-gray-100 p-4">
          <Toggle
            checked={defCommentsEnabled}
            onChange={setDefCommentsEnabled}
            label="Enable comment box"
          />
          {defCommentsEnabled && (
            <Field label="Comment prompt">
              <Input
                value={defCommentsPrompt}
                onChange={e => setDefCommentsPrompt(e.target.value)}
                placeholder="Any additional feedback?"
              />
            </Field>
          )}
        </div>

        <Field
          label="Timezone"
          hint="Used to group and display response data by local date in your dashboard."
        >
          <Select value={defTimezone} onChange={setDefTimezone}>
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </Select>
        </Field>

        <ErrorMsg msg={defsError} />
        <SaveButton loading={defsLoading} saved={defsSaved} onClick={handleDefaultsSave} />
      </Section>

      {/* ── Account ── */}
      <Section
        title="Account"
        description="Your personal account information."
      >
        <div className="flex gap-3">
          <Field label="First name">
            <Input value={user?.name?.split(' ')[0] || ''} readOnly />
          </Field>
          <Field label="Last name">
            <Input value={user?.name?.split(' ').slice(1).join(' ') || ''} readOnly />
          </Field>
        </div>
        <Field label="Email">
          <Input value={user?.email || ''} readOnly />
        </Field>
        <p className="text-xs text-gray-400">To update your name or email, contact support.</p>
      </Section>

      {/* ── Password ── */}
      <Section
        title="Password"
        description="Change your account password. You'll need your current password to confirm."
      >
        <Field label="Current password">
          <Input
            type="password"
            value={pwForm.current}
            onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
            placeholder="••••••••"
          />
        </Field>
        <Field label="New password">
          <Input
            type="password"
            value={pwForm.next}
            onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
            placeholder="Min. 8 characters"
          />
        </Field>
        <Field label="Confirm new password">
          <Input
            type="password"
            value={pwForm.confirm}
            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
            placeholder="••••••••"
          />
        </Field>
        <ErrorMsg msg={pwError} />
        <SaveButton loading={pwLoading} saved={pwSaved} onClick={handlePasswordSave} label="Update password" />
      </Section>

    </div>
  )
}