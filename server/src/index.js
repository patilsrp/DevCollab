// server/src/index.js
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './socket.js';
import roomRoutes from './routes/roomRoutes.js';
import { log, httpLogger, errorLogger } from './utils/logger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// HTTP request logging
app.use(httpLogger);

// API Routes
app.use('/api', roomRoutes);

// Health check endpoint
app.get('/health', (req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime()
}));

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