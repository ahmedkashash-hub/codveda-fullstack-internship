import {
  createProduct as createProductRecord,
  deleteProduct as deleteProductRecord,
  getProductById as getProductRecordById,
  listProducts as listProductRecords,
  updateProduct as updateProductRecord,
} from '../services/productService.js'

async function createProduct(request, response, next) {
  try {
    const product = await createProductRecord(request.body)
    response.status(201).json({ product })
  } catch (error) {
    next(error)
  }
}

async function getProductById(request, response, next) {
  try {
    const product = await getProductRecordById(request.params.id)
    response.status(200).json({ product })
  } catch (error) {
    next(error)
  }
}

async function listProducts(request, response, next) {
  try {
    const result = await listProductRecords(request.query)
    response.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

async function updateProduct(request, response, next) {
  try {
    const product = await updateProductRecord(request.params.id, request.body)
    response.status(200).json({ product })
  } catch (error) {
    next(error)
  }
}

async function deleteProduct(request, response, next) {
  try {
    await deleteProductRecord(request.params.id)
    response.status(204).send()
  } catch (error) {
    next(error)
  }
}

export {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
}
