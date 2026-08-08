import { useCallback, useEffect, useState } from 'react';
import socketClient from '../services/socketClient.js';

const MAX_EVENTS = 20;
const appendLimited = (events, event) =>
  [event, ...events].slice(0, MAX_EVENTS);

const useSocket = () => {
  const [status, setStatus] = useState('Disconnected');
  const [error, setError] = useState('');
  const [pong, setPong] = useState(null);
  const [broadcastEvents, setBroadcastEvents] = useState([]);
  const [userMessageEvents, setUserMessageEvents] = useState([]);

  useEffect(() => {
    const handleConnect = () => {
      setStatus('Connected');
      setError('');
    };
    const handleDisconnect = () => setStatus('Disconnected');
    const handleConnectError = () => {
      setStatus('Disconnected');
      setError('Connection rejected. Check the temporary identity and server availability.');
    };
    const handlePong = (payload) => setPong(payload);
    const handleBroadcast = (payload) => {
      setBroadcastEvents((events) => appendLimited(events, payload));
    };
    const handleUserMessage = (payload) => {
      setUserMessageEvents((events) => appendLimited(events, payload));
    };

    socketClient.on('connect', handleConnect);
    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('connect_error', handleConnectError);
    socketClient.on('server:pong', handlePong);
    socketClient.on('server:broadcast', handleBroadcast);
    socketClient.on('server:user-message', handleUserMessage);

    return () => {
      socketClient.off('connect', handleConnect);
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('connect_error', handleConnectError);
      socketClient.off('server:pong', handlePong);
      socketClient.off('server:broadcast', handleBroadcast);
      socketClient.off('server:user-message', handleUserMessage);
      socketClient.disconnect();
    };
  }, []);

  const connect = useCallback((identity) => {
    if (socketClient.connected) return;
    socketClient.auth = identity;
    setStatus('Connecting');
    setError('');
    socketClient.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketClient.disconnect();
    setStatus('Disconnected');
  }, []);

  const emitWithAcknowledgement = useCallback((event, payload) =>
    new Promise((resolve) => {
      if (!socketClient.connected) {
        resolve({ ok: false, error: 'Connect before sending an event' });
        return;
      }

      socketClient.timeout(3000).emit(event, payload, (timeoutError, response) => {
        if (timeoutError) {
          resolve({ ok: false, error: 'The server did not acknowledge the event' });
          return;
        }
        resolve(response);
      });
    }), []);

  const sendPing = useCallback(() => {
    if (!socketClient.connected) return;
    setPong(null);
    socketClient.emit('client:ping');
  }, []);

  return {
    status,
    error,
    pong,
    canSendPing: status === 'Connected',
    broadcastEvents,
    userMessageEvents,
    connect,
    disconnect,
    sendPing,
    sendBroadcast: (message) =>
      emitWithAcknowledgement('client:broadcast', { message }),
    sendUserMessage: (targetUserId, message) =>
      emitWithAcknowledgement('client:user-message', { targetUserId, message }),
  };
};

export default useSocket;
