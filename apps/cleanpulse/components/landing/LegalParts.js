// Building blocks for the legal pages (privacy, terms).
import { HELLO_EMAIL } from './SiteFooter'

export function LegalHeader({ title, effective }) {
  return (
    <header className="space-y-3 pb-6 border-b border-stone-200">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">{title}</h1>
      <p className="text-sm text-stone-500">Effective {effective}</p>
    </header>
  )
}

export function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-stone-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function Term({ children }) {
  return <span className="font-medium text-stone-900">{children}</span>
}

export function List({ children }) {
  return <ul className="list-disc pl-6 space-y-1.5">{children}</ul>
}

export function Email() {
  return (
    <a href={`mailto:${HELLO_EMAIL}`} className="text-brand-soft hover:text-brand-softer underline underline-offset-2">
      {HELLO_EMAIL}
    </a>
  )
}
