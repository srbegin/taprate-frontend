'use client'

import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { Gift, CheckCircle2, XCircle } from 'lucide-react'

export default function RedeemPage() {
  const { post } = useApi()

  const [code, setCode]       = useState('')
  const [win, setWin]         = useState(null)   // IncentiveWin data from validate
  const [step, setStep]       = useState('entry') // 'entry' | 'confirm' | 'redeemed'
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleLookup = async () => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 8) {
      setError('Enter the full 8-character code.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await post('/dashboard/redeem/', { code: trimmed })
      setWin(data)
      setStep(data.already_redeemed ? 'redeemed' : 'confirm')
    } catch (err) {
      const msg = err?.response?.data?.detail
      setError(msg || 'Code not found.')
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async () => {
    setLoading(true)
    try {
      const data = await post(`/dashboard/redeem/${win.code}/use/`, {})
      setWin(data)
      setStep('redeemed')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCode('')
    setWin(null)
    setStep('entry')
    setError('')
  }

  return (
    <div className="max-w-md">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Redeem a prize</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Enter the code shown on the customer's screen to validate and mark it used.
        </p>
      </div>

      {/* Step: Entry */}
      {step === 'entry' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Redemption code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="e.g. A3X7PQ2K"
              maxLength={8}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono tracking-widest outline-none focus:ring-2 focus:ring-gray-900 uppercase"
            />
            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                <XCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
          </div>
          <button
            onClick={handleLookup}
            disabled={loading || code.trim().length === 0}
            className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Looking up…' : 'Look up code'}
          </button>
        </div>
      )}

      {/* Step: Confirm (valid, not yet redeemed) */}
      {step === 'confirm' && win && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Valid win code</p>
              <p className="text-xs text-gray-500">This code has not been redeemed yet.</p>
            </div>
          </div>

          <WinDetails win={win} />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRedeem}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Redeeming…' : 'Mark as redeemed'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Redeemed (success or already used) */}
      {step === 'redeemed' && win && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {win.redeemed_by
                  ? 'Already redeemed'
                  : 'Prize redeemed'}
              </p>
              <p className="text-xs text-gray-500">
                {win.redeemed_at
                  ? `Redeemed ${new Date(win.redeemed_at).toLocaleString()}`
                  : ''}
              </p>
            </div>
          </div>

          <WinDetails win={win} />

          <button
            onClick={handleReset}
            className="w-full px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Redeem another code
          </button>
        </div>
      )}
    </div>
  )
}

function WinDetails({ win }) {
  return (
    <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 text-sm">
      <DetailRow label="Code">
        <span className="font-mono font-semibold tracking-widest">{win.code}</span>
      </DetailRow>
      <DetailRow label="Prize">{win.prize_text}</DetailRow>
      <DetailRow label="Incentive">{win.incentive_name}</DetailRow>
      <DetailRow label="Location">{win.location_name}</DetailRow>
      <DetailRow label="Won at">
        {new Date(win.created_at).toLocaleString()}
      </DetailRow>
      {win.email && (
        <DetailRow label="Email">
          {win.email}
          {win.marketing_opt_in && (
            <span className="ml-2 text-xs text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">
              opted in
            </span>
          )}
        </DetailRow>
      )}
    </div>
  )
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 flex items-center gap-1">{children}</span>
    </div>
  )
}