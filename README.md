# ITX Shop — Front End Test

A mini SPA for browsing and buying mobile phones, built with **React 18 + Vite** (JavaScript / ES6, no TypeScript) and **React Router** for client-side routing.

## Features

- **Product List Page (PLP)**
  - Shows all products returned by the API.
  - Real-time search filtering by **brand** and **model**, debounced (250 ms) to avoid re-filtering on every keystroke.
  - Responsive grid with a maximum of 4 products per row (4 → 3 → 2 → 1 columns depending on viewport).
  - Shimmer loading skeletons while fetching.
  - Clicking a product navigates to its detail page.
- **Product Detail Page (PDP)**
  - Two-column layout: product image on the left, details and actions on the right.
  - Full specification list (CPU, RAM, OS, screen resolution, battery, cameras, dimensions, weight…).
  - **Storage** and **Color** selectors. The **first option of each selector is pre-selected** when the product loads (this also covers the single-option case).
  - "Add to cart" button that posts the product id, color code and storage code to the API.
  - Link to navigate back to the product list.
- **Header**
  - App title acts as a link to the main view.
  - Breadcrumbs showing the current page with navigation links.
  - Cart item counter, visible on every view and persisted in `localStorage`.
- **Client-side cache** (see [Cache design](#cache-design))
  - 1 hour expiration, persisted in `localStorage` so it survives page reloads.
  - In-flight request deduplication and `AbortController` support.
- **Robustness**
  - 404 page for unknown routes.
  - Error boundary wrapping the whole app.
  - Network error feedback with a **Retry** button on both pages.
  - All `localStorage` access is guarded with try/catch (private browsing / full storage must not crash the app).

## Requirements

- Node.js 18+ (or [Bun](https://bun.sh) 1.x)

## Getting started

```bash
# Install dependencies
npm install        # or: bun install

# Start the app in development mode (http://localhost:3000)
npm start          # or: bun start

# Create a production build in /dist
npm run build

# Run the test suite (Vitest + Testing Library)
npm test

# Run the linter (ESLint flat config)
npm run lint

# Run the E2E tests (Playwright, requires the dev server or `npm start` in another terminal)
npm run test:e2e
```

## Scripts

| Script               | Description                                    |
| -------------------- | ---------------------------------------------- |
| `npm start`          | Development server with hot reload             |
| `npm run build`      | Production build (output in `dist/`)           |
| `npm test`           | Run unit tests once                            |
| `npm run test:watch` | Run tests in watch mode                        |
| `npm run test:e2e`   | Run Playwright end-to-end tests                |
| `npm run lint`       | Check code style with ESLint                   |

## Project structure

```
src/
├── components/
│   ├── ErrorBoundary/   # Catches render errors, shows fallback UI
│   ├── Header/          # App title (links home), breadcrumbs, cart count
│   ├── ProductCard/     # List item: image, brand, model, price
│   ├── ProductGallery/  # PDP image column
│   ├── ProductOptions/  # PDP storage/color selectors + add to cart
│   ├── ProductSpecs/    # PDP specification list
│   └── SearchBar/       # Real-time search input (brand + model)
├── context/
│   └── CartContext.jsx  # Cart count state, persisted via localStorage
├── hooks/
│   ├── useAddToCart.js       # Add-to-cart action with feedback
│   ├── useDebouncedValue.js  # Debounce helper for search
│   ├── useProduct.js         # Single product fetch (abort + retry)
│   └── useProducts.js        # Product list fetch (abort + retry)
├── pages/
│   ├── NotFoundPage.jsx      # 404 route
│   ├── ProductDetailPage.jsx # PDP: image | details + actions
│   └── ProductListPage.jsx   # PLP: grid + filtering
├── services/
│   ├── api.js          # API integration + 1h client cache
│   └── cartStorage.js  # Cart count persistence (localStorage, guarded)
└── test/
    └── setup.js        # Vitest + jest-dom setup
```

## API integration

Base URL: `https://itx-frontend-test.onrender.com`

| Endpoint             | Method | Usage                                    |
| -------------------- | ------ | ---------------------------------------- |
| `/api/product`       | GET    | Product list (cached 1h)                 |
| `/api/product/:id`   | GET    | Product detail (cached 1h)               |
| `/api/cart`          | POST   | Add to cart → returns `{ count }`        |

The `POST /api/cart` body sends `{ id, colorCode, storageCode }`; the returned `count` is persisted in `localStorage` and displayed in the header on every view.

## Cache design

The cache is intentionally a small hand-rolled module (`src/services/api.js`) instead of a data-fetching library:

- **Why not TanStack Query / SWR?** The app has exactly two GET endpoints, no mutations cache, no pagination, no background refetching requirements beyond a simple TTL. Adding a library (~13 kB gzipped for TanStack Query) would add a dependency and a provider for behavior that 60 lines already cover: TTL, dedup, cancellation and persistence. If the app grew (pagination, mutations with optimistic updates, invalidation windows), migrating to TanStack Query would be the next step.
- **TTL**: every entry stores a timestamp; entries older than 1 hour are discarded and re-fetched.
- **Persistence**: the cache is mirrored to `localStorage` (`itx_api_cache`), so a reload within the hour does not re-hit the API. Corrupted entries are discarded automatically.
- **Deduplication**: concurrent calls for the same resource share one in-flight promise.
- **Cancellation**: all fetches accept an `AbortController` signal; hooks abort in-flight requests on unmount or id change.
- Cart additions (`POST /api/cart`) are never cached.

## Notes

- The app is a pure SPA: all routing happens client-side via `react-router-dom`, no SSR.
- Unknown routes render a dedicated 404 page; rendering errors are caught by an error boundary.
- Tests cover the API layer (including cache TTL and dedup behavior), cart persistence, real-time search filtering, the add-to-cart flow with header count updates, routing (including 404) and basic accessibility (jest-axe). End-to-end flows are covered with Playwright.
