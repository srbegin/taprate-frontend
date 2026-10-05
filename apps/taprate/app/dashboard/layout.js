import Sidebar from '@/components/dashboard/Sidebar'
import TestModeBanner from '@/components/dashboard/TestModeBanner'
import theme from '@/lib/theme'

export default function DashboardLayout({ children }) {
  return (
    <div className={`flex min-h-screen ${theme.main.bg}`}>
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TestModeBanner />
        <main className={`${theme.main.padding} flex-1`}>
          {children}
        </main>
      </div>
    </div>
  )
}