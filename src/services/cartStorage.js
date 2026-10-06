const CART_COUNT_KEY = 'itx_cart_count'

/**
 * Cart count persistence.
 * The API returns the total number of items in the cart on every add,
 * so we persist that value to show it in the header on any view.
 * All access is guarded: private browsing or full storage must not
 * crash the app.
 */
export function getCartCount() {
  try {
    const stored = localStorage.getItem(CART_COUNT_KEY)
    return stored ? Number(stored) : 0
  } catch {
    return 0
  }
}

export function setCartCount(count) {
  try {
    localStorage.setItem(CART_COUNT_KEY, String(count))
  } catch {
    // Storage unavailable: the count just won't persist across reloads
  }
}
