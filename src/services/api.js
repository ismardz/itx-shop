const API_BASE_URL = 'https://itx-frontend-test.onrender.com'

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

/**
 * Simple client-side cache with 1 hour expiration.
 * Every successful API response is stored; once the TTL is exceeded
 * the entry is considered stale and the API is queried again.
 */
const cacheStore = new Map()

function getCached(key) {
  const entry = cacheStore.get(key)
  if (!entry) return null
  const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS
  if (isExpired) {
    cacheStore.delete(key)
    return null
  }
  return entry.data
}

function setCached(key, data) {
  cacheStore.set(key, { data, timestamp: Date.now() })
}

async function request(path, options) {
  const url = `${API_BASE_URL}${path}`
  const response = options ? await fetch(url, options) : await fetch(url)
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Clears the cache. Useful for tests and manual refresh scenarios.
 */
export function clearCache() {
  cacheStore.clear()
}

/**
 * GET /api/product
 * Returns the full product list (cached for 1 hour).
 */
export async function getProducts() {
  const cacheKey = 'products'
  const cached = getCached(cacheKey)
  if (cached) return cached

  const products = await request('/api/product')
  setCached(cacheKey, products)
  return products
}

/**
 * GET /api/product/:id
 * Returns the details of a single product (cached for 1 hour).
 */
export async function getProductDetail(id) {
  const cacheKey = `product:${id}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const product = await request(`/api/product/${id}`)
  setCached(cacheKey, product)
  return product
}

/**
 * POST /api/cart
 * Adds a product to the cart. Not cached: always hits the API and
 * returns the current cart item count.
 */
export async function addToCart({ id, colorCode, storageCode }) {
  return request('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, colorCode, storageCode }),
  })
}
