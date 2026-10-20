/**
 * Server-side fetch helpers for the public survey entry routes
 * (/tap, /qr, /claim, /s). Each returns parsed JSON or null — callers decide
 * where to redirect. Keep redirect() in the route file, outside try/catch:
 * it works by throwing.
 */
const API = process.env.NEXT_PUBLIC_API_URL

async function request(path, { method = 'GET', clientIp, body } = {}) {
  // Reads retry once on a server error or network blip — a customer tapping a
  // tag shouldn't land on the wrong screen because of one failed lookup.
  // Writes (session mints) are not retried.
  const attempts = method === 'GET' ? 2 : 1
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(clientIp && { 'X-Forwarded-For': clientIp }),
        },
        ...(body && { body: JSON.stringify(body) }),
        cache: 'no-store',
      })
      if (res.ok) return res.json()
      if (res.status < 500) return null
    } catch {
      // network error — retry if attempts remain
    }
  }
  return null
}

/** First client IP from the incoming request headers (for the tag rate limit). */
export function clientIpFrom(headersList) {
  return (
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headersList.get('x-real-ip') ||
    ''
  )
}

/** { claimed, location_id, product, placard_id } for an NFC tag, or null. */
export function getTagStatus(tagId) {
  return request(`/tags/${tagId}/`)
}

/** Mint a survey session for an NFC tap → { token } or null. */
export function mintTagSession(tagId, clientIp) {
  return request(`/tags/${tagId}/session/`, { method: 'POST', clientIp })
}

/** Mint a survey session for a QR scan → { token } or null. */
export function mintQrSession(locationId) {
  return request(`/survey/location/${locationId}/session/`, { method: 'POST' })
}

/** { id, short_code, product, claimed, has_nfc } for a placard, or null. */
export function getPlacard(placardId) {
  return request(`/placards/${placardId}/`)
}

/** Mint a survey session for a placard scan/tap → { token } or null. */
export function mintPlacardSession(placardId, via, clientIp) {
  return request(`/placards/${placardId}/session/`, { method: 'POST', clientIp, body: { via } })
}

/** Survey payload for a session token, or null if expired/invalid. */
export function getSurveyData(token) {
  return request(`/survey/${token}/`)
}
