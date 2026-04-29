'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface AutoRefreshResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => void
}

export function useAutoRefresh<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number,
  key?: string,
): AutoRefreshResult<T> {
  const [data,        setData]        = useState<T | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRef = useRef(fetchFn)
  fetchRef.current = fetchFn

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchRef.current()
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, intervalMs, key])

  return { data, loading, error, lastUpdated, refresh: load }
}
