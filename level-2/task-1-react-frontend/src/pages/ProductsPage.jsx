import { useState } from 'react'
import CategoryFilter from '../components/CategoryFilter.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import SearchBar from '../components/SearchBar.jsx'
import useProducts from '../hooks/useProducts.js'

function ProductsPage() {
  const { products, isLoading, error, refetch } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = [
    'All',
    ...new Set(products.map((product) => product.category)),
  ]
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(normalizedSearchTerm)
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  let productContent

  if (isLoading) {
    productContent = <LoadingState />
  } else if (error) {
    productContent = <ErrorState message={error} onRetry={refetch} />
  } else if (filteredProducts.length === 0) {
    productContent = <EmptyState />
  } else {
    productContent = <ProductGrid products={filteredProducts} />
  }

  return (
    <section className="products-page" aria-labelledby="products-heading">
      <div className="products-page__heading">
        <div>
          <p className="section-label">Browse the collection</p>
          <h2 id="products-heading">Featured products</h2>
        </div>
        {!isLoading && !error && <p>{filteredProducts.length} products</p>}
      </div>
      <div className="product-controls">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>
      {productContent}
    </section>
  )
}

export default ProductsPage
