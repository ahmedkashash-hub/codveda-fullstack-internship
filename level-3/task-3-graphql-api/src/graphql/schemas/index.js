import baseSchema from './baseSchema.js';
import categorySchema from './categorySchema.js';
import productSchema from './productSchema.js';
import mutationSchema from '../mutations/mutationSchema.js';
import authSchema from './authSchema.js';

export default [baseSchema, categorySchema, productSchema, mutationSchema, authSchema];
