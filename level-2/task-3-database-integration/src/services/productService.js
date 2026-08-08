import { Prisma } from '@prisma/client'
import prisma from '../config/prisma.js'
import AppError from '../utils/AppError.js'
import {
  isRecordNotFoundError,
  isUniqueConstraintError,
} from '../utils/prismaErrors.js'
import {
  optionalString,
  requiredString,
  validUuid,
} from '../utils/validation.js'

const PRICE_PATTERN = /^(0|[1-9]\d{0,9})(\.\d{1,2})?$/
const SORT_FIELDS = new Set(['name', 'price', 'stock', 'createdAt'])
const SORT_ORDERS = new Set(['asc', 'desc'])
const MAX_PAGE_SIZE = 100
const categorySummary = {
  select: {
    id: true,
    name: true,
  },
}

function validatePrice(value) {
  if (typeof value !== 'string' || !PRICE_PATTERN.test(value.trim())) {
    throw new AppError(
      'Price must be a non-negative decimal string with up to 2 decimal places',
      400,
    )
  }

  return new Prisma.Decimal(value.trim())
}

function parsePositiveInteger(value, fieldName, defaultValue) {
  if (value === undefined) {
    return defaultValue
  }

  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new AppError(`${fieldName} must be a positive integer`, 400)
  }

  const parsedValue = Number(value)

  if (!Number.isSafeInteger(parsedValue)) {
    throw new AppError(`${fieldName} is too large`, 400)
  }

  return parsedValue
}

function parseListQuery(query = {}) {
  const page = parsePositiveInteger(query.page, 'page', 1)
  const limit = parsePositiveInteger(query.limit, 'limit', 10)

  if (limit > MAX_PAGE_SIZE) {
    throw new AppError(`limit must not exceed ${MAX_PAGE_SIZE}`, 400)
  }

  let search
  if (query.search !== undefined) {
    search = requiredString(query.search, 'search', { min: 1, max: 120 })
  }

  const categoryId =
    query.categoryId === undefined
      ? undefined
      : validUuid(query.categoryId, 'categoryId')

  let isActive
  if (query.isActive !== undefined) {
    if (query.isActive !== 'true' && query.isActive !== 'false') {
      throw new AppError('isActive must be either true or false', 400)
    }

    isActive = query.isActive === 'true'
  }

  const sortBy = query.sortBy ?? 'createdAt'
  const sortOrder = query.sortOrder ?? 'desc'

  if (typeof sortBy !== 'string' || !SORT_FIELDS.has(sortBy)) {
    throw new AppError('Invalid sortBy value', 400)
  }

  if (typeof sortOrder !== 'string' || !SORT_ORDERS.has(sortOrder)) {
    throw new AppError('Invalid sortOrder value', 400)
  }

  return { page, limit, search, categoryId, isActive, sortBy, sortOrder }
}

function validateStock(value) {
  if (value === undefined) {
    return undefined
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new AppError('Stock must be a non-negative integer', 400)
  }

  return value
}

function validateIsActive(value) {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'boolean') {
    throw new AppError('isActive must be a boolean', 400)
  }

  return value
}

function serializeProduct(product) {
  return {
    ...product,
    price: product.price.toFixed(2),
  }
}

async function createProduct(input = {}) {
  const name = requiredString(input?.name, 'Name', { min: 2, max: 120 })
  const description = optionalString(input?.description, 'Description', 1000)
  const sku = requiredString(input?.sku, 'SKU', { min: 2, max: 64 }).toUpperCase()
  const price = validatePrice(input?.price)
  const stock = validateStock(input?.stock)
  const isActive = validateIsActive(input?.isActive)
  const categoryId = validUuid(input?.categoryId, 'categoryId')

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  })

  if (!category) {
    throw new AppError('Category not found', 404)
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        price,
        ...(stock !== undefined ? { stock } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        categoryId,
      },
      include: { category: categorySummary },
    })

    return serializeProduct(product)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError('A product with this SKU already exists', 409)
    }

    throw error
  }
}

async function getProductById(id) {
  const productId = validUuid(id, 'Product ID')
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: categorySummary },
  })

  if (!product) {
    throw new AppError('Product not found', 404)
  }

  return serializeProduct(product)
}

async function listProducts(query = {}) {
  const { page, limit, search, categoryId, isActive, sortBy, sortOrder } =
    parseListQuery(query)
  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  }

  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ [sortBy]: sortOrder }, { id: 'asc' }],
      include: { category: categorySummary },
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products.map(serializeProduct),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  }
}

async function updateProduct(id, input = {}) {
  const productId = validUuid(id, 'Product ID')
  const data = {}

  if (Object.hasOwn(input || {}, 'name')) {
    data.name = requiredString(input.name, 'Name', { min: 2, max: 120 })
  }

  if (Object.hasOwn(input || {}, 'description')) {
    data.description = optionalString(input.description, 'Description', 1000)
  }

  if (Object.hasOwn(input || {}, 'sku')) {
    data.sku = requiredString(input.sku, 'SKU', { min: 2, max: 64 }).toUpperCase()
  }

  if (Object.hasOwn(input || {}, 'price')) {
    data.price = validatePrice(input.price)
  }

  if (Object.hasOwn(input || {}, 'stock')) {
    data.stock = validateStock(input.stock)
  }

  if (Object.hasOwn(input || {}, 'isActive')) {
    data.isActive = validateIsActive(input.isActive)
  }

  if (Object.hasOwn(input || {}, 'categoryId')) {
    data.categoryId = validUuid(input.categoryId, 'categoryId')

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    })

    if (!category) {
      throw new AppError('Category not found', 404)
    }
  }

  if (Object.keys(data).length === 0) {
    throw new AppError('At least one product field is required', 400)
  }

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data,
      include: { category: categorySummary },
    })

    return serializeProduct(product)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError('A product with this SKU already exists', 409)
    }

    if (isRecordNotFoundError(error)) {
      throw new AppError('Product not found', 404)
    }

    throw error
  }
}

async function deleteProduct(id) {
  const productId = validUuid(id, 'Product ID')

  try {
    await prisma.product.delete({ where: { id: productId } })
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      throw new AppError('Product not found', 404)
    }

    throw error
  }
}

export {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
}
