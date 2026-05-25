// components/ui/Toggle.js
// Usage:
//   <Toggle enabled={value} onChange={setValue} />
//   <Toggle enabled={value} onChange={setValue} accent="amber" />

export default function Toggle({ enabled, onChange, accent = 'default' }) {
  const trackOn = accent === 'amber' ? 'bg-amber-500' : 'bg-gray-900'

  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-400 ${
        enabled ? trackOn : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-[4px] w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
          enabled ? 'left-[20px]' : 'left-[4px]'
        }`}
      />
    </button>
  )
}