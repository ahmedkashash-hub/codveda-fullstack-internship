import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';
import { createCorsOptions } from './config/cors.js';
import { createGraphQLContext } from './auth/createGraphQLContext.js';
import resolvers from './graphql/resolvers/index.js';
import typeDefs from './graphql/schemas/index.js';
import { sanitizeGraphQLError } from './utils/sanitizeGraphQLError.js';

const createApp = async ({ loaderOptions } = {}) => {
  const app = express();
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: false,
    formatError: sanitizeGraphQLError,
  });

  await apolloServer.start();

  app.use(cors(createCorsOptions()));
  app.get('/health', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      service: 'graphql-api',
    });
  });
  app.use(
    '/graphql',
    express.json({ limit: '100kb' }),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => createGraphQLContext(req, { loaderOptions }),
    }),
  );

  return { app, apolloServer };
};

export default createApp;
