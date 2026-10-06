import './ProductGallery.css'

export default function ProductGallery({ product }) {
  return (
    <div className="product-gallery">
      <img
        src={product.imgUrl}
        alt={`${product.brand} ${product.model} front view`}
        className="product-gallery__image"
      />
    </div>
  )
}
