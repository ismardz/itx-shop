import { useCallback, useRef, useState } from 'react'
import { addToCart } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'

/**
 * Handles the add-to-cart action: loading state, error feedback and
 * cart count update. The success flag auto-resets after a short delay
 * (the timeout is cleaned up on unmount or on a new add).
 */
export function useAddToCart() {
  const { updateCartCount } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState(null)
  const [justAdded, setJustAdded] = useState(false)
  const timeoutRef = useRef(null)
  const abortRef = useRef(null)

  const add = useCallback(
    async ({ id, colorCode, storageCode }) => {
      abortRef.current?.abort()
      const abortController = new AbortController()
      abortRef.current = abortController

      clearTimeout(timeoutRef.current)
      setIsAdding(true)
      setError(null)
      setJustAdded(false)

      try {
        const response = await addToCart(
          { id, colorCode, storageCode },
          abortController.signal
        )
        updateCartCount(response.count)
        setJustAdded(true)
        timeoutRef.current = setTimeout(() => setJustAdded(false), 2500)
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err.message)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsAdding(false)
        }
      }
    },
    [updateCartCount]
  )

  const clearFeedback = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setJustAdded(false)
    setError(null)
  }, [])

  return { add, isAdding, error, justAdded, clearFeedback }
}
