// server/src/routes/roomRoutes.js
import express from 'express';
import { RoomIdGenerator } from '../utils/idGenerator.js';
import { getOrCreateRoom } from '../roomManager.js';
import { strictLimiter } from '../rateLimiter.js';

const router = express.Router();

// Create a new room with secure ID
router.post('/rooms/create', strictLimiter, async (req, res) => {
  try {
    const { type = 'secure' } = req.body;
    
    let roomId;
    switch (type) {
      case 'friendly':
        roomId = RoomIdGenerator.friendly();
        break;
      case 'timed':
        roomId = RoomIdGenerator.timed();
        break;
      default:
        roomId = RoomIdGenerator.secure();
    }
    
    // Create the room
    const room = await getOrCreateRoom(roomId);
    
    res.json({
      success: true,
      roomId,
      roomUrl: `/editor/${roomId}`,
      createdAt: room.createdAt
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create room'
    });
  }
});

// Validate room ID
router.get('/rooms/validate/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!RoomIdGenerator.validate(roomId)) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid room ID format'
      });
    }
    
    // Check if room exists
    const room = await getOrCreateRoom(roomId);
    
    res.json({
      valid: true,
      exists: !!room,
      userCount: room?.users?.length || 0
    });
  } catch (error) {
    console.error('Error validating room:', error);
    res.status(500).json({
      valid: false,
      error: 'Failed to validate room'
    });
  }
});

// Get room info (without joining)
router.get('/rooms/:roomId/info', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!RoomIdGenerator.validate(roomId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID'
      });
    }
    
    const room = await getOrCreateRoom(roomId);
    
    res.json({
      success: true,
      room: {
        id: room.id,
        userCount: room.users.length,
        language: room.language,
        createdAt: room.createdAt,
        lastModified: room.lastModified
      }
    });
  } catch (error) {
    console.error('Error getting room info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get room info'
    });
  }
});

export default router;