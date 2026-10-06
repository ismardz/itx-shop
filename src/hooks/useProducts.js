import { useCallback, useEffect, useRef, useState } from 'react'
import { getProducts } from '../services/api.js'

/**
 * Fetches the product list. Handles loading/error state, cancellation
 * on unmount and exposes a retry function for network failures.
 */
export function useProducts() {
  const [products, setProducts] = useState([])
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

    getProducts(abortController.signal)
      .then((data) => {
        setProducts(data)
        setIsLoading(false)
      })
      .catch((err) => {
        if (abortController.signal.aborted) return
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    load()
    return () => abortRef.current?.abort()
  }, [load, retryCount])

  const retry = useCallback(() => setRetryCount((count) => count + 1), [])

  return { products, isLoading, error, retry }
}
