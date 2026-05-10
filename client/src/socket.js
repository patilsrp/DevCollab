// client/src/socket.js
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Connect to the server. autoConnect: false means we connect manually.
const socket = io(SERVER_URL, { autoConnect: false });

export default socket;