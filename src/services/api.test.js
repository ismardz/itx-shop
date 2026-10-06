import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getProducts,
  getProductDetail,
  addToCart,
  clearCache,
} from './api.js'

const mockProducts = [
  { id: 'ZmQ2', brand: 'Google', model: 'Pixel 7a', price: 509 },
  { id: 'MTQ0', brand: 'Apple', model: 'iPhone 15', price: 979 },
]

const mockDetail = {
  id: 'ZmQ2',
  brand: 'Google',
  model: 'Pixel 7a',
  price: 509,
  options: {
    colors: [{ code: 0, name: 'Charcoal' }],
    storages: [{ code: 1, name: '128 GB' }],
  },
}

function mockFetch(body) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  })
}

describe('api service', () => {
  beforeEach(() => {
    clearCache()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches the product list from the API', async () => {
    global.fetch = mockFetch(mockProducts)

    const products = await getProducts()

    expect(products).toEqual(mockProducts)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://itx-frontend-test.onrender.com/api/product',
      { signal: undefined }
    )
  })

  it('caches the product list and does not call the API twice', async () => {
    global.fetch = mockFetch(mockProducts)

    await getProducts()
    await getProducts()

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('deduplicates concurrent in-flight requests', async () => {
    let resolveFetch
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        })
    )

    const first = getProducts()
    const second = getProducts()

    resolveFetch({ ok: true, json: () => Promise.resolve(mockProducts) })

    const [resultA, resultB] = await Promise.all([first, second])

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(resultB).toEqual(resultA)
  })

  it('revalidates the product list after the 1 hour cache expiration', async () => {
    vi.useFakeTimers()
    global.fetch = mockFetch(mockProducts)

    await getProducts()
    // Advance beyond the 1 hour TTL
    vi.advanceTimersByTime(60 * 60 * 1000 + 1)
    await getProducts()

    expect(global.fetch).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })

  it('persists the cache in localStorage and survives a module reload', async () => {
    global.fetch = mockFetch(mockProducts)
    await getProducts()

    const stored = JSON.parse(localStorage.getItem('itx_api_cache'))
    expect(stored.products.data).toEqual(mockProducts)
    expect(typeof stored.products.timestamp).toBe('number')
  })

  it('serves from localStorage after memory cache is cleared (reload simulation)', async () => {
    global.fetch = mockFetch(mockProducts)
    await getProducts()

    // Simulate reload: memory cache is empty but localStorage persists
    clearCache({ keepPersistent: true })
    global.fetch = mockFetch(mockProducts)

    const products = await getProducts()
    expect(products).toEqual(mockProducts)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('fetches a product detail by id and caches it', async () => {
    global.fetch = mockFetch(mockDetail)

    const detail = await getProductDetail('ZmQ2')
    const detailAgain = await getProductDetail('ZmQ2')

    expect(detail).toEqual(mockDetail)
    expect(detailAgain).toEqual(mockDetail)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://itx-frontend-test.onrender.com/api/product/ZmQ2',
      { signal: undefined }
    )
  })

  it('forwards the AbortController signal to fetch', async () => {
    global.fetch = mockFetch(mockProducts)
    const abortController = new AbortController()

    await getProducts(abortController.signal)

    expect(global.fetch).toHaveBeenCalledWith(
      'https://itx-frontend-test.onrender.com/api/product',
      { signal: abortController.signal }
    )
  })

  it('posts to the cart and returns the item count (never cached)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 3 }),
    })

    const response = await addToCart({
      id: 'ZmQ2',
      colorCode: 0,
      storageCode: 1,
    })

    expect(response).toEqual({ count: 3 })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://itx-frontend-test.onrender.com/api/cart',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'ZmQ2', colorCode: 0, storageCode: 1 }),
        signal: undefined,
      }
    )
  })

  it('throws when the API responds with an error status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(getProductDetail('bad-id')).rejects.toThrow('API error 500')
  })
})
