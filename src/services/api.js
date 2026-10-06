const API_BASE_URL = 'https://itx-frontend-test.onrender.com'

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

/**
 * Client-side cache with 1 hour expiration, persisted in localStorage
 * so it survives page reloads.
 *
 * Structure in localStorage:
 *   { [key]: { data, timestamp } }
 *
 * Features:
 * - Entries expire after 1 hour and are revalidated on the next request.
 * - In-flight requests are deduplicated: concurrent callers share the
 *   same promise instead of hitting the API twice.
 * - Supports AbortController signals for cancellation.
 */
const memoryCache = new Map()
const inflightRequests = new Map()

function isStorageAvailable() {
  try {
    const testKey = '__itx_cache_test__'
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

function readPersistentCache() {
  if (!isStorageAvailable()) return {}
  try {
    return JSON.parse(localStorage.getItem('itx_api_cache') ?? '{}')
  } catch {
    // Corrupted cache: discard it
    try {
      localStorage.removeItem('itx_api_cache')
    } catch {
      // ignore
    }
    return {}
  }
}

function writePersistentCache(cache) {
  if (!isStorageAvailable()) return
  try {
    localStorage.setItem('itx_api_cache', JSON.stringify(cache))
  } catch {
    // Storage full or unavailable: cache stays in memory only
  }
}

function getCached(key) {
  // Memory cache first (faster, survives within the session)
  const memoryEntry = memoryCache.get(key)
  if (memoryEntry) {
    if (Date.now() - memoryEntry.timestamp > CACHE_TTL_MS) {
      memoryCache.delete(key)
    } else {
      return memoryEntry.data
    }
  }

  // Then localStorage (survives reloads)
  const persistentCache = readPersistentCache()
  const entry = persistentCache[key]
  if (entry) {
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      delete persistentCache[key]
      writePersistentCache(persistentCache)
    } else {
      // Promote to memory cache
      memoryCache.set(key, entry)
      return entry.data
    }
  }

  return null
}

function setCached(key, data) {
  const entry = { data, timestamp: Date.now() }
  memoryCache.set(key, entry)
  const persistentCache = readPersistentCache()
  persistentCache[key] = entry
  writePersistentCache(persistentCache)
}

/**
 * Clears the cache (memory + localStorage). Useful for tests and
 * manual refresh scenarios.
 * @param {object} [options]
 * @param {boolean} [options.keepPersistent] - Keep the localStorage copy
 *   (used to simulate a page reload in tests).
 */
export function clearCache({ keepPersistent } = {}) {
  memoryCache.clear()
  inflightRequests.clear()
  if (!keepPersistent) {
    try {
      localStorage.removeItem('itx_api_cache')
    } catch {
      // ignore
    }
  }
}

async function request(path, { signal, ...fetchOptions } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    signal,
  })
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Fetches data for a cache key with:
 * - 1h TTL cache (memory + localStorage)
 * - in-flight promise deduplication
 * - AbortController support
 */
async function cachedRequest(cacheKey, path, signal) {
  const cached = getCached(cacheKey)
  if (cached) return cached

  // Calls with a signal get their own request (abort semantics are
  // per-caller). Only signal-less calls share the in-flight promise,
  // so an aborted request can never be handed to another caller.
  if (!signal && inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey)
  }

  const promise = request(path, { signal })
    .then((data) => {
      setCached(cacheKey, data)
      return data
    })
    .finally(() => {
      if (!signal) {
        inflightRequests.delete(cacheKey)
      }
    })

  if (!signal) {
    inflightRequests.set(cacheKey, promise)
  }
  return promise
}

/**
 * GET /api/product
 * Returns the full product list (cached for 1 hour).
 */
export async function getProducts(signal) {
  return cachedRequest('products', '/api/product', signal)
}

/**
 * GET /api/product/:id
 * Returns the details of a single product (cached for 1 hour).
 */
export async function getProductDetail(id, signal) {
  return cachedRequest(`product:${id}`, `/api/product/${id}`, signal)
}

/**
 * POST /api/cart
 * Adds a product to the cart. Not cached: always hits the API and
 * returns the current cart item count.
 */
export async function addToCart({ id, colorCode, storageCode }, signal) {
  return request('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, colorCode, storageCode }),
    signal,
  })
}
