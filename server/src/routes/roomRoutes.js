// server/src/routes/roomRoutes.js
import express from 'express';
import { RoomIdGenerator } from '../utils/idGenerator.js';
import { getOrCreateRoom } from '../roomManager.js';
import { strictLimiter } from '../rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /api/rooms/create:
 *   post:
 *     summary: Create a new collaborative room
 *     description: Generates a secure room ID and creates a new room with default settings
 *     tags: [Rooms]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *     responses:
 *       200:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateRoomResponse'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
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

    const room = await getOrCreateRoom(roomId);

    res.json({
      success: true,
      roomId,
      roomUrl: `/editor/${roomId}`,
      createdAt: room.createdAt,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create room',
    });
  }
});

/**
 * @swagger
 * /api/rooms/validate/{roomId}:
 *   get:
 *     summary: Validate a room ID
 *     description: Checks if a room ID is valid and whether the room exists
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID to validate
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidateRoomResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/rooms/validate/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!RoomIdGenerator.validate(roomId)) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid room ID format',
      });
    }

    const room = await getOrCreateRoom(roomId);

    res.json({
      valid: true,
      exists: !!room,
      userCount: room?.users?.length || 0,
    });
  } catch (error) {
    console.error('Error validating room:', error);
    res.status(500).json({
      valid: false,
      error: 'Failed to validate room',
    });
  }
});

/**
 * @swagger
 * /api/rooms/{roomId}/info:
 *   get:
 *     summary: Get room information
 *     description: Retrieves metadata about a room without joining it
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     responses:
 *       200:
 *         description: Room information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoomInfoResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/rooms/:roomId/info', async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!RoomIdGenerator.validate(roomId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID',
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
        lastModified: room.lastModified,
      },
    });
  } catch (error) {
    console.error('Error getting room info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get room info',
    });
  }
});

export default router;