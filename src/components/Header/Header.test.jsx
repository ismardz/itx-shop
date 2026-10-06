import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import Header from './Header.jsx'
import { CartProvider } from '../../context/CartContext.jsx'

function renderHeader(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CartProvider>
        <Header />
      </CartProvider>
    </MemoryRouter>
  )
}

describe('Header', () => {
  it('renders the app title as a link to home', () => {
    renderHeader('/')

    const titleLink = screen.getByRole('link', { name: /itx shop/i })
    expect(titleLink).toHaveAttribute('href', '/')
  })

  it('shows the cart count from the persisted value', () => {
    localStorage.setItem('itx_cart_count', '4')

    renderHeader('/')

    expect(screen.getByTestId('cart-count')).toHaveTextContent('4')
    localStorage.removeItem('itx_cart_count')
  })

  it('shows list breadcrumb on the product list page', () => {
    renderHeader('/')

    expect(screen.getByText('List')).toBeInTheDocument()
    expect(screen.queryByText('Product details')).not.toBeInTheDocument()
  })

  it('shows product details breadcrumb on the detail page', () => {
    renderHeader('/product/ZmQ2')

    expect(screen.getByText('Product details')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderHeader('/')
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
