import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL;

if (!socketUrl) {
  throw new Error('VITE_SOCKET_URL is not configured');
}

const socketClient = io(socketUrl, {
  autoConnect: false,
});

export default socketClient;
