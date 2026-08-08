import { GraphQLError } from 'graphql';

export const badUserInput = (message) =>
  new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT' },
  });

export const databaseReadError = () =>
  new GraphQLError('Unable to complete the database read.', {
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  });

export const notFound = (resource) =>
  new GraphQLError(`${resource} was not found.`, {
    extensions: { code: 'NOT_FOUND' },
  });

export const conflict = (message) =>
  new GraphQLError(message, {
    extensions: { code: 'CONFLICT' },
  });

export const databaseWriteError = () =>
  new GraphQLError('Unable to complete the database write.', {
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  });

export const isGraphQLError = (error) => error instanceof GraphQLError;

export const unauthenticated = (message = 'Authentication is required.') =>
  new GraphQLError(message, {
    extensions: { code: 'UNAUTHENTICATED' },
  });

export const forbidden = () =>
  new GraphQLError('You do not have permission to perform this operation.', {
    extensions: { code: 'FORBIDDEN' },
  });
