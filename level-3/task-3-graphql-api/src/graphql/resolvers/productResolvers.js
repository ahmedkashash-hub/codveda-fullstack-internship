import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../../services/productService.js';
import { requireRole } from '../../auth/authorization.js';

const productResolvers = {
  Query: {
    product: (_parent, { id }) => getProductById(id),
    products: (_parent, args) => getProducts(args),
  },
  Mutation: {
    createProduct: async (_parent, { input }, context) => {
      requireRole(context, 'USER', 'ADMIN');
      return { product: await createProduct(input) };
    },
    updateProduct: async (_parent, { id, input }, context) => {
      requireRole(context, 'USER', 'ADMIN');
      return { product: await updateProduct(id, input) };
    },
    deleteProduct: (_parent, { id }, context) => {
      requireRole(context, 'ADMIN');
      return deleteProduct(id);
    },
  },
  Product: {
    category: (product, _args, context) =>
      product.category ?? context.loaders.categoryById.load(product.categoryId),
  },
};

export default productResolvers;
