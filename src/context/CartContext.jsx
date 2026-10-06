import { createContext, useContext, useEffect, useState } from 'react'
import { getCartCount, setCartCount } from '../services/cartStorage.js'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartCount, setCartCountState] = useState(() => getCartCount())

  function updateCartCount(count) {
    setCartCount(count)
    setCartCountState(count)
  }

  useEffect(() => {
    setCartCountState(getCartCount())
  }, [])

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
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
