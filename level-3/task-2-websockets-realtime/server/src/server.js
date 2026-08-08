import 'dotenv/config';
import { createServer } from 'node:http';
import app from './app.js';
import initializeSocketServer from './socketServer.js';

const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';
const httpServer = createServer(app);
const io = initializeSocketServer(httpServer);

httpServer.listen(port, host, () => {
  console.log(`HTTP and Socket.io server listening on ${host}:${port}`);
});

let isShuttingDown = false;

const shutDown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  io.close(() => {
    if (httpServer.listening) {
      httpServer.close(() => process.exit(0));
      return;
    }
    process.exit(0);
  });
};

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
