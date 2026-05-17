// server/src/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevCollab API',
      version: '1.0.0',
      description: 'Real-time collaborative code editor API documentation',
      contact: {
        name: 'DevCollab Team',
        url: 'https://github.com/yourorg/devcollab'
      },
      license: {
        name: 'ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.devcollab.example.com',
        description: 'Production server'
      }
    ],
    tags: [
      { name: 'Rooms', description: 'Room management endpoints' },
      { name: 'Health', description: 'Health and monitoring endpoints' }
    ],
    components: {
      schemas: {
        Room: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'AbCdEf1234' },
            code: { type: 'string', example: '// Start coding here...' },
            language: { type: 'string', example: 'javascript' },
            users: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' }
            },
            createdAt: { type: 'number', example: 1700000000000 },
            lastModified: { type: 'number', example: 1700000000000 }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'socket-id-123' },
            socketId: { type: 'string', example: 'socket-id-123' },
            username: { type: 'string', example: 'johndoe' },
            color: { type: 'string', example: '#4ECDC4' },
            joinedAt: { type: 'number', example: 1700000000000 }
          }
        },
        CreateRoomRequest: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['secure', 'friendly', 'timed'],
              default: 'secure',
              description: 'Type of room ID to generate'
            }
          }
        },
        CreateRoomResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            roomId: { type: 'string', example: 'AbCdEf1234' },
            roomUrl: { type: 'string', example: '/editor/AbCdEf1234' },
            createdAt: { type: 'number' }
          }
        },
        ValidateRoomResponse: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            exists: { type: 'boolean' },
            userCount: { type: 'number' },
            error: { type: 'string' }
          }
        },
        RoomInfoResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            room: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userCount: { type: 'number' },
                language: { type: 'string' },
                createdAt: { type: 'number' },
                lastModified: { type: 'number' }
              }
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', example: 12345.678 }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'An error occurred' },
            errors: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Invalid request parameters',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        TooManyRequests: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        InternalError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/index.js']
};

export const swaggerSpec = swaggerJsdoc(options);

// Socket.IO events documentation (separate since OpenAPI doesn't cover WebSockets)
export const socketEventsDocs = {
  clientToServer: {
    'join-room': {
      description: 'Join a collaborative room',
      data: {
        roomId: 'string (3-50 chars)',
        username: 'string (2-30 chars)'
      },
      rateLimit: '5 requests per 60 seconds'
    },
    'code-change': {
      description: 'Broadcast code changes to other users',
      data: {
        roomId: 'string',
        code: 'string (max 100,000 chars)'
      },
      rateLimit: '100 requests per 10 seconds'
    },
    'language-change': {
      description: 'Change the programming language',
      data: {
        roomId: 'string',
        language: 'one of: javascript, typescript, python, java, cpp, go, rust, html, css'
      },
      rateLimit: '10 requests per 60 seconds'
    },
    'send-message': {
      description: 'Send a chat message',
      data: {
        roomId: 'string',
        message: 'string (1-500 chars)',
        username: 'string'
      },
      rateLimit: '30 requests per 60 seconds'
    },
    'cursor-move': {
      description: 'Broadcast cursor position',
      data: {
        roomId: 'string',
        cursor: { line: 'number', column: 'number' },
        username: 'string'
      },
      rateLimit: '200 requests per 10 seconds'
    },
    ping: {
      description: 'Connection health check',
      data: 'timestamp: number',
      response: 'callback({ timestamp, latency, serverTime })'
    }
  },
  serverToClient: {
    'room-joined': 'Initial room state on join',
    'user-joined': 'New user joined the room',
    'user-left': 'A user left the room',
    'code-update': 'Code changed by another user',
    'language-update': 'Language changed by another user',
    'receive-message': 'New chat message received',
    'cursor-update': 'Another user moved their cursor',
    error: 'Error message (validation, rate limit, etc.)'
  }
};