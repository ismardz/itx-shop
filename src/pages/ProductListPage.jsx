import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../services/api.js'
import SearchBar from '../components/SearchBar/SearchBar.jsx'
import ProductCard from '../components/ProductCard/ProductCard.jsx'
import './ProductListPage.css'

export default function ProductListPage() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isSubscribed = true

    getProducts()
      .then((data) => {
        if (isSubscribed) {
          setProducts(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setError(err.message)
          setIsLoading(false)
        }
      })

    return () => {
      isSubscribed = false
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()
    if (!normalizedTerm) return products
    return products.filter(
      (product) =>
        product.brand.toLowerCase().includes(normalizedTerm) ||
        product.model.toLowerCase().includes(normalizedTerm)
    )
  }, [products, searchTerm])

  if (isLoading) {
    return (
      <div className="product-list-page">
        <p className="product-list-page__status">Loading products…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-list-page">
        <p className="product-list-page__status product-list-page__status--error">
          Something went wrong: {error}
        </p>
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
