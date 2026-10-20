// A titled white section card for dashboard edit pages.

export default function Card({ title, aside, children }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-semibold">{title}</h2>
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      {children}
    </section>
  )
}

export const inputClass =
  'w-full rounded-lg bg-white border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-brand-ring focus:ring-1 focus:ring-brand-ring'
