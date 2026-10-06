import { test, expect } from '@playwright/test'

const mockProducts = [
  {
    id: 'ZmQ2',
    brand: 'Google',
    model: 'Pixel 7a',
    price: 509,
    imgUrl: 'https://dummyimage.com/300x300/000/fff&text=Pixel',
  },
  {
    id: 'MTQ0',
    brand: 'Apple',
    model: 'iPhone 15',
    price: 979,
    imgUrl: 'https://dummyimage.com/300/300&text=iPhone',
  },
]

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
  imgUrl: 'https://dummyimage.com/300/300&text=Pixel',
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

// Mock the API before every test so E2E runs are deterministic
test.beforeEach(async ({ page }) => {
  await page.route('**/api/product', async (route) => {
    await route.fulfill({ json: mockProducts })
  })
  await page.route('**/api/product/ZmQ2', async (route) => {
    await route.fulfill({ json: mockDetail })
  })
  await page.route('**/api/cart', async (route) => {
    await route.fulfill({ json: { count: 1 } })
  })
})

test('shows the product list with all products', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Pixel 7a' })).toBeVisible()
  await expect(page.getByText('iPhone 15')).toBeVisible()
  await expect(page.getByTestId('cart-count')).toHaveText('0')
})

test('searches products by brand in real time', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Pixel 7a')).toBeVisible()

  await page.getByLabel(/search products/i).fill('apple')

  await expect(page.getByText('iPhone 15')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pixel 7a' })).toBeHidden()
})

test('navigates to the product detail and shows specs', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId('product-card').first().click()

  await expect(page.getByRole('heading', { name: 'Pixel 7a' })).toBeVisible()
  await expect(page.getByText('Google Tensor G2')).toBeVisible()
  await expect(page.getByRole('link', { name: /back to products/i })).toBeVisible()
})

test('adds a product to the cart and updates the header count', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId('product-card').first().click()
  await expect(page.getByRole('heading', { name: 'Pixel 7a' })).toBeVisible()

  await page.getByRole('button', { name: /add to cart/i }).click()

  await expect(page.getByTestId('cart-count')).toHaveText('1')
  await expect(page.getByText(/product added to cart/i)).toBeVisible()
})

test('renders the 404 page for unknown routes', async ({ page }) => {
  await page.goto('/does-not-exist')

  await expect(page.getByText('404')).toBeVisible()
  await expect(page.getByText('Page not found')).toBeVisible()
})
