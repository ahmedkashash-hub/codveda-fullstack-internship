import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from '../../services/categoryService.js';
import { requireRole } from '../../auth/authorization.js';

const categoryResolvers = {
  Query: {
    category: (_parent, { id }) => getCategoryById(id),
    categories: () => getCategories(),
  },
  Mutation: {
    createCategory: async (_parent, { input }, context) => {
      requireRole(context, 'ADMIN');
      return { category: await createCategory(input) };
    },
    updateCategory: async (_parent, { id, input }, context) => {
      requireRole(context, 'ADMIN');
      return { category: await updateCategory(id, input) };
    },
    deleteCategory: (_parent, { id }, context) => {
      requireRole(context, 'ADMIN');
      return deleteCategory(id);
    },
  },
  Category: {
    products: (category, _args, context) =>
      category.products ?? context.loaders.productsByCategoryId.load(category.id),
  },
};

export default categoryResolvers;
