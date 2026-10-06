import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of the given value, updated only after the
 * specified delay has passed without changes. Used to avoid filtering
 * the product list on every keystroke.
 */
export function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(value)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debounced
}
