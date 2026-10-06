import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe } from 'jest-axe'
import { CartProvider } from './context/CartContext.jsx'
import Header from './components/Header/Header.jsx'
import ProductListPage from './pages/ProductListPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import * as api from './services/api.js'

const mockProducts = [
  {
    id: 'ZmQ2',
    brand: 'Google',
    model: 'Pixel 7a',
    price: 509,
    imgUrl: 'pixel.jpg',
  },
]

const mockDetail = {
  id: 'ZmQ2',
  brand: 'Google',
  model: 'Pixel 7a',
  price: 509,
  cpu: 'Google Tensor G2',
  imgUrl: 'pixel.jpg',
  options: {
    colors: [{ code: 0, name: 'Charcoal' }],
    storages: [{ code: 1, name: '128 GB' }],
  },
}

function renderApp(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CartProvider>
        <Header />
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  )
}

describe('routing', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('navigates from the product list to the product detail', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getProducts').mockResolvedValue(mockProducts)
    vi.spyOn(api, 'getProductDetail').mockResolvedValue(mockDetail)

    const { container } = renderApp('/')

    await screen.findByText('Pixel 7a')
    await user.click(screen.getByTestId('product-card'))

    await screen.findByRole('heading', { name: 'Pixel 7a' })
    expect(screen.getByText('Google Tensor G2')).toBeInTheDocument()
    expect(container).toBeTruthy()
  })

  it('renders the 404 page for unknown routes', async () => {
    renderApp('/does-not-exist')

    await screen.findByText('404')
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('404 page links back to the product list', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getProducts').mockResolvedValue(mockProducts)

    renderApp('/does-not-exist')

    await user.click(screen.getByRole('link', { name: /back to products/i }))

    await waitFor(() => {
      expect(screen.getByText('List')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText('Pixel 7a')).toBeInTheDocument()
    })
  })

  it('404 page has no accessibility violations', async () => {
    const { container } = renderApp('/does-not-exist')
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
