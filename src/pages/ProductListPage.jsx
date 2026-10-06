import { useMemo, useState } from 'react'
import { useProducts } from '../hooks/useProducts.js'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'
import SearchBar from '../components/SearchBar/SearchBar.jsx'
import ProductCard from '../components/ProductCard/ProductCard.jsx'
import './ProductListPage.css'

export default function ProductListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)

  const { products, isLoading, error, retry } = useProducts()

  const filteredProducts = useMemo(() => {
    const normalizedTerm = debouncedSearchTerm.trim().toLowerCase()
    if (!normalizedTerm) return products
    return products.filter(
      (product) =>
        product.brand.toLowerCase().includes(normalizedTerm) ||
        product.model.toLowerCase().includes(normalizedTerm)
    )
  }, [products, debouncedSearchTerm])

  if (isLoading) {
    return (
      <div className="product-list-page">
        <ul className="product-list-page__grid" aria-hidden="true" data-testid="skeleton-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index} className="product-list-page__item">
              <div className="product-list-page__skeleton-card">
                <div className="product-list-page__skeleton product-list-page__skeleton--image" />
                <div className="product-list-page__skeleton product-detail-page__skeleton--line" />
                <div className="product-list-page__skeleton product-list-page__skeleton--line" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-list-page">
        <div className="product-list-page__error" role="alert">
          <p>Something went wrong: {error}</p>
          <button type="button" onClick={retry} className="product-list-page__retry-button">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="product-list-page">
      <div className="product-list-page__toolbar">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <p className="product-list-page__count">
          {filteredProducts.length}{' '}
          {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="product-list-page__status">
          No products found for “{searchTerm}”.
        </p>
      ) : (
        <ul className="product-list-page__grid">
          {filteredProducts.map((product) => (
            <li key={product.id} className="product-list-page__item">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
