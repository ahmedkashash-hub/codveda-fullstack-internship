const clientOrigin = process.env.CLIENT_ORIGIN;

const corsOptions = {
  origin(origin, callback) {
    if (!origin || (clientOrigin && origin === clientOrigin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default corsOptions;
