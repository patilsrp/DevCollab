// server/src/socket.js
import { Server } from 'socket.io';
import {
  getOrCreateRoom,
  addUserToRoom,
  removeUserFromRoom,
  updateRoomCode,
  updateRoomLanguage
} from './roomManager.js';
import { log } from './utils/logger.js';
import { metrics } from './utils/metrics.js';

// Map to track which room each socket is in
const socketRoomMap = {};

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    log.socket('connection', { socketId: socket.id });
    metrics.recordConnection();

    // Connection health check
    socket.on('ping', (timestamp, callback) => {
      if (callback) {
        callback({
          timestamp,
          latency: Date.now() - timestamp,
          serverTime: Date.now()
        });
      }
    });

    // ── JOIN ROOM ──────────────────────────────────────────────
    socket.on('join-room', async ({ roomId, username }) => {
      metrics.recordSocketEvent('join-room');
      socket.join(roomId);
      socketRoomMap[socket.id] = roomId;

      const user = { id: socket.id, socketId: socket.id, username, color: getRandomColor() };
      const room = await addUserToRoom(roomId, user);

      socket.emit('room-joined', room);
      socket.to(roomId).emit('user-joined', { user, users: room.users });

      metrics.recordRoomOperation('join');
      metrics.observeUsersPerRoom(room.users.length);
      metrics.setActiveRooms(io.sockets.adapter.rooms.size);

      log.room('joined', roomId, { username, socketId: socket.id, userCount: room.users.length });
    });

    // ── CODE CHANGE ────────────────────────────────────────────
    socket.on('code-change', async ({ roomId, code }) => {
      metrics.recordSocketEvent('code-change');
      await updateRoomCode(roomId, code);
      socket.to(roomId).emit('code-update', code);
    });

    // ── LANGUAGE CHANGE ────────────────────────────────────────
    socket.on('language-change', async ({ roomId, language }) => {
      metrics.recordSocketEvent('language-change');
      await updateRoomLanguage(roomId, language);
      socket.to(roomId).emit('language-update', language);
    });

    // ── CHAT MESSAGE ───────────────────────────────────────────
    socket.on('send-message', ({ roomId, message, username }) => {
      metrics.recordSocketEvent('send-message');
      io.to(roomId).emit('receive-message', {
        username,
        message,
        timestamp: new Date().toLocaleTimeString()
      });
    });

    // ── CURSOR POSITION ────────────────────────────────────────
    socket.on('cursor-move', ({ roomId, cursor, username }) => {
      metrics.recordSocketEvent('cursor-move');
      socket.to(roomId).emit('cursor-update', { socketId: socket.id, cursor, username });
    });

    // ── DISCONNECT ─────────────────────────────────────────────
    socket.on('disconnect', async (reason) => {
      log.socket('disconnect', { socketId: socket.id, reason });
      metrics.recordDisconnection(reason);

      const roomId = socketRoomMap[socket.id];
      if (roomId) {
        const room = await removeUserFromRoom(roomId, socket.id);
        io.to(roomId).emit('user-left', { socketId: socket.id, users: room.users });
        delete socketRoomMap[socket.id];
        metrics.recordRoomOperation('leave');
        metrics.setActiveRooms(io.sockets.adapter.rooms.size);
      }
    });
  });

  return io;
}

// Give each user a unique color for their cursor
function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  return colors[Math.floor(Math.random() * colors.length)];
}