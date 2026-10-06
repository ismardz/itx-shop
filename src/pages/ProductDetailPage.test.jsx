import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe } from 'jest-axe'
import { CartProvider } from '../context/CartContext.jsx'
import Header from '../components/Header/Header.jsx'
import ProductDetailPage from './ProductDetailPage.jsx'
import * as api from '../services/api.js'

const mockDetail = {
  id: 'ZmQ2',
  brand: 'Google',
  model: 'Pixel 7a',
  price: 509,
  cpu: 'Google Tensor G2',
  ram: '8 GB',
  os: 'Android 13',
  displaySize: '6.1 FHD+',
  battery: '4385 mAh',
  primaryCamera: '64 MP',
  secondaryCamera: '13 MP',
  dimentions: '152 x 72.9 x 9 mm',
  weight: 185,
  imgUrl: 'pixel.jpg',
  options: {
    colors: [
      { code: 0, name: 'Charcoal' },
      { code: 1, name: 'Snow' },
    ],
    storages: [
      { code: 1, name: '128 GB' },
      { code: 2, name: '256 GB' },
    ],
  },
}

function renderDetailPage() {
  return render(
    <MemoryRouter initialEntries={['/product/ZmQ2']}>
      <CartProvider>
        <Routes>
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  )
}

describe('ProductDetailPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('shows loading skeletons while fetching the product', () => {
    vi.spyOn(api, 'getProductDetail').mockReturnValue(new Promise(() => {}))

    renderDetailPage()

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument()
  })

  it('renders the product details in two columns with all specs', async () => {
    vi.spyOn(api, 'getProductDetail').mockResolvedValue(mockDetail)

    renderDetailPage()

    await screen.findByRole('heading', { name: 'Pixel 7a' })

    expect(screen.getByText('Google Tensor G2')).toBeInTheDocument()
    expect(screen.getByText('4385 mAh')).toBeInTheDocument()
    expect(screen.getByText('64 MP / 13 MP')).toBeInTheDocument()
    expect(screen.getByText('185 g')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to products/i })).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('pre-selects the first storage and color options', async () => {
    vi.spyOn(api, 'getProductDetail').mockResolvedValue(mockDetail)

    renderDetailPage()
    await screen.findByRole('heading', { name: 'Pixel 7a' })

    const selects = screen.getAllByRole('combobox')
    expect(selects[0]).toHaveValue('1') // 128 GB
    expect(selects[1]).toHaveValue('0') // Charcoal
  })

  it('adds the product to the cart with the selected codes and updates the header count', async () => {
    vi.spyOn(api, 'getProductDetail').mockResolvedValue(mockDetail)
    const addToCartSpy = vi
      .spyOn(api, 'addToCart')
      .mockResolvedValue({ count: 2 })
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/product/ZmQ2']}>
        <CartProvider>
          <Header />
          <Routes>
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    )
    await screen.findByRole('heading', { name: 'Pixel 7a' })

    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    await waitFor(() => {
      expect(addToCartSpy).toHaveBeenCalledWith(
        {
          id: 'ZmQ2',
          colorCode: 0,
          storageCode: 1,
        },
        expect.anything() // AbortController signal
      )
    })
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('2')
    })
  })

  it('shows an error message when adding to the cart fails', async () => {
    vi.spyOn(api, 'getProductDetail').mockResolvedValue(mockDetail)
    vi.spyOn(api, 'addToCart').mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/product/ZmQ2']}>
        <CartProvider>
          <Routes>
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    )
    await screen.findByRole('heading', { name: 'Pixel 7a' })

    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error')
    })
  })

  it('shows an error with retry when the product fetch fails', async () => {
    vi.spyOn(api, 'getProductDetail').mockRejectedValue(new Error('Network down'))

    renderDetailPage()

    await screen.findByRole('alert')
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    vi.spyOn(api, 'getProductDetail').mockResolvedValue(mockDetail)

    const { container } = renderDetailPage()
    await screen.findByRole('heading', { name: 'Pixel 7a' })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
