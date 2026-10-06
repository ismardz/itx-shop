import './ProductSpecs.css'

export default function ProductSpecs({ product }) {
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
      value: [product.primaryCamera, product.secondaryCamera]
        .filter(Boolean)
        .join(' / '),
    },
    { label: 'Dimensions', value: product.dimentions },
    { label: 'Weight', value: product.weight ? `${product.weight} g` : '' },
  ].filter((spec) => spec.value)

  return (
    <section className="product-specs" aria-label="Product specifications">
      <h2 className="product-specs__title">Description</h2>
      <dl className="product-specs__list">
        {specifications.map((spec) => (
          <div key={spec.label} className="product-specs__row">
            <dt className="product-specs__label">{spec.label}</dt>
            <dd className="product-specs__value">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
