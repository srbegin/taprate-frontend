import { useSession } from 'next-auth/react'
import { useCallback, useMemo } from 'react'
import axios from 'axios'

export function useApi() {
  const { data: session, status } = useSession()

  const request = useCallback(
    async (method, path, data = null) => {
      if (status !== 'authenticated') throw new Error('Not authenticated')
      const res = await axios({
        method,
        url: `${process.env.NEXT_PUBLIC_API_URL}${path}`,
        data,
        headers: {
          Authorization: `Bearer ${session.access}`,
          'Content-Type': 'application/json',
        },
      })
      return res.data
    },
    [session, status]
  )

  return useMemo(() => ({
    ready: status === 'authenticated',
    get: (path) => request('get', path),
    post: (path, data) => request('post', path, data),
    patch: (path, data) => request('patch', path, data),
    delete: (path) => request('delete', path),
  }), [request, status])
}