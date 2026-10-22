// Legal pages (/privacy, /terms) share the public site's header and footer.
import SiteHeader from '@/components/landing/SiteHeader'
import SiteFooter from '@/components/landing/SiteFooter'

export default function LegalLayout({ children }) {
  return (
    <div className="flex-1 flex flex-col bg-stone-50 text-stone-900">
      <SiteHeader />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
