import 'dotenv/config';
import app from './app.js';
import prisma from './config/prisma.js';

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

const server = app.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`);
});

let isShuttingDown = false;

const shutDown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  server.close(async (error) => {
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(error ? 1 : 0);
    }
  });
};

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
