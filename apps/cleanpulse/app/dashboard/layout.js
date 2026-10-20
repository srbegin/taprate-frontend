import AppShell from '@/components/dashboard/AppShell'

export const metadata = { title: 'Cleanpulse' }

export default function DashboardLayout({ children }) {
  return <AppShell>{children}</AppShell>
}
