// server/src/roomManager.js
import { createClient } from 'redis';
import { log } from './utils/logger.js';

const MAX_REDIS_RETRIES = 10;

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    // Exponential backoff (100ms -> 3s). After MAX_REDIS_RETRIES the client
    // gives up so a bad/deleted REDIS_URL fails loudly instead of looping forever.
    reconnectStrategy: (retries) => {
      if (retries >= MAX_REDIS_RETRIES) {
        return new Error(`Redis unreachable after ${MAX_REDIS_RETRIES} retries`);
      }
      return Math.min(100 * 2 ** retries, 3000);
    },
  },
});

// Log a short message (not the full stack) so a down Redis doesn't flood the logs.
redisClient.on('error', (err) => log.error('Redis error', { error: err.message, code: err.code }));
redisClient.on('ready', () => log.info('Redis connected'));

try {
  await redisClient.connect();
} catch (err) {
  log.error('Could not connect to Redis. Check REDIS_URL (host may be deleted or wrong).', {
    error: err.message,
    code: err.code,
  });
  // Exit non-zero so the platform marks the deploy as failed / restarts it.
  process.exit(1);
}

/** True when the Redis client is connected and ready for commands. */
export function isRedisReady() {
  return redisClient.isReady;
}

/** Round-trip check used by /health. */
export async function pingRedis() {
  try {
    return (await redisClient.ping()) === 'PONG';
  } catch {
    return false;
  }
}

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