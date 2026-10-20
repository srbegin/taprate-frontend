import brand from '../brand'
import U from './theme'

// Two-part wordmark ("Tap" + accent "Rate", "Clean" + accent "pulse").
export default function Wordmark({ className = 'text-2xl' }) {
  const [first, second] = brand.wordmark
  return (
    <span className={`${className} font-semibold ${U.wordmark} tracking-tight`}>
      {first}<span className="text-brand-soft">{second}</span>
    </span>
  )
}
