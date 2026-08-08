import { Router } from 'express'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../controllers/categoryController.js'

const categoryRouter = Router()

categoryRouter.route('/').post(createCategory).get(listCategories)
categoryRouter
  .route('/:id')
  .patch(updateCategory)
  .delete(deleteCategory)

export default categoryRouter
