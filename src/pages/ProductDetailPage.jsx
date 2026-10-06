import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addToCart, getProductDetail } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'
import './ProductDetailPage.css'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { updateCartCount } = useCart()

  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedStorage, setSelectedStorage] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    let isSubscribed = true
    setIsLoading(true)
    setError(null)

    getProductDetail(id)
      .then((data) => {
        if (!isSubscribed) return
        setProduct(data)
        // Pre-select when only one option exists
        setSelectedStorage(data.options?.storages?.[0] ?? null)
        setSelectedColor(data.options?.colors?.[0] ?? null)
        setIsLoading(false)
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
  }, [id])

  async function handleAddToCart() {
    if (!selectedStorage || !selectedColor) return

    setIsAdding(true)
    setActionError(null)
    setJustAdded(false)

    try {
      const response = await addToCart({
        id: product.id,
        colorCode: selectedColor.code,
        storageCode: selectedStorage.code,
      })
      updateCartCount(response.count)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2500)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setIsAdding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="product-detail-page">
        <p className="product-detail-page__status">Loading product…</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <p className="product-detail-page__status product-detail-page__status--error">
          Something went wrong: {error || 'Product not found'}
        </p>
        <Link to="/" className="product-detail-page__back-link">
          ← Back to products
        </Link>
      </div>
    )
  }

  const specifications = [
    { label: 'Brand', value: product.brand },
    { label: 'Model', value: product.model },
    { label: 'Price', value: `${product.price} €` },
    { label: 'CPU', value: product.cpu },
    { label: 'RAM', value: product.ram },
    { label: 'Operating system', value: product.os },
    { label: 'Screen resolution', value: product.displaySize },
    { label: 'Battery', value: product.battery },
    {
      label: 'Cameras',
      value: [
        product.primaryCamera,
        product.secondaryCamera,
      ]
        .filter(Boolean)
        .join(' / '),
    },
    { label: 'Dimensions', value: product.dimentions },
    { label: 'Weight', value: product.weight ? `${product.weight} g` : '' },
  ].filter((spec) => spec.value)

  return (
    <div className="product-detail-page">
      <Link to="/" className="product-detail-page__back-link">
        ← Back to products
      </Link>

      <div className="product-detail-page__columns">
        <div className="product-detail-page__image-column">
          <img
            src={product.imgUrl}
            alt={`${product.brand} ${product.model}`}
            className="product-detail-page__image"
          />
        </div>

        <div className="product-detail-page__details-column">
          <p className="product-detail-page__brand">{product.brand}</p>
          <h1 className="product-detail-page__model">{product.model}</h1>
          <p className="product-detail-page__price">{product.price} €</p>

          <section className="product-detail-page__section">
            <h2 className="product-detail-page__section-title">Description</h2>
            <dl className="product-detail-page__specs">
              {specifications.map((spec) => (
                  <div
                      key={spec.label}
                      className="product-detail-page__spec-row"
                  >
                    <dt className="product-detail-page__spec-label">
                      {spec.label}
                    </dt>
                    <dd className="product-detail-page__spec-value">
                      {spec.value}
                    </dd>
                  </div>
              ))}
            </dl>
          </section>

          <section className="product-detail-page__section">
            <h2 className="product-detail-page__section-title">Actions</h2>
            <div className="product-detail-page__selectors">
              <label className="product-detail-page__selector">
                <span className="product-detail-page__selector-label">
                  Storage
                </span>
                <select
                  value={selectedStorage?.code ?? ''}
                  onChange={(event) => {
                    const storage = product.options.storages.find(
                      (option) => String(option.code) === event.target.value
                    )
                    setSelectedStorage(storage)
                  }}
                >
                  {product.options?.storages?.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="product-detail-page__selector">
                <span className="product-detail-page__selector-label">
                  Color
                </span>
                <select
                  value={selectedColor?.code ?? ''}
                  onChange={(event) => {
                    const color = product.options.colors.find(
                      (option) => String(option.code) === event.target.value
                    )
                    setSelectedColor(color)
                  }}
                >
                  {product.options?.colors?.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              className="product-detail-page__add-button"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? 'Adding…' : 'Add to cart'}
            </button>

            {justAdded && (
              <p className="product-detail-page__feedback" role="status">
                ✓ Product added to cart
              </p>
            )}
            {actionError && (
              <p
                className="product-detail-page__feedback product-detail-page__feedback--error"
                role="alert"
              >
                {actionError}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
