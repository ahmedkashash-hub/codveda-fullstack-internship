import baseResolvers from './baseResolvers.js';
import categoryResolvers from './categoryResolvers.js';
import productResolvers from './productResolvers.js';
import authResolvers from './authResolvers.js';

export default {
  Query: {
    ...baseResolvers.Query,
    ...categoryResolvers.Query,
    ...productResolvers.Query,
    ...authResolvers.Query,
  },
  Mutation: {
    ...categoryResolvers.Mutation,
    ...productResolvers.Mutation,
    ...authResolvers.Mutation,
  },
  Category: categoryResolvers.Category,
  Product: productResolvers.Product,
};
