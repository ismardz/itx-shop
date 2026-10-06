import { describe, expect, it } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext.jsx'

function CartProbe() {
  const { cartCount, updateCartCount } = useCart()
  return (
    <div>
      <span data-testid="probe-count">{cartCount}</span>
      <button type="button" onClick={() => updateCartCount(7)}>
        set 7
      </button>
    </div>
  )
}

describe('CartContext', () => {
  it('starts at 0 when localStorage is empty', () => {
    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>
    )

    expect(screen.getByTestId('probe-count')).toHaveTextContent('0')
  })

  it('reads the initial count from localStorage', () => {
    localStorage.setItem('itx_cart_count', '3')

    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>
    )

    expect(screen.getByTestId('probe-count')).toHaveTextContent('3')
    localStorage.removeItem('itx_cart_count')
  })

  it('updates the count and persists it to localStorage', () => {
    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>
    )

    act(() => {
      screen.getByRole('button', { name: /set 7/i }).click()
    })

    expect(screen.getByTestId('probe-count')).toHaveTextContent('7')
    expect(localStorage.getItem('itx_cart_count')).toBe('7')
    localStorage.removeItem('itx_cart_count')
  })

  it('throws a descriptive error when useCart is used outside the provider', () => {
    function Orphan() {
      useCart()
      return null
    }

    // Silence the expected React error boundary log
    const consoleError = console.error
    console.error = () => {}

    expect(() => render(<Orphan />)).toThrow(
      'useCart must be used within a CartProvider'
    )

    console.error = consoleError
  })
})
