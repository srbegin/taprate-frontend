'use client'

// Staff-only: pair a placard's QR with the NFC tag stuck on it, from a phone.
// Scan the QR (opens /p/<id>) and tap the tag (opens /t/<uid>), in either
// order — each page registers its half with the API, which holds the first
// half for 10 minutes. This page then polls until the pairing completes.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useApi } from '@platform/shared/hooks/useApi'
import Shell from '@/components/Shell'

const POLL_MS = 2500

export default function PairingPanel({ placard: initialPlacard, tagId }) {
  const { ready, get, post, delete: del } = useApi()
  const [phase, setPhase]     = useState('loading')   // loading | waiting | paired | error
  const [placard, setPlacard] = useState(initialPlacard || null)
  const [pairedTag, setPairedTag] = useState(null)
  const [waitingFor, setWaitingFor] = useState(null)
  const [message, setMessage] = useState('')
  const started = useRef(false)

  // Register this page's half of the pairing; state is set in the promise callbacks.
  const register = useCallback(() => {
    const body = placard ? { placard_id: placard.id } : { tag_id: tagId }
    return post('/admin/pairing/', body).then(
      (res) => {
        if (res.status === 'paired') {
          setPlacard(res.placard)
          setPairedTag(res.tag_id)
          setPhase('paired')
        } else {
          setWaitingFor(res.waiting_for)
          setPhase('waiting')
        }
      },
      (e) => {
        const data = e?.response?.data || {}
        if (e?.response?.status === 409 && data.placard) {
          // This placard already has a tag — show it as paired
          setPlacard(data.placard)
          setPairedTag(data.placard.nfc_tag_id)
          setPhase('paired')
        } else {
          setMessage(data.detail || 'Something went wrong.')
          setPhase('error')
        }
      },
    )
  }, [placard, tagId, post])

  useEffect(() => {
    if (!ready || started.current) return
    started.current = true
    register()
  }, [ready, register])

  const retry = () => {
    setPhase('loading')
    setMessage('')
    register()
  }

  // While waiting, poll: when the pending pairing clears, check whether it completed.
  useEffect(() => {
    if (phase !== 'waiting') return
    const timer = setInterval(async () => {
      try {
        const { waiting } = await get('/admin/pairing/')
        if (waiting) return
        if (placard) {
          const status = await get(`/placards/${placard.id}/`)
          if (status.has_nfc) {
            setPlacard(status)
            setPhase('paired')
            return
          }
        } else {
          const status = await get(`/tags/${tagId}/`)
          if (status.placard_id) {
            setPairedTag(tagId)
            setPhase('paired')
            return
          }
        }
        setMessage('Pairing expired or was cancelled.')
        setPhase('error')
      } catch {
        // keep polling
      }
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [phase, placard, tagId, get])

  const cancel = async () => {
    await del('/admin/pairing/').catch(() => {})
    setMessage('Pairing cancelled.')
    setPhase('error')
  }

  const unpair = async () => {
    await post(`/admin/placards/${placard.id}/unpair/`).catch(() => {})
    setPairedTag(null)
    retry()
  }

  const code = placard?.short_code

  return (
    <Shell eyebrow="Staff · Placard pairing">
      <p className="font-mono text-3xl font-semibold text-white tracking-wider">
        {code || 'NFC tag'}
      </p>
      {!code && tagId && <p className="mt-1 font-mono text-xs text-white/40 break-all">{tagId}</p>}

      <div className="mt-5 text-sm leading-relaxed">
        {phase === 'loading' && <p className="text-white/50">Registering…</p>}

        {phase === 'waiting' && (
          <>
            <p className="text-white">
              {waitingFor === 'tag'
                ? 'Now tap the NFC tag on this sign with your phone.'
                : 'Tag ready. Now scan the QR code on its sign.'}
            </p>
            <p className="mt-2 flex items-center gap-2 text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-soft animate-pulse" />
              Waiting — this page updates when it’s done.
            </p>
            <button onClick={cancel} className="mt-5 text-xs text-white/40 hover:text-white/70 transition-colors">
              Cancel
            </button>
          </>
        )}

        {phase === 'paired' && (
          <>
            <p className="text-brand-soft font-medium">✓ Paired</p>
            <p className="mt-1 text-white/50">
              {code ? `${code} ↔ ` : ''}{pairedTag ? `tag ${String(pairedTag).slice(0, 8)}…` : 'NFC tag'}
              {placard?.claimed && ' · already claimed by a business'}
            </p>
            <p className="mt-4 text-white/60">Scan the next placard’s QR code to continue.</p>
            {placard && (
              <div className="mt-5 flex items-center gap-4 text-xs">
                <button onClick={unpair} className="text-white/40 hover:text-red-400 transition-colors">
                  Unpair
                </button>
                {!placard.claimed && (
                  <a href={`/p/${placard.id}?claim=1`} className="text-brand-soft hover:text-brand-softer transition-colors">
                    Claim it for your own business →
                  </a>
                )}
              </div>
            )}
          </>
        )}

        {phase === 'error' && (
          <>
            <p className="text-red-400">{message}</p>
            <button onClick={retry} className="mt-4 text-xs text-brand-soft hover:text-brand-softer transition-colors">
              Try again
            </button>
          </>
        )}
      </div>
    </Shell>
  )
}
