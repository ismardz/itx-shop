import { Link } from 'react-router-dom'
import './ProductCard.css'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card"
      data-testid="product-card"
    >
      <div className="product-card__image-wrapper">
        <img
          src={product.imgUrl}
          alt={`${product.brand} ${product.model}`}
          className="product-card__image"
          loading="lazy"
        />
      </div>
      <div className="product-card__info">
        <p className="product-card__brand">{product.brand}</p>
        <h3 className="product-card__model">{product.model}</h3>
        <p className="product-card__price">from {product.price} €</p>
      </div>s
    </Link>
  )
}
