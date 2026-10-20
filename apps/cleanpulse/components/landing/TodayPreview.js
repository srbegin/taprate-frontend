// Browser-framed mock of the business's Today screen (same styling as the
// real dashboard), for the landing page.

import { CheckCircle2, Star, Wrench } from 'lucide-react'

const ROOMS = [
  { name: 'Men’s Room',   avg: '3.1', count: 18, open: 2, last: '2 min ago' },
  { name: 'Women’s Room', avg: '4.6', count: 24, open: 0, last: '14 min ago' },
  { name: 'Family Room',  avg: '4.8', count: 9,  open: 0, last: '1 hr ago' },
]

export default function TodayPreview() {
  return (
    <div className="rounded-2xl bg-white shadow-2xl shadow-stone-900/10 ring-1 ring-stone-900/5 overflow-hidden" aria-hidden="true">
      <div className="flex items-center gap-1.5 px-4 h-9 border-b border-stone-200 bg-stone-50">
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
        <span className="ml-3 flex-1 max-w-xs rounded-md bg-white border border-stone-200 px-2 py-0.5 text-[10px] text-stone-400 truncate">
          cleanpulse.app/dashboard
        </span>
      </div>

      <div className="p-4 sm:p-6 bg-stone-50 space-y-5">
        <div>
          <p className="text-lg font-semibold tracking-tight text-stone-900">Today</p>
          <p className="text-xs text-stone-500">3 restrooms · 1 needs attention</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex items-center gap-3">
          <Wrench className="hidden sm:block w-4 h-4 text-amber-700 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-950">Men’s Room</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="text-xs text-amber-950 bg-white/80 border border-amber-200 rounded-full px-2 py-0.5">Out of soap ×3</span>
              <span className="text-xs text-amber-950 bg-white/80 border border-amber-200 rounded-full px-2 py-0.5">Trash is full</span>
            </div>
          </div>
          <span className="shrink-0 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-medium text-white">Mark done</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ROOMS.map(room => (
            <div key={room.name} className="rounded-xl border border-stone-200 bg-white p-3 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{room.name}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className="flex items-baseline gap-1">
                  <span className="text-xl font-semibold tracking-tight text-stone-900">{room.avg}</span>
                  <Star className="w-3.5 h-3.5 text-amber-500 self-center" fill="currentColor" />
                </p>
                {room.open ? (
                  <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900">{room.open} open</span>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                    <CheckCircle2 className="w-2.5 h-2.5" /> All good
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[10px] text-stone-500">{room.count} this week · last {room.last}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
