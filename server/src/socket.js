// server/src/socket.js
import { Server } from 'socket.io';
import {
  getOrCreateRoom,
  addUserToRoom,
  removeUserFromRoom,
  updateRoomCode,
  updateRoomLanguage
} from './roomManager.js';

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
    console.log(`🔌 User connected: ${socket.id}`);
    
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
    // Fired when a user navigates to /editor/:roomId
    socket.on('join-room', async ({ roomId, username }) => {
      socket.join(roomId);  // Socket.IO "room" — messages only go to members
      socketRoomMap[socket.id] = roomId;

      const user = { id: socket.id, socketId: socket.id, username, color: getRandomColor() };
      const room = await addUserToRoom(roomId, user);

      // Send the new user the current room state (existing code + language)
      socket.emit('room-joined', room);

      // Tell everyone else in the room a new user arrived
      socket.to(roomId).emit('user-joined', { user, users: room.users });

      console.log(`👤 ${username} joined room ${roomId}`);
    });

    // ── CODE CHANGE ────────────────────────────────────────────
    // Fired every time someone types in the editor
    socket.on('code-change', async ({ roomId, code }) => {
      await updateRoomCode(roomId, code);
      // Broadcast to everyone EXCEPT the sender (they already have the update)
      socket.to(roomId).emit('code-update', code);
    });

    // ── LANGUAGE CHANGE ────────────────────────────────────────
    socket.on('language-change', async ({ roomId, language }) => {
      await updateRoomLanguage(roomId, language);
      socket.to(roomId).emit('language-update', language);
    });

    // ── CHAT MESSAGE ───────────────────────────────────────────
    socket.on('send-message', ({ roomId, message, username }) => {
      // Broadcast to EVERYONE including sender (so they see their own message)
      io.to(roomId).emit('receive-message', {
        username,
        message,
        timestamp: new Date().toLocaleTimeString()
      });
    });

    // ── CURSOR POSITION ────────────────────────────────────────
    // Fired when cursor moves in the editor
    socket.on('cursor-move', ({ roomId, cursor, username }) => {
      socket.to(roomId).emit('cursor-update', { socketId: socket.id, cursor, username });
    });

    // ── DISCONNECT ─────────────────────────────────────────────
    socket.on('disconnect', async (reason) => {
      console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
      const roomId = socketRoomMap[socket.id];
      if (roomId) {
        const room = await removeUserFromRoom(roomId, socket.id);
        io.to(roomId).emit('user-left', { socketId: socket.id, users: room.users });
        delete socketRoomMap[socket.id];
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