const baseResolvers = {
  Query: {
    health: () => ({
      status: 'ok',
      service: 'graphql-api',
    }),
  },
};

export default baseResolvers;
