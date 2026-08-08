import 'dotenv/config';
import { createServer } from 'node:http';
import createApp from './app.js';
import prisma from './config/prisma.js';

const port = process.env.PORT || 3002;
const host = process.env.HOST || '0.0.0.0';
const { app, apolloServer } = await createApp();
const httpServer = createServer(app);

httpServer.listen(port, host, () => {
  console.log(`GraphQL API listening on ${host}:${port}`);
});

let isShuttingDown = false;

const shutDown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  httpServer.close(async () => {
    await apolloServer.stop();
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
