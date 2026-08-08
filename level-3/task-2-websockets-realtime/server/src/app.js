import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createHttpCorsOptions } from './config/cors.js';

const app = express();

app.use(helmet());
app.use(cors(createHttpCorsOptions()));

app.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'websocket-realtime-api',
  });
});

export default app;
