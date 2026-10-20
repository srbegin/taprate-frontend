// Hero illustration: the placard on the wall, the customer's phone mid-report,
// and the alert the business sees. Pure markup — mirrors the real survey and
// Today styling so it reads as the product, not a stock graphic.

import { Bell, Nfc } from 'lucide-react'
import FakeQr from './FakeQr'

function Drop({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0f766e" />
      <path d="M16 6.5c-3.4 4.7-6.2 8.2-6.2 11.6a6.2 6.2 0 0 0 12.4 0c0-3.4-2.8-6.9-6.2-11.6z" fill="#fff" />
    </svg>
  )
}

export function Placard({ className = '' }) {
  return (
    <div className={`w-52 rounded-2xl bg-white shadow-xl shadow-stone-900/10 ring-1 ring-stone-900/5 overflow-hidden ${className}`}>
      <div className="bg-teal-700 px-4 py-3 flex items-center gap-2">
        <Drop className="w-5 h-5" />
        <span className="text-sm font-semibold text-white tracking-tight">Cleanpulse</span>
      </div>
      <div className="px-4 pt-4 pb-5 text-center">
        <p className="text-base font-semibold text-stone-900 leading-snug">How’s this restroom?</p>
        <p className="mt-1 text-xs text-stone-500">Let us know — it takes 5 seconds.</p>
        <FakeQr className="mx-auto mt-4 w-24 h-24 text-stone-900" />
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-teal-800">
          <Nfc className="w-4 h-4" /> Scan or tap your phone
        </p>
      </div>
    </div>
  )
}

const CHIPS = [
  { label: 'Out of toilet paper' },
  { label: 'Out of soap', on: true },
  { label: 'Out of paper towels' },
  { label: 'Needs cleaning' },
  { label: 'Trash is full' },
]

// The issues step of the real (light) survey. Selected chips use the
// business's own brand colour — near-black here, like the demo café.
export function Phone({ className = '' }) {
  return (
    <div className={`w-64 rounded-[2.75rem] bg-stone-900 p-2.5 shadow-2xl shadow-stone-900/25 ${className}`}>
      <div className="rounded-[2.2rem] bg-stone-50 overflow-hidden">
        <div className="h-7 flex justify-center items-end">
          <div className="w-20 h-5 rounded-full bg-stone-900" />
        </div>
        <div className="px-4 pt-6 pb-8 text-center">
          <p className="text-[10px] font-medium text-stone-500">• Corner Cafe</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-stone-900">Corner Cafe</p>
          <p className="text-[11px] text-stone-500">Men’s Room</p>
          <div className="mt-3 flex justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-900/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
          </div>

          <p className="mt-6 text-[15px] font-medium text-stone-900">Anything need attention?</p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {CHIPS.map(chip => (
              <span key={chip.label} className={`px-3 py-2 rounded-xl border text-[11px] font-medium ${
                chip.on ? 'bg-stone-900 border-transparent text-white shadow-md shadow-black/10' : 'bg-white border-stone-300 text-stone-800'
              }`}>
                {chip.on && '✓ '}{chip.label}
              </span>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white">Report 1 issue</div>
        </div>
      </div>
    </div>
  )
}

export function AlertCard({ className = '' }) {
  return (
    <div className={`w-72 rounded-2xl bg-white p-4 shadow-xl shadow-stone-900/10 ring-1 ring-stone-900/5 ${className}`}>
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 grid place-items-center">
          <Bell className="w-3.5 h-3.5" />
        </span>
        Needs attention · just now
      </div>
      <p className="mt-2.5 font-semibold text-stone-900">Men’s Room</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="text-xs text-amber-950 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">Out of soap ×3</span>
        <span className="text-xs text-amber-950 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">Low rating · 2★</span>
      </div>
      <div className="mt-3 rounded-lg bg-teal-700 py-2 text-center text-sm font-medium text-white">Mark done</div>
    </div>
  )
}

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none h-[540px] sm:h-[580px]" aria-hidden="true">
      {/* soft backdrop */}
      <div className="absolute inset-x-6 top-10 bottom-6 rounded-[3rem] bg-gradient-to-br from-teal-100 via-teal-50 to-stone-100" />
      <div className="absolute inset-x-6 top-10 bottom-6 rounded-[3rem] opacity-60 [background-image:linear-gradient(to_right,rgb(15_118_110/0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgb(15_118_110/0.07)_1px,transparent_1px)] [background-size:28px_28px]" />

      <Placard className="hidden sm:block absolute left-0 top-20 -rotate-3" />
      <Phone className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 top-0" />
      <AlertCard className="absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-8 bottom-0 landing-float" />
    </div>
  )
}
