// Share image (Open Graph): the preview card shown when cleanpulse.app is
// pasted into iMessage, Slack, LinkedIn, email… Generated at build time.
// Fonts: Plus Jakarta Sans static TTFs in assets/fonts (SIL OFL — see OFL.txt).
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Cleanpulse — know the moment a restroom needs attention'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TEAL = '#0f766e'
const INK = '#1c1917'

function font(file) {
  return readFile(join(process.cwd(), 'assets/fonts', file))
}

function Drop({ size: s }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill={TEAL} />
      <path d="M16 6.5c-3.4 4.7-6.2 8.2-6.2 11.6a6.2 6.2 0 0 0 12.4 0c0-3.4-2.8-6.9-6.2-11.6z" fill="#fff" />
    </svg>
  )
}

function Chip({ children }) {
  return (
    <div style={{
      display: 'flex', flexShrink: 0, whiteSpace: 'nowrap', fontSize: 20, fontWeight: 500, color: '#451a03',
      background: '#fffbeb', border: '2px solid #fde68a', borderRadius: 999, padding: '6px 14px',
    }}>
      {children}
    </div>
  )
}

export default async function Image() {
  const [medium, semibold, bold] = await Promise.all([
    font('PlusJakartaSans-Medium.ttf'),
    font('PlusJakartaSans-SemiBold.ttf'),
    font('PlusJakartaSans-Bold.ttf'),
  ])

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', position: 'relative',
        background: '#fafaf9', fontFamily: 'Jakarta', color: INK,
      }}>
        {/* soft teal panel behind the cards */}
        <div style={{
          position: 'absolute', right: 48, top: 48, bottom: 48, width: 500, borderRadius: 48, display: 'flex',
          backgroundImage: 'linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 55%, #f5f5f4 100%)',
        }} />

        {/* left: brand + message */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 0 64px 72px', width: 660 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Drop size={52} />
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>
              Clean<span style={{ color: TEAL }}>pulse</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, lineHeight: 1.06, letterSpacing: -2, maxWidth: 560 }}>
              Know the moment a restroom needs attention.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 30, fontWeight: 500, color: '#57534e', lineHeight: 1.35 }}>
              <span>Customers tap or scan to report it.</span>
              <span>You get one clear alert.</span>
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: TEAL }}>cleanpulse.app</div>
        </div>

        {/* right: what the business sees */}
        <div style={{ position: 'absolute', right: 88, top: 116, width: 420, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{
            display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 28, padding: 30,
            boxShadow: '0 24px 48px rgba(28,25,23,0.14)', border: '1px solid rgba(28,25,23,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, fontWeight: 500, color: '#78716c' }}>
              <div style={{ display: 'flex', width: 34, height: 34, borderRadius: 999, background: '#fef3c7', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
              Needs attention · just now
            </div>
            <div style={{ display: 'flex', marginTop: 16, fontSize: 32, fontWeight: 600 }}>Men’s Room</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <Chip>Out of soap ×3</Chip>
              <Chip>Trash is full</Chip>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'center', marginTop: 22, background: TEAL, color: '#fff',
              borderRadius: 14, padding: '14px 0', fontSize: 22, fontWeight: 600,
            }}>
              Mark done
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 22,
            padding: '20px 26px', boxShadow: '0 12px 28px rgba(28,25,23,0.10)', border: '1px solid rgba(28,25,23,0.06)',
          }}>
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 600 }}>Women’s Room</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: '#065f46',
              background: '#ecfdf5', borderRadius: 999, padding: '6px 14px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              All good
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Jakarta', data: medium,   style: 'normal', weight: 500 },
        { name: 'Jakarta', data: semibold, style: 'normal', weight: 600 },
        { name: 'Jakarta', data: bold,     style: 'normal', weight: 700 },
      ],
    },
  )
}
