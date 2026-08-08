import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import corsOptions from './config/cors.js';
import prisma from './config/prisma.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));

app.get('/health', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    response.status(200).json({
      status: 'ok',
      service: 'level-3-fullstack-api',
      database: 'postgresql',
    });
  } catch {
    response.status(503).json({
      status: 'error',
      service: 'level-3-fullstack-api',
      database: 'unavailable',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

export default app;
