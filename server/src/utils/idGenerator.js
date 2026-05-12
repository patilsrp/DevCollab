// server/src/utils/idGenerator.js
import { nanoid, customAlphabet } from 'nanoid';
import crypto from 'crypto';

// Custom alphabet for room IDs (URL-safe, no ambiguous characters)
const roomAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
const generateRoomId = customAlphabet(roomAlphabet, 10);

// Generate a secure room ID
export function createSecureRoomId() {
  return generateRoomId();
}

// Generate a user-friendly room code (shorter, easier to share)
export function createFriendlyRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const generateCode = customAlphabet(alphabet, 6);
  return generateCode();
}

// Generate a secure session ID
export function createSessionId() {
  return nanoid(21);
}

// Generate a unique user ID
export function createUserId() {
  return `user_${nanoid(16)}`;
}

// Hash a room ID for logging (don't log actual room IDs)
export function hashRoomId(roomId) {
  return crypto.createHash('sha256').update(roomId).digest('hex').substring(0, 8);
}

// Validate room ID format
export function isValidRoomId(roomId) {
  if (!roomId || typeof roomId !== 'string') return false;
  
  // Check length (6-20 characters)
  if (roomId.length < 6 || roomId.length > 20) return false;
  
  // Check characters (alphanumeric, no special chars except dash/underscore)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(roomId);
}

// Generate a time-based room ID with prefix
export function createTimedRoomId(prefix = 'room') {
  const timestamp = Date.now().toString(36);
  const random = nanoid(8);
  return `${prefix}_${timestamp}_${random}`;
}

// Room ID utilities
export const RoomIdGenerator = {
  // For direct room access (longer, more secure)
  secure: createSecureRoomId,
  
  // For sharing verbally or on paper (shorter)
  friendly: createFriendlyRoomCode,
  
  // For internal use with timestamps
  timed: createTimedRoomId,
  
  // Validation
  validate: isValidRoomId,
  
  // For logging
  hash: hashRoomId
};