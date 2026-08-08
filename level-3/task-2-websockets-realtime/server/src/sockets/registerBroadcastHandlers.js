import {
  acknowledge,
  validateMessage,
} from '../utils/socketValidation.js';

const registerBroadcastHandlers = (io, socket) => {
  socket.on('client:broadcast', (payload, callback) => {
    const message = validateMessage(payload?.message);

    if (!message.ok) {
      acknowledge(callback, { ok: false, error: message.error });
      return;
    }

    io.to('all-users').emit('server:broadcast', {
      from: {
        userId: socket.data.userId,
        displayName: socket.data.displayName,
      },
      message: message.value,
      timestamp: new Date().toISOString(),
    });
    acknowledge(callback, { ok: true });
  });
};

export default registerBroadcastHandlers;
