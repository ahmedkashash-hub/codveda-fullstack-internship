function ProductCard({ product }) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price)

  return (
    <article className="product-card">
      <img src={product.image} alt={`${product.title} product`} />
      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product.category}</span>
          <span className={product.inStock ? 'in-stock' : 'out-of-stock'}>
            {product.inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <p className="product-card__price">{formattedPrice}</p>
      </div>
    </article>
  )
}

export default ProductCard
