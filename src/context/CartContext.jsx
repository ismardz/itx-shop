import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { getCartCount, setCartCount } from '../services/cartStorage.js'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  // Lazy initializer reads localStorage once on first render
  const [cartCount, setCartCountState] = useState(() => getCartCount())

  const updateCartCount = useCallback((count) => {
    setCartCount(count)
    setCartCountState(count)
  }, [])

  const contextValue = useMemo(
    () => ({ cartCount, updateCartCount }),
    [cartCount, updateCartCount]
  )

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
