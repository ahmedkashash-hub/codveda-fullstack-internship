import { useEffect, useState } from 'react';
import socketClient from '../services/socketClient.js';

const usePresence = () => {
  const [users, setUsers] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    const handlePresence = (payload) => {
      setUsers(payload.users);
      setUpdatedAt(payload.timestamp);
    };
    const handleDisconnect = () => {
      setUsers([]);
      setUpdatedAt(null);
    };

    socketClient.on('server:presence', handlePresence);
    socketClient.on('disconnect', handleDisconnect);
    return () => {
      socketClient.off('server:presence', handlePresence);
      socketClient.off('disconnect', handleDisconnect);
    };
  }, []);

  return { users, updatedAt };
};

export default usePresence;
