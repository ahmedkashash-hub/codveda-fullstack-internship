const getClientOrigin = () => {
  const clientOrigin = process.env.CLIENT_ORIGIN;

  if (!clientOrigin) {
    throw new Error('CLIENT_ORIGIN is required');
  }

  return clientOrigin;
};

export const createHttpCorsOptions = () => ({
  origin: getClientOrigin(),
  methods: ['GET'],
});

export const createSocketCorsOptions = () => ({
  origin: getClientOrigin(),
  methods: ['GET', 'POST'],
});

export { getClientOrigin };
