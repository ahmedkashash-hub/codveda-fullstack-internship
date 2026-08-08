const createPresenceService = () => {
  const users = new Map();

  const addSocket = ({ userId, displayName, socketId }) => {
    const existing = users.get(userId);
    if (existing) {
      existing.socketIds.add(socketId);
      return false;
    }
    users.set(userId, { displayName, socketIds: new Set([socketId]) });
    return true;
  };

  const removeSocket = ({ userId, socketId }) => {
    const existing = users.get(userId);
    if (!existing) return false;
    existing.socketIds.delete(socketId);
    if (existing.socketIds.size > 0) return false;
    users.delete(userId);
    return true;
  };

  const getSnapshot = () => [...users.entries()]
    .map(([userId, value]) => ({ userId, displayName: value.displayName }))
    .sort((first, second) => first.userId.localeCompare(second.userId));

  return {
    addSocket,
    removeSocket,
    getSnapshot,
  };
};

export default createPresenceService;
