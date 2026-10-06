import { useEffect, useState } from 'react'
import { useAddToCart } from '../../hooks/useAddToCart.js'
import './ProductOptions.css'

export default function ProductOptions({ product }) {
  const { add, isAdding, error, justAdded } = useAddToCart()

  const [selectedStorage, setSelectedStorage] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)

  // Pre-select the first option of each selector when the product
  // loads or changes (also covers the single-option case)
  useEffect(() => {
    setSelectedStorage(product.options?.storages?.[0] ?? null)
    setSelectedColor(product.options?.colors?.[0] ?? null)
  }, [product])

  function handleAddToCart() {
    if (!selectedStorage || !selectedColor) return
    add({
      id: product.id,
      colorCode: selectedColor.code,
      storageCode: selectedStorage.code,
    })
  }

  return (
    <section className="product-options" aria-label="Product actions">
      <h2 className="product-options__title">Actions</h2>

      <div className="product-options__selectors">
        <label className="product-options__selector">
          <span className="product-options__selector-label">Storage</span>
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

        <label className="product-options__selector">
          <span className="product-options__selector-label">Color</span>
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
        className="product-options__add-button"
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {isAdding ? 'Adding…' : 'Add to cart'}
      </button>

      {justAdded && (
        <p className="product-options__feedback" role="status">
          ✓ Product added to cart
        </p>
      )}
      {error && (
        <p
          className="product-options__feedback product-options__feedback--error"
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  )
}
