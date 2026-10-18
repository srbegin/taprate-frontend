import Wordmark from '@platform/shared/ui/Wordmark'

// Dark centered card used by Cleanpulse's setup screens (matches the auth pages).
export default function Shell({ eyebrow, children }) {
  return (
    <main className="full-screen-page flex items-center justify-center px-4 py-12 bg-[#0e0e11]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark />
        </div>
        <div className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-7">
          {eyebrow && <p className="text-[11px] uppercase tracking-widest text-white/40 mb-3">{eyebrow}</p>}
          {children}
        </div>
      </div>
    </main>
  )
}
