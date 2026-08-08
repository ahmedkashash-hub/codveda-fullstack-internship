import {
  createCategory as createCategoryRecord,
  deleteCategory as deleteCategoryRecord,
  listCategories as listCategoryRecords,
  updateCategory as updateCategoryRecord,
} from '../services/categoryService.js'

async function createCategory(request, response, next) {
  try {
    const category = await createCategoryRecord(request.body)
    response.status(201).json({ category })
  } catch (error) {
    next(error)
  }
}

async function updateCategory(request, response, next) {
  try {
    const category = await updateCategoryRecord(request.params.id, request.body)
    response.status(200).json({ category })
  } catch (error) {
    next(error)
  }
}

async function deleteCategory(request, response, next) {
  try {
    await deleteCategoryRecord(request.params.id)
    response.status(204).send()
  } catch (error) {
    next(error)
  }
}

async function listCategories(request, response, next) {
  try {
    const categories = await listCategoryRecords()
    response.status(200).json({ categories })
  } catch (error) {
    next(error)
  }
}

export { createCategory, deleteCategory, listCategories, updateCategory }
