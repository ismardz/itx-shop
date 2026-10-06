# ITX Shop — Front End Test

A mini SPA for browsing and buying mobile phones, built with **React 18 + Vite** (JavaScript / ES6, no TypeScript) and **React Router** for client-side routing.

## Features

- **Product List Page (PLP)**
  - Shows all products returned by the API.
  - Real-time search filtering by **brand** and **model**.
  - Responsive grid with a maximum of 4 products per row (4 → 3 → 2 → 1 columns depending on viewport).
  - Clicking a product navigates to its detail page.
- **Product Detail Page (PDP)**
  - Two-column layout: product image on the left, details and actions on the right.
  - Full specification list (CPU, RAM, OS, screen resolution, battery, cameras, dimensions, weight…).
  - **Storage** and **Color** selectors (pre-selected when only one option exists).
  - "Add to cart" button that posts the product id, color code and storage code to the API.
  - Link to navigate back to the product list.
- **Header**
  - App title acts as a link to the main view.
  - Breadcrumbs showing the current page with navigation links.
  - Cart item counter, visible on every view and persisted in `localStorage`.
- **Client-side cache**
  - Every API response is cached in memory with a **1 hour expiration**; once expired, the data is revalidated against the API.
  - Cart additions are never cached (always hit the API).

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
```

## Scripts

| Script           | Description                              |
| ---------------- | ---------------------------------------- |
| `npm start`      | Development server with hot reload       |
| `npm run build`  | Production build (output in `dist/`)     |
| `npm test`       | Run unit tests once                      |
| `npm run test:watch` | Run tests in watch mode              |
| `npm run lint`   | Check code style with ESLint             |

## Project structure

```
src/
├── components/
│   ├── Header/          # App title (links home), breadcrumbs, cart count
│   ├── SearchBar/       # Real-time search input (brand + model)
│   └── ProductCard/     # List item: image, brand, model, price
├── context/
│   └── CartContext.jsx  # Cart count state, persisted via localStorage
├── pages/
│   ├── ProductListPage.jsx   # PLP: grid + filtering
│   └── ProductDetailPage.jsx # PDP: image | details + actions
├── services/
│   ├── api.js          # API integration + 1h client cache
│   └── cartStorage.js  # Cart count persistence (localStorage)
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

## Notes

- The app is a pure SPA: all routing happens client-side via `react-router-dom`, no SSR.
- The cache lives in memory (`Map`) and is intentionally simple; entries expire after 1 hour and are re-fetched on the next request.
- Tests cover the API layer (including cache TTL behavior), cart persistence, real-time search filtering, and the add-to-cart flow with header count updates.
