import {
  acknowledge,
  validateMessage,
  validateUserId,
} from '../utils/socketValidation.js';

const registerUserMessageHandlers = (io, socket) => {
  socket.on('client:user-message', (payload, callback) => {
    const targetUserId = validateUserId(payload?.targetUserId);
    if (!targetUserId.ok) {
      acknowledge(callback, { ok: false, error: targetUserId.error });
      return;
    }

    const message = validateMessage(payload?.message);
    if (!message.ok) {
      acknowledge(callback, { ok: false, error: message.error });
      return;
    }

    io.to(`user:${targetUserId.value}`).emit('server:user-message', {
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

export default registerUserMessageHandlers;
