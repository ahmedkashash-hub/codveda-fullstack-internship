import prisma from '../config/prisma.js'
import AppError from '../utils/AppError.js'
import {
  isForeignKeyConstraintError,
  isRecordNotFoundError,
  isUniqueConstraintError,
} from '../utils/prismaErrors.js'
import {
  optionalString,
  requiredString,
  validUuid,
} from '../utils/validation.js'

function serializeCategory(category) {
  const { _count, ...categoryData } = category

  return {
    ...categoryData,
    ...(_count ? { productCount: _count.products } : {}),
  }
}

async function createCategory(input = {}) {
  const name = requiredString(input?.name, 'Name', { min: 2, max: 100 })
  const description = optionalString(input?.description, 'Description', 500)

  try {
    const category = await prisma.category.create({
      data: { name, description },
    })

    return serializeCategory(category)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError('A category with this name already exists', 409)
    }

    throw error
  }
}

async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  })

  return categories.map(serializeCategory)
}

async function updateCategory(id, input = {}) {
  const categoryId = validUuid(id, 'Category ID')
  const data = {}

  if (Object.hasOwn(input || {}, 'name')) {
    data.name = requiredString(input.name, 'Name', { min: 2, max: 100 })
  }

  if (Object.hasOwn(input || {}, 'description')) {
    data.description = optionalString(input.description, 'Description', 500)
  }

  if (Object.keys(data).length === 0) {
    throw new AppError('At least one category field is required', 400)
  }

  try {
    const category = await prisma.category.update({
      where: { id: categoryId },
      data,
    })

    return serializeCategory(category)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError('A category with this name already exists', 409)
    }

    if (isRecordNotFoundError(error)) {
      throw new AppError('Category not found', 404)
    }

    throw error
  }
}

async function deleteCategory(id) {
  const categoryId = validUuid(id, 'Category ID')
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      _count: {
        select: { products: true },
      },
    },
  })

  if (!category) {
    throw new AppError('Category not found', 404)
  }

  if (category._count.products > 0) {
    throw new AppError('Category cannot be deleted while it has products', 409)
  }

  try {
    await prisma.category.delete({ where: { id: categoryId } })
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      throw new AppError('Category cannot be deleted while it has products', 409)
    }

    if (isRecordNotFoundError(error)) {
      throw new AppError('Category not found', 404)
    }

    throw error
  }
}

export { createCategory, deleteCategory, listCategories, updateCategory }
