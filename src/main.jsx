import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'
import Header from './components/Header/Header.jsx'
import ProductListPage from './pages/ProductListPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <CartProvider>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<ProductListPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </CartProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
