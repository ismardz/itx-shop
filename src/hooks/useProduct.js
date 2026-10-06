import { useCallback, useEffect, useRef, useState } from 'react'
import { getProductDetail } from '../services/api.js'

/**
 * Fetches a single product detail by id. Handles loading/error state,
 * cancellation on unmount/id change and exposes a retry function.
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const abortRef = useRef(null)

  const load = useCallback(() => {
    abortRef.current?.abort()
    const abortController = new AbortController()
    abortRef.current = abortController

    setIsLoading(true)
    setError(null)

    getProductDetail(id, abortController.signal)
      .then((data) => {
        setProduct(data)
        setIsLoading(false)
      })
      .catch((err) => {
        if (abortController.signal.aborted) return
        setError(err.message)
        setIsLoading(false)
      })
  }, [id])

  useEffect(() => {
    load()
    return () => abortRef.current?.abort()
  }, [load, retryCount])

  const retry = useCallback(() => setRetryCount((count) => count + 1), [])

  return { product, isLoading, error, retry }
}
