import { Server } from 'socket.io';
import {
  createSocketCorsOptions,
  getClientOrigin,
} from './config/cors.js';
import registerConnectionHandlers from './sockets/registerConnectionHandlers.js';
import createPresenceService from './services/presenceService.js';
import { validateIdentity } from './utils/socketValidation.js';

const initializeSocketServer = (httpServer) => {
  const clientOrigin = getClientOrigin();
  const presenceService = createPresenceService();
  const io = new Server(httpServer, {
    cors: createSocketCorsOptions(),
    allowRequest(request, callback) {
      const origin = request.headers.origin;
      callback(null, !origin || origin === clientOrigin);
    },
  });

  io.use((socket, next) => {
    const identity = validateIdentity(socket.handshake.auth);

    if (!identity.ok) {
      next(new Error('Invalid temporary identity'));
      return;
    }

    socket.data.userId = identity.value.userId;
    socket.data.displayName = identity.value.displayName;
    next();
  });

  io.on('connection', (socket) => {
    registerConnectionHandlers(io, socket, presenceService);
  });

  return io;
};

export default initializeSocketServer;
