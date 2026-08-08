import { Router } from 'express'
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from '../controllers/productController.js'

const productRouter = Router()

productRouter.route('/').post(createProduct).get(listProducts)
productRouter
  .route('/:id')
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct)

export default productRouter
