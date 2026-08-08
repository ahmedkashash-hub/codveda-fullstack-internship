import { randomUUID } from 'node:crypto';
import {
  acknowledge,
  validateNotificationMessage,
  validateNotificationTitle,
  validateNotificationType,
  validateUserId,
} from '../utils/socketValidation.js';

const registerNotificationHandlers = (io, socket) => {
  socket.on('client:send-notification', (payload, callback) => {
    const targetUserId = validateUserId(payload?.targetUserId);
    if (!targetUserId.ok) {
      acknowledge(callback, { ok: false, error: targetUserId.error });
      return;
    }

    const type = validateNotificationType(payload?.type);
    if (!type.ok) {
      acknowledge(callback, { ok: false, error: type.error });
      return;
    }

    const title = validateNotificationTitle(payload?.title);
    if (!title.ok) {
      acknowledge(callback, { ok: false, error: title.error });
      return;
    }

    const message = validateNotificationMessage(payload?.message);
    if (!message.ok) {
      acknowledge(callback, { ok: false, error: message.error });
      return;
    }

    const notification = {
      id: randomUUID(),
      type: type.value,
      title: title.value,
      message: message.value,
      recipientUserId: targetUserId.value,
      createdAt: new Date().toISOString(),
      read: false,
    };

    io.to(`user:${targetUserId.value}`).emit('server:notification', notification);
    acknowledge(callback, { ok: true, notificationId: notification.id });
  });
};

export default registerNotificationHandlers;
