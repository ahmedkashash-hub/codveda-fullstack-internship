import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import { assertUuid } from './categoryService.js';
import {
  badUserInput,
  conflict,
  databaseReadError,
  databaseWriteError,
  isGraphQLError,
  notFound,
} from '../utils/graphqlErrors.js';
import { normalizeProduct } from '../utils/catalogNormalization.js';

const safelyRead = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error && error.extensions?.code === 'BAD_USER_INPUT') throw error;
    throw databaseReadError();
  }
};

const validatePagination = ({ page, limit }) => {
  if (!Number.isInteger(page) || page <= 0) throw badUserInput('page must be a positive integer.');
  if (!Number.isInteger(limit) || limit <= 0) throw badUserInput('limit must be a positive integer.');
  if (limit > 100) throw badUserInput('limit cannot exceed 100.');
};

const validateText = (value, { field, min, max }) => {
  if (typeof value !== 'string') throw badUserInput(`${field} must be a string.`);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw badUserInput(`${field} must contain between ${min} and ${max} characters.`);
  }
  return normalized;
};

const validateDescription = (value) => {
  if (value !== null && typeof value !== 'string') {
    throw badUserInput('description must be a string or null.');
  }
  if (value === null) return null;
  const description = value.trim();
  if (description.length > 1000) throw badUserInput('description cannot exceed 1000 characters.');
  return description === '' ? null : description;
};

const validatePrice = (value) => {
  if (typeof value !== 'string' || !/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value.trim())) {
    throw badUserInput('price must be a non-negative decimal string with at most two decimal places and up to ten integer digits.');
  }
  return value.trim();
};

const validateStock = (value) => {
  if (!Number.isInteger(value) || value < 0) {
    throw badUserInput('stock must be a non-negative integer.');
  }
  return value;
};

const validateBoolean = (value) => {
  if (typeof value !== 'boolean') throw badUserInput('isActive must be a Boolean.');
  return value;
};

const normalizeProductInput = (input, { partial = false } = {}) => {
  if (partial && Object.keys(input).length === 0) {
    throw badUserInput('At least one product field must be supplied.');
  }

  const data = {};
  if (!partial || Object.hasOwn(input, 'name')) {
    data.name = validateText(input.name, { field: 'name', min: 2, max: 120 });
  }
  if (Object.hasOwn(input, 'description')) data.description = validateDescription(input.description);
  if (!partial || Object.hasOwn(input, 'sku')) {
    data.sku = validateText(input.sku, { field: 'sku', min: 2, max: 64 }).toUpperCase();
  }
  if (!partial || Object.hasOwn(input, 'price')) data.price = validatePrice(input.price);
  if (Object.hasOwn(input, 'stock')) data.stock = validateStock(input.stock);
  if (Object.hasOwn(input, 'isActive')) data.isActive = validateBoolean(input.isActive);
  if (!partial || Object.hasOwn(input, 'categoryId')) {
    assertUuid(input.categoryId, 'categoryId');
    data.categoryId = input.categoryId;
  }
  return data;
};

const ensureCategoryExists = async (categoryId) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) throw notFound('Category');
};

const safelyWrite = async (operation, { notFoundResource, missingCategory = false } = {}) => {
  try {
    return await operation();
  } catch (error) {
    if (isGraphQLError(error)) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw conflict('A product with this SKU already exists.');
      if (error.code === 'P2025' && notFoundResource) throw notFound(notFoundResource);
      if (error.code === 'P2003' && missingCategory) throw notFound('Category');
    }
    throw databaseWriteError();
  }
};

export const getProductById = (id) => {
  assertUuid(id);
  return safelyRead(async () =>
    normalizeProduct(
      await prisma.product.findUnique({ where: { id } }),
    ),
  );
};

export const getProducts = ({ page, limit, search, categoryId, isActive }) => {
  validatePagination({ page, limit });
  if (categoryId) assertUuid(categoryId, 'categoryId');

  const normalizedSearch = search?.trim();
  const where = {
    ...(categoryId && { categoryId }),
    ...(typeof isActive === 'boolean' && { isActive }),
    ...(normalizedSearch && {
      OR: [
        { name: { contains: normalizedSearch, mode: 'insensitive' } },
        { sku: { contains: normalizedSearch, mode: 'insensitive' } },
      ],
    }),
  };

  return safelyRead(async () => {
    const [nodes, totalItems] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      nodes: nodes.map(normalizeProduct),
      pageInfo: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  });
};

export const createProduct = (input) => {
  const data = normalizeProductInput(input);
  return safelyWrite(
    async () => {
      await ensureCategoryExists(data.categoryId);
      return normalizeProduct(
        await prisma.product.create({ data, include: { category: true } }),
      );
    },
    { missingCategory: true },
  );
};

export const updateProduct = (id, input) => {
  assertUuid(id);
  const data = normalizeProductInput(input, { partial: true });
  return safelyWrite(
    async () => {
      if (data.categoryId) await ensureCategoryExists(data.categoryId);
      return normalizeProduct(
        await prisma.product.update({
          where: { id },
          data,
          include: { category: true },
        }),
      );
    },
    { notFoundResource: 'Product', missingCategory: true },
  );
};

export const deleteProduct = (id) => {
  assertUuid(id);
  return safelyWrite(
    async () => {
      await prisma.product.delete({ where: { id } });
      return { success: true, id };
    },
    { notFoundResource: 'Product' },
  );
};
