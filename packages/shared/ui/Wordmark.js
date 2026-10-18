import brand from '../brand'

// Two-part wordmark ("Tap" + accent "Rate", "Clean" + accent "pulse").
export default function Wordmark({ className = 'text-2xl' }) {
  const [first, second] = brand.wordmark
  return (
    <span className={`${className} font-semibold text-white tracking-tight`}>
      {first}<span className="text-brand-soft">{second}</span>
    </span>
  )
}
