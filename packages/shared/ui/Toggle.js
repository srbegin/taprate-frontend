// ui/Toggle.js (@platform/shared)
// Usage:
//   <Toggle enabled={value} onChange={setValue} />
//   <Toggle enabled={value} onChange={setValue} accent="amber" />
//   <Toggle enabled={value} onChange={setValue} accent="brand" label="Show issues step" />

const TRACK_ON = { default: 'bg-gray-900', amber: 'bg-amber-500', brand: 'bg-brand' }

export default function Toggle({ enabled, onChange, accent = 'default', label }) {
  const trackOn = TRACK_ON[accent] ?? TRACK_ON.default

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
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