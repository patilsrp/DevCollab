// server/src/rateLimiter.js
import rateLimit from 'express-rate-limit';

// HTTP rate limiters
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Socket.IO rate limiter
class SocketRateLimiter {
  constructor() {
    this.clients = new Map();
    this.cleanup();
  }

  checkLimit(socketId, event, maxRequests = 30, windowMs = 60000) {
    const now = Date.now();
    const key = `${socketId}:${event}`;

    if (!this.clients.has(key)) {
      this.clients.set(key, { requests: 1, firstRequest: now, lastRequest: now });
      return true;
    }

    const client = this.clients.get(key);

    if (now - client.firstRequest > windowMs) {
      this.clients.set(key, { requests: 1, firstRequest: now, lastRequest: now });
      return true;
    }

    if (client.requests >= maxRequests) return false;

    client.requests++;
    client.lastRequest = now;
    return true;
  }

  removeClient(socketId) {
    for (const [key] of this.clients.entries()) {
      if (key.startsWith(socketId + ':')) this.clients.delete(key);
    }
  }

  cleanup() {
    setInterval(() => {
      const now = Date.now();
      const windowMs = 60000;
      for (const [key, client] of this.clients.entries()) {
        if (now - client.lastRequest > windowMs * 2) this.clients.delete(key);
      }
    }, 60000);
  }
}

export const socketEventLimits = {
  'join-room': { maxRequests: 5, windowMs: 60000 },
  'code-change': { maxRequests: 100, windowMs: 10000 },
  'language-change': { maxRequests: 10, windowMs: 60000 },
  'send-message': { maxRequests: 30, windowMs: 60000 },
  'cursor-move': { maxRequests: 200, windowMs: 10000 },
};

export const socketRateLimiter = new SocketRateLimiter();