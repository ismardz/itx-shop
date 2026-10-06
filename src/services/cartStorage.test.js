import { beforeEach, describe, expect, it } from 'vitest'
import { getCartCount, setCartCount } from './cartStorage.js'

describe('cartStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns 0 when nothing is stored', () => {
    expect(getCartCount()).toBe(0)
  })

  it('persists and reads back the cart count', () => {
    setCartCount(5)
    expect(getCartCount()).toBe(5)
  })
})
