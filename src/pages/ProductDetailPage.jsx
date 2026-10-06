import { Link, useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useProduct.js'
import ProductGallery from '../components/ProductGallery/ProductGallery.jsx'
import ProductSpecs from '../components/ProductSpecs/ProductSpecs.jsx'
import ProductOptions from '../components/ProductOptions/ProductOptions.jsx'
import './ProductDetailPage.css'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { product, isLoading, error, retry } = useProduct(id)

  if (isLoading) {
    return (
      <div className="product-detail-page">
        <div
          className="product-detail-page__skeleton product-detail-page__skeleton--image"
          aria-hidden="true"
        />
        <div className="product-detail-page__skeleton-column" aria-hidden="true">
          <div className="product-detail-page__skeleton product-detail-page__skeleton--line" />
          <div className="product-detail-page__skeleton product-detail-page__skeleton--title" />
          <div className="product-detail-page__skeleton product-detail-page__skeleton--line" />
          <div className="product-detail-page__skeleton product-detail-page__skeleton--line" />
          <div className="product-detail-page__skeleton product-detail-page__skeleton--line" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-page__error" role="alert">
          <p>Something went wrong: {error || 'Product not found'}</p>
          <button type="button" onClick={retry} className="product-detail-page__retry-button">
            Retry
          </button>
        </div>
        <Link to="/" className="product-detail-page__back-link">
          ← Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      <Link to="/" className="product-detail-page__back-link">
        ← Back to products
      </Link>

      <div className="product-detail-page__columns">
        <div className="product-detail-page__image-column">
          <ProductGallery product={product} />
        </div>

        <div className="product-detail-page__details-column">
          <p className="product-detail-page__brand">{product.brand}</p>
          <h1 className="product-detail-page__model">{product.model}</h1>
          <p className="product-detail-page__price">{product.price} €</p>

          <ProductOptions product={product} />
          <ProductSpecs product={product} />
        </div>
      </div>
    </div>
  )
}
