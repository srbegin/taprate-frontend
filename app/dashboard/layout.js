import Sidebar from '@/components/dashboard/Sidebar'
import { SessionProvider } from 'next-auth/react'

export default function DashboardLayout({ children }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 min-w-0 p-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}