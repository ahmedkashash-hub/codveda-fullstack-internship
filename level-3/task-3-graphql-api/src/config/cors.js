const getClientOrigin = () => {
  const clientOrigin = process.env.CLIENT_ORIGIN;

  if (!clientOrigin) {
    throw new Error('CLIENT_ORIGIN is required');
  }

  return clientOrigin;
};

export const createCorsOptions = () => ({
  origin: getClientOrigin(),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
