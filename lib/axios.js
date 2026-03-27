import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const session = await getSession()

  // If next-auth couldn't refresh, bail out immediately
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
    if (error.response?.status === 401) {
      // Proactive refresh should prevent this, but if it still happens — sign out
      await signOut({ callbackUrl: '/auth/login' })
    }
    return Promise.reject(error)
  }
)

export default api