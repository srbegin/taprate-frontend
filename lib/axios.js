import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const session = await getSession()

  // If next-auth couldn't refresh the access token, bail out immediately
  if (session?.error === 'RefreshAccessTokenError') {
    await signOut({ callbackUrl: '/auth/login' })
    return Promise.reject(new Error('Session expired'))
  }

  if (session?.access) {
    config.headers.Authorization = `Bearer ${session.access}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status
    const code   = error.response?.data?.code

    // Subscription required — trial ended or no active plan
    if (status === 403 && code === 'subscription_required') {
      window.location.href = '/dashboard/billing'
      return Promise.reject(error)
    }

    // Expired / invalid session
    if (status === 401) {
      await signOut({ callbackUrl: '/auth/login' })
    }

    return Promise.reject(error)
  }
)

export default api