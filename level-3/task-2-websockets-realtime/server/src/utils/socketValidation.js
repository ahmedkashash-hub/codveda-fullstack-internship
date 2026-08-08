const USER_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const DISPLAY_NAME_MAX_LENGTH = 80;
const MESSAGE_MAX_LENGTH = 300;
const NOTIFICATION_TYPES = ['INFO', 'SUCCESS', 'WARNING', 'ERROR'];

const normalizeString = (value) =>
  typeof value === 'string' ? value.trim() : '';

export const validateUserId = (value) => {
  const userId = normalizeString(value);

  if (!USER_ID_PATTERN.test(userId)) {
    return { ok: false, error: 'User ID must use 1-64 letters, numbers, hyphens, or underscores' };
  }

  return { ok: true, value: userId };
};

export const validateDisplayName = (value) => {
  const displayName = normalizeString(value);

  if (!displayName || displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return { ok: false, error: 'Display name must contain 1-80 characters' };
  }

  return { ok: true, value: displayName };
};

export const validateMessage = (value) => {
  const message = normalizeString(value);

  if (!message || message.length > MESSAGE_MAX_LENGTH) {
    return { ok: false, error: 'Message must contain 1-300 characters' };
  }

  return { ok: true, value: message };
};

const validateRequiredText = (value, field, maximum) => {
  const text = normalizeString(value);
  if (!text || text.length > maximum) {
    return { ok: false, error: `${field} must contain 1-${maximum} characters` };
  }
  return { ok: true, value: text };
};

export const validateNotificationType = (value) => {
  if (typeof value !== 'string' || !NOTIFICATION_TYPES.includes(value)) {
    return { ok: false, error: 'Notification type must be INFO, SUCCESS, WARNING, or ERROR' };
  }
  return { ok: true, value };
};

export const validateNotificationTitle = (value) =>
  validateRequiredText(value, 'Notification title', 100);

export const validateNotificationMessage = (value) =>
  validateRequiredText(value, 'Notification message', 500);

export const validateIdentity = (auth = {}) => {
  const userId = validateUserId(auth?.userId);
  if (!userId.ok) return userId;

  const displayName = validateDisplayName(auth?.displayName);
  if (!displayName.ok) return displayName;

  return {
    ok: true,
    value: {
      userId: userId.value,
      displayName: displayName.value,
    },
  };
};

export const acknowledge = (callback, response) => {
  if (typeof callback === 'function') callback(response);
};
