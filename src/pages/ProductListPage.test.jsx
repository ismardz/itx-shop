import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProductListPage from './ProductListPage.jsx'
import * as api from '../services/api.js'

const mockProducts = [
  { id: '1', brand: 'Google', model: 'Pixel 7a', price: 509, imgUrl: 'pixel.jpg' },
  { id: '2', brand: 'Apple', model: 'iPhone 15', price: 979, imgUrl: 'iphone.jpg' },
  { id: '3', brand: 'Samsung', model: 'Galaxy S23', price: 859, imgUrl: 'galaxy.jpg' },
]

function renderListPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <ProductListPage />
    </MemoryRouter>
  )
}

describe('ProductListPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a loading state while fetching products', () => {
    vi.spyOn(api, 'getProducts').mockReturnValue(new Promise(() => {}))

    renderListPage()

    expect(screen.getByText(/loading products/i)).toBeInTheDocument()
  })

  it('renders all products returned by the API', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue(mockProducts)

    renderListPage()

    await waitFor(() => {
      expect(screen.getAllByTestId('product-card')).toHaveLength(3)
    })
    expect(screen.getByText('Pixel 7a')).toBeInTheDocument()
    expect(screen.getByText('iPhone 15')).toBeInTheDocument()
    expect(screen.getByText('Galaxy S23')).toBeInTheDocument()
  })

  it('filters products in real time by brand', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue(mockProducts)
    const user = userEvent.setup()

    renderListPage()
    await screen.findByText('Pixel 7a')

    await user.type(screen.getByLabelText(/search products/i), 'google')

    await waitFor(() => {
      expect(screen.getAllByTestId('product-card')).toHaveLength(1)
    })
    expect(screen.getByText('Pixel 7a')).toBeInTheDocument()
    expect(screen.queryByText('iPhone 15')).not.toBeInTheDocument()
  })

  it('filters products in real time by model', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue(mockProducts)
    const user = userEvent.setup()

    renderListPage()
    await screen.findByText('Pixel 7a')

    await user.type(screen.getByLabelText(/search products/i), 'galaxy')

    await waitFor(() => {
      expect(screen.getAllByTestId('product-card')).toHaveLength(1)
    })
    expect(screen.getByText('Galaxy S23')).toBeInTheDocument()
  })

  it('shows an empty state when no product matches the search', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue(mockProducts)
    const user = userEvent.setup()

    renderListPage()
    await screen.findByText('Pixel 7a')

    await user.type(screen.getByLabelText(/search products/i), 'nokia')

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
  })

  it('links each product card to its detail page', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue(mockProducts)

    renderListPage()
    await screen.findByText('Pixel 7a')

    const card = screen.getAllByTestId('product-card')[0]
    expect(card).toHaveAttribute('href', '/product/1')
  })
})
