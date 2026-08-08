import axios from 'axios'

const PRODUCTS_URL = 'https://fakestoreapi.com/products'

function normalizeProduct(product) {
  if (
    !product ||
    typeof product.id !== 'number' ||
    typeof product.title !== 'string' ||
    typeof product.description !== 'string' ||
    typeof product.category !== 'string' ||
    typeof product.price !== 'number' ||
    typeof product.image !== 'string'
  ) {
    throw new Error('Invalid product data received')
  }

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    category: product.category,
    price: product.price,
    image: product.image,
    inStock: product.id % 5 !== 0,
  }
}

export async function getProducts() {
  const response = await axios.get(PRODUCTS_URL)

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid products response')
  }

  return response.data.map(normalizeProduct)
}
