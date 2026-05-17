// server/src/index.js
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { initSocket } from './socket.js';
import roomRoutes from './routes/roomRoutes.js';
import { log, httpLogger, errorLogger } from './utils/logger.js';
import { swaggerSpec, socketEventsDocs } from './swagger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// HTTP request logging
app.use(httpLogger);

// API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'DevCollab API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

// JSON spec (machine-readable)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Socket.IO events documentation
app.get('/api-docs/socket', (req, res) => res.json(socketEventsDocs));

// API Routes
app.use('/api', roomRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the server status and uptime
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/health', (req, res) =>
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
);

// Error logging middleware (must be last)
app.use(errorLogger);

initSocket(httpServer);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  log.info(`Server started`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    log.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    log.info('Server closed');
    process.exit(0);
  });
});

// Handle unhandled errors
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled rejection', { reason, promise });
});