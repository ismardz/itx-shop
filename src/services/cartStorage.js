const CART_COUNT_KEY = 'itx_cart_count'

/**
 * Cart count persistence.
 * The API returns the total number of items in the cart on every add,
 * so we persist that value to show it in the header on any view.
 */
export function getCartCount() {
  const stored = localStorage.getItem(CART_COUNT_KEY)
  return stored ? Number(stored) : 0
}

export function setCartCount(count) {
  localStorage.setItem(CART_COUNT_KEY, String(count))
}
