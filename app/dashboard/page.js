// app/dashboard/page.js
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  redirect('/dashboard/locations')
}