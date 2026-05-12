// server/src/utils/logger.js
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../../logs');

const isDevelopment = process.env.NODE_ENV !== 'production';

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Custom colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Custom format for development (readable, colored)
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(metadata).length > 0) {
      const cleanMetadata = { ...metadata };
      delete cleanMetadata.service;

      if (Object.keys(cleanMetadata).length > 0) {
        msg += ` ${JSON.stringify(cleanMetadata)}`;
      }
    }

    return msg;
  })
);

// Production format (JSON for log aggregation)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
  winston.format.json()
);

// Define transports based on environment
const transports = [
  new winston.transports.Console({
    format: isDevelopment ? developmentFormat : productionFormat,
    level: isDevelopment ? 'debug' : 'info'
  })
];

// Add file transports in production
if (!isDevelopment) {
  // Error log file (rotated daily)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: productionFormat
    })
  );

  // Combined log file (rotated daily)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: productionFormat
    })
  );

  // HTTP requests log
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d',
      format: productionFormat
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  levels,
  defaultMeta: { service: 'devcollab-server' },
  transports,
  exitOnError: false
});

// Handle uncaught exceptions and rejections
logger.exceptions.handle(
  new winston.transports.Console({
    format: isDevelopment ? developmentFormat : productionFormat
  })
);

logger.rejections.handle(
  new winston.transports.Console({
    format: isDevelopment ? developmentFormat : productionFormat
  })
);

// Helper methods for structured logging
export const log = {
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  http: (message, meta = {}) => logger.http(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),

  // Specialized loggers for different contexts
  socket: (event, data = {}) => {
    logger.debug(`Socket: ${event}`, { context: 'socket', ...data });
  },

  room: (action, roomId, data = {}) => {
    logger.info(`Room ${action}: ${roomId}`, {
      context: 'room',
      roomId,
      ...data
    });
  },

  user: (action, userId, data = {}) => {
    logger.info(`User ${action}: ${userId}`, {
      context: 'user',
      userId,
      ...data
    });
  },

  performance: (metric, value, data = {}) => {
    logger.debug(`Performance: ${metric}=${value}`, {
      context: 'performance',
      metric,
      value,
      ...data
    });
  },

  security: (event, data = {}) => {
    logger.warn(`Security: ${event}`, {
      context: 'security',
      ...data
    });
  },

  audit: (action, data = {}) => {
    logger.info(`Audit: ${action}`, {
      context: 'audit',
      timestamp: new Date().toISOString(),
      ...data
    });
  }
};

// Express middleware for HTTP request logging
export const httpLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  log.http(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    res.send = originalSend;
    const duration = Date.now() - start;

    log.http(`${req.method} ${req.url} ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length')
    });

    return res.send(data);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  log.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    ip: req.ip
  });

  next(err);
};

export default logger;