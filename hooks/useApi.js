import { useSession } from 'next-auth/react'
import { useCallback, useMemo } from 'react'
import api from '@/lib/axios'

export function useApi() {
  const { status } = useSession()

  const request = useCallback(
    async (method, path, data = null) => {
      if (status !== 'authenticated') throw new Error('Not authenticated')
      // lib/axios.js attaches the Bearer token and handles 401/403
      // subscription_required redirects via its response interceptor
      const res = await api({ method, url: path, data })
      return res.data
    },
    [status]
  )

  return useMemo(() => ({
    ready: status === 'authenticated',
    get:    (path)       => request('get',    path),
    post:   (path, data) => request('post',   path, data),
    patch:  (path, data) => request('patch',  path, data),
    delete: (path)       => request('delete', path),
  }), [request, status])
}