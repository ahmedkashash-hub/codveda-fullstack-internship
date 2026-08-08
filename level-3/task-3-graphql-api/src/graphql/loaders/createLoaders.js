import DataLoader from 'dataloader';
import prisma from '../../config/prisma.js';
import { databaseReadError } from '../../utils/graphqlErrors.js';
import { normalizeCategory, normalizeProduct } from '../../utils/catalogNormalization.js';

export const createLoaders = ({ client = prisma, onBatch } = {}) => {
  const categoryById = new DataLoader(async (categoryIds) => {
    onBatch?.('categoryById', categoryIds);
    try {
      const categories = await client.category.findMany({
        where: { id: { in: [...categoryIds] } },
      });
      const byId = new Map(categories.map((category) => [category.id, normalizeCategory(category)]));
      return categoryIds.map((id) => byId.get(id) ?? null);
    } catch {
      throw databaseReadError();
    }
  });

  const productsByCategoryId = new DataLoader(async (categoryIds) => {
    onBatch?.('productsByCategoryId', categoryIds);
    try {
      const products = await client.product.findMany({
        where: { categoryId: { in: [...categoryIds] } },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      });
      const grouped = new Map(categoryIds.map((id) => [id, []]));
      for (const product of products) grouped.get(product.categoryId)?.push(normalizeProduct(product));
      return categoryIds.map((id) => grouped.get(id) ?? []);
    } catch {
      throw databaseReadError();
    }
  });

  return { categoryById, productsByCategoryId };
};
