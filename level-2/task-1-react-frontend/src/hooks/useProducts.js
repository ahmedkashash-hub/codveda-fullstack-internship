import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService.js'

const LOAD_ERROR_MESSAGE =
  'We could not retrieve the products. Check your connection and try again.'

function useProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function refetch() {
    setIsLoading(true)
    setError('')

    try {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
    } catch {
      setProducts([])
      setError(LOAD_ERROR_MESSAGE)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  return { products, isLoading, error, refetch }
}

export default useProducts
