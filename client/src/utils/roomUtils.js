// client/src/utils/roomUtils.js
import { nanoid } from 'nanoid';
import { config } from '../config';

// Generate a secure room ID on client side (fallback)
export function generateRoomId() {
  return nanoid(10);
}

// Create a new room via API
export async function createRoom(type = 'secure') {
  try {
    const response = await fetch(`${config.serverUrl}/api/rooms/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create room');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating room:', error);
    // Fallback to client-side generation
    return {
      success: true,
      roomId: generateRoomId(),
      roomUrl: `/editor/${generateRoomId()}`,
      createdAt: Date.now()
    };
  }
}

// Validate room ID format
export function isValidRoomId(roomId) {
  if (!roomId || typeof roomId !== 'string') return false;
  if (roomId.length < 6 || roomId.length > 20) return false;
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(roomId);
}

// Check if room exists
export async function checkRoomExists(roomId) {
  try {
    const response = await fetch(`${config.serverUrl}/api/rooms/validate/${roomId}`);
    
    if (!response.ok) {
      return { valid: false, exists: false };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking room:', error);
    return { valid: true, exists: true }; // Assume exists to avoid blocking user
  }
}

// Get room info
export async function getRoomInfo(roomId) {
  try {
    const response = await fetch(`${config.serverUrl}/api/rooms/${roomId}/info`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.room;
  } catch (error) {
    console.error('Error getting room info:', error);
    return null;
  }
}

// Format room URL for sharing
export function formatRoomUrl(roomId) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/editor/${roomId}`;
}

// Copy room URL to clipboard
export async function copyRoomUrl(roomId) {
  const url = formatRoomUrl(roomId);
  
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);
    return false;
  }
}