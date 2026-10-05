import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'

/**
 * useList(path, options)
 *
 * Wraps useApi.get() for list endpoints that return { items, meta }.
 *
 * Returns:
 *   items    — the array (empty array until loaded)
 *   meta     — the meta object (empty object until loaded)
 *   loading  — true during the initial fetch
 *   error    — any caught error, or null
 *   refresh  — call to re-fetch manually
 *
 * Options:
 *   params   — URLSearchParams or plain object merged into the query string
 *   skip     — if true, don't fetch (useful when auth isn't ready yet)
 *
 * Usage:
 *   const { items: locations, meta, loading } = useList('/dashboard/locations/')
 *   const { items, meta: { at_limit } } = useList('/dashboard/locations/')
 */
export function useList(path, { params, skip = false } = {}) {
  const { ready, get } = useApi()
  const [items,   setItems]   = useState([])
  const [meta,    setMeta]    = useState({})
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Stable serialisation of params so useEffect dependency works correctly
  const paramStr = params ? new URLSearchParams(params).toString() : ''
  const url = paramStr ? `${path}?${paramStr}` : path

  const fetch = useCallback(() => {
    if (!ready || skip) return
    setLoading(true)
    setError(null)
    get(url)
      .then((data) => {
        setItems(data.items ?? [])
        setMeta(data.meta ?? {})
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [ready, url, skip]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch() }, [fetch])

  return { items, meta, loading, error, refresh: fetch }
}