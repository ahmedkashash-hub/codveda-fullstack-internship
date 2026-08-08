import { authenticateRequest } from './authenticateRequest.js';
import { createLoaders } from '../graphql/loaders/createLoaders.js';

export const createGraphQLContext = async (request, { loaderOptions } = {}) => ({
  auth: authenticateRequest(request),
  loaders: createLoaders(loaderOptions),
});
