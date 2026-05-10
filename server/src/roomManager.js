// server/src/roomManager.js
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Error:', err));
await redisClient.connect();

// Create a new room or retrieve existing one
export async function getOrCreateRoom(roomId) {
  const existing = await redisClient.get(`room:${roomId}`);
  if (existing) return JSON.parse(existing);

  const newRoom = {
    id: roomId,
    code: '// Start coding here...',
    language: 'javascript',
    users: []
  };

  // Store in Redis, expire after 24 hours (86400 seconds)
  await redisClient.setEx(`room:${roomId}`, 86400, JSON.stringify(newRoom));
  return newRoom;
}

// Update the code content of a room
export async function updateRoomCode(roomId, code) {
  const room = await getOrCreateRoom(roomId);
  room.code = code;
  await redisClient.setEx(`room:${roomId}`, 86400, JSON.stringify(room));
}

// Update the language of a room
export async function updateRoomLanguage(roomId, language) {
  const room = await getOrCreateRoom(roomId);
  room.language = language;
  await redisClient.setEx(`room:${roomId}`, 86400, JSON.stringify(room));
}

// Add a user to a room
export async function addUserToRoom(roomId, user) {
  const room = await getOrCreateRoom(roomId);
  room.users = room.users.filter(u => u.id !== user.id); // avoid duplicates
  room.users.push(user);
  await redisClient.setEx(`room:${roomId}`, 86400, JSON.stringify(room));
  return room;
}

// Remove a user from a room
export async function removeUserFromRoom(roomId, socketId) {
  const room = await getOrCreateRoom(roomId);
  room.users = room.users.filter(u => u.socketId !== socketId);
  await redisClient.setEx(`room:${roomId}`, 86400, JSON.stringify(room));
  return room;
}