import registerBroadcastHandlers from './registerBroadcastHandlers.js';
import registerNotificationHandlers from './registerNotificationHandlers.js';
import registerUserMessageHandlers from './registerUserMessageHandlers.js';

const createPresencePayload = (presenceService) => ({
  users: presenceService.getSnapshot(),
  timestamp: new Date().toISOString(),
});

const registerConnectionHandlers = (io, socket, presenceService) => {
  socket.join('all-users');
  socket.join(`user:${socket.data.userId}`);

  const onlineUsersChanged = presenceService.addSocket({
    userId: socket.data.userId,
    displayName: socket.data.displayName,
    socketId: socket.id,
  });
  const presencePayload = createPresencePayload(presenceService);
  if (onlineUsersChanged) io.to('all-users').emit('server:presence', presencePayload);
  else socket.emit('server:presence', presencePayload);

  registerBroadcastHandlers(io, socket);
  registerNotificationHandlers(io, socket);
  registerUserMessageHandlers(io, socket);

  socket.on('client:ping', () => {
    socket.emit('server:pong', {
      message: 'pong',
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    const onlineUsersChangedAfterDisconnect = presenceService.removeSocket({
      userId: socket.data.userId,
      socketId: socket.id,
    });
    if (onlineUsersChangedAfterDisconnect) {
      io.to('all-users').emit('server:presence', createPresencePayload(presenceService));
    }

    socket.removeAllListeners('client:ping');
    socket.removeAllListeners('client:broadcast');
    socket.removeAllListeners('client:user-message');
    socket.removeAllListeners('client:send-notification');
  });
};

export default registerConnectionHandlers;
