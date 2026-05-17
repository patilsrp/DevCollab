// server/src/utils/metrics.js
import client from 'prom-client';

// Default registry with standard Node.js metrics (CPU, memory, event loop, etc.)
const register = new client.Registry();
register.setDefaultLabels({ app: 'devcollab-server' });
client.collectDefaultMetrics({ register, prefix: 'devcollab_' });

// ─── HTTP Metrics ─────────────────────────────────────────────────────────
const httpRequestsTotal = new client.Counter({
  name: 'devcollab_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'devcollab_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// ─── Socket.IO Metrics ────────────────────────────────────────────────────
const socketConnectionsTotal = new client.Counter({
  name: 'devcollab_socket_connections_total',
  help: 'Total Socket.IO connections opened',
  registers: [register],
});

const socketDisconnectionsTotal = new client.Counter({
  name: 'devcollab_socket_disconnections_total',
  help: 'Total Socket.IO disconnections',
  labelNames: ['reason'],
  registers: [register],
});

const socketEventsTotal = new client.Counter({
  name: 'devcollab_socket_events_total',
  help: 'Total Socket.IO events received',
  labelNames: ['event', 'status'],
  registers: [register],
});

const activeConnections = new client.Gauge({
  name: 'devcollab_socket_active_connections',
  help: 'Number of active Socket.IO connections',
  registers: [register],
});

// ─── Room Metrics ─────────────────────────────────────────────────────────
const activeRooms = new client.Gauge({
  name: 'devcollab_active_rooms',
  help: 'Number of active rooms',
  registers: [register],
});

const usersPerRoom = new client.Histogram({
  name: 'devcollab_users_per_room',
  help: 'Distribution of users per room',
  buckets: [1, 2, 3, 5, 10, 20, 50],
  registers: [register],
});

const roomOperationsTotal = new client.Counter({
  name: 'devcollab_room_operations_total',
  help: 'Total room operations (create/join/leave)',
  labelNames: ['operation'],
  registers: [register],
});

// ─── Rate Limit Metrics ───────────────────────────────────────────────────
const rateLimitHits = new client.Counter({
  name: 'devcollab_rate_limit_hits_total',
  help: 'Number of times rate limits were hit',
  labelNames: ['event'],
  registers: [register],
});

// ─── Validation Metrics ───────────────────────────────────────────────────
const validationFailures = new client.Counter({
  name: 'devcollab_validation_failures_total',
  help: 'Number of validation failures',
  labelNames: ['event'],
  registers: [register],
});

// ─── Redis Metrics ────────────────────────────────────────────────────────
const redisOperationDuration = new client.Histogram({
  name: 'devcollab_redis_operation_duration_seconds',
  help: 'Redis operation latency',
  labelNames: ['operation', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});

// ─── Express middleware for HTTP metrics ─────────────────────────────────
export function metricsMiddleware(req, res, next) {
  // Skip the metrics endpoint itself to avoid noise
  if (req.path === '/metrics') return next();

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
    // Use route pattern if available, fall back to path
    const route = req.route?.path || req.baseUrl + (req.route?.path || '') || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationSec);
  });

  next();
}

// ─── Public API ───────────────────────────────────────────────────────────
export const metrics = {
  register,

  // Socket lifecycle
  recordConnection() {
    socketConnectionsTotal.inc();
    activeConnections.inc();
  },

  recordDisconnection(reason = 'unknown') {
    socketDisconnectionsTotal.inc({ reason });
    activeConnections.dec();
  },

  // Socket events
  recordSocketEvent(event, status = 'success') {
    socketEventsTotal.inc({ event, status });
  },

  // Rooms
  recordRoomOperation(operation) {
    roomOperationsTotal.inc({ operation });
  },

  setActiveRooms(count) {
    activeRooms.set(count);
  },

  observeUsersPerRoom(count) {
    usersPerRoom.observe(count);
  },

  // Rate limiting
  recordRateLimitHit(event) {
    rateLimitHits.inc({ event });
  },

  // Validation
  recordValidationFailure(event) {
    validationFailures.inc({ event });
  },

  // Redis
  observeRedisOperation(operation, status, durationSec) {
    redisOperationDuration.observe({ operation, status }, durationSec);
  },

  // For tests/manual use
  async getMetrics() {
    return register.metrics();
  },

  reset() {
    register.resetMetrics();
  },
};