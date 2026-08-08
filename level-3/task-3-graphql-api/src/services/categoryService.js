import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import {
  badUserInput,
  conflict,
  databaseReadError,
  databaseWriteError,
  isGraphQLError,
  notFound,
} from '../utils/graphqlErrors.js';
import { normalizeCategory } from '../utils/catalogNormalization.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const assertUuid = (value, argumentName = 'id') => {
  if (!UUID_PATTERN.test(value)) {
    throw badUserInput(`${argumentName} must be a valid UUID.`);
  }
};

const safelyRead = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error && error.extensions?.code === 'BAD_USER_INPUT') throw error;
    throw databaseReadError();
  }
};

const normalizeDescription = (value) => {
  if (value === null) return null;
  const description = value.trim();
  return description === '' ? null : description;
};

const validateName = (value) => {
  if (typeof value !== 'string') throw badUserInput('name must be a string.');
  const name = value.trim();
  if (name.length < 2 || name.length > 100) {
    throw badUserInput('name must contain between 2 and 100 characters.');
  }
  return name;
};

const validateDescription = (value) => {
  if (value !== null && typeof value !== 'string') {
    throw badUserInput('description must be a string or null.');
  }
  const description = normalizeDescription(value);
  if (description && description.length > 500) {
    throw badUserInput('description cannot exceed 500 characters.');
  }
  return description;
};

const normalizeCategoryInput = (input, { partial = false } = {}) => {
  if (partial && Object.keys(input).length === 0) {
    throw badUserInput('At least one category field must be supplied.');
  }

  const data = {};
  if (!partial || Object.hasOwn(input, 'name')) data.name = validateName(input.name);
  if (Object.hasOwn(input, 'description')) data.description = validateDescription(input.description);
  return data;
};

const safelyWrite = async (operation, { uniqueMessage, notFoundResource, restrictMessage } = {}) => {
  try {
    return await operation();
  } catch (error) {
    if (isGraphQLError(error)) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002' && uniqueMessage) throw conflict(uniqueMessage);
      if (error.code === 'P2025' && notFoundResource) throw notFound(notFoundResource);
      if (error.code === 'P2003' && restrictMessage) throw conflict(restrictMessage);
    }
    throw databaseWriteError();
  }
};

export const getCategories = () =>
  safelyRead(async () => {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return categories.map(normalizeCategory);
  });

export const getCategoryById = (id) => {
  assertUuid(id);
  return safelyRead(async () =>
    normalizeCategory(
      await prisma.category.findUnique({
        where: { id },
      }),
    ),
  );
};

export const createCategory = (input) => {
  const data = normalizeCategoryInput(input);
  return safelyWrite(
    async () => normalizeCategory(await prisma.category.create({ data, include: { products: true } })),
    { uniqueMessage: 'A category with this name already exists.' },
  );
};

export const updateCategory = (id, input) => {
  assertUuid(id);
  const data = normalizeCategoryInput(input, { partial: true });
  return safelyWrite(
    async () =>
      normalizeCategory(
        await prisma.category.update({
          where: { id },
          data,
          include: { products: { orderBy: { name: 'asc' } } },
        }),
      ),
    {
      uniqueMessage: 'A category with this name already exists.',
      notFoundResource: 'Category',
    },
  );
};

export const deleteCategory = (id) => {
  assertUuid(id);
  return safelyWrite(
    async () => {
      const existing = await prisma.category.findUnique({
        where: { id },
        select: { id: true, _count: { select: { products: true } } },
      });
      if (!existing) throw notFound('Category');
      if (existing._count.products > 0) {
        throw conflict('Category cannot be deleted while products reference it.');
      }
      await prisma.category.delete({ where: { id } });
      return { success: true, id };
    },
    {
      notFoundResource: 'Category',
      restrictMessage: 'Category cannot be deleted while products reference it.',
    },
  );
};
