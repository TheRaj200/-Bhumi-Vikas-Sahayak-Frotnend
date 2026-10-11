import { useCallback, useEffect, useState } from 'react'

interface ApiState<T> {
  data: T | null
  error: unknown
  loading: boolean
  reload: () => void
}

/** Load data once (and on reload). Pass a stable loader (module-level function or useCallback). */
export function useApi<T>(loader: () => Promise<T>): ApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let active = true
    loader()
      .then((result) => {
        if (active) {
          setData(result)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [loader, tick])

  const reload = useCallback(() => {
    setLoading(true)
    setTick((n) => n + 1)
  }, [])

  return { data, error, loading, reload }
}
