import brand from '../brand'
import T from './theme'

export default function SurveyUnavailable() {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: T.pageBg, minHeight: '100svh' }}
    >
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl ${T.glow} pointer-events-none`}
        style={{ background: '#e8d5a3' }}
      />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center animate-in fade-in duration-500">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${T.tile}`}>
          🙏
        </div>
        <h2 className={`${T.display} text-2xl ${T.heading} text-center mb-3`}>
          Thanks for visiting!
        </h2>
        <p className={`text-sm ${T.muted} text-center leading-relaxed`}>
          Come back and tap again soon — we'd love to hear from you next time.
        </p>
      </div>
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className={`text-xs tracking-widest uppercase ${T.footer}`}>Powered by {brand.name}</span>
      </div>
    </div>
  )
}