# DevCollab - Real-Time Collaborative Code Editor

A browser-based collaborative coding platform where multiple developers write, edit, and discuss code in real time. It has a React + Monaco frontend and a Node.js, Socket.IO and Redis backend. The backend ships with rate limiting, structured logging, Prometheus metrics and Swagger API docs.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)

## Features

- **Real-time code sync** - changes broadcast instantly to everyone in the room
- **Monaco Editor** - VS Code's editor in the browser, with 12+ languages
- **Live presence and cursors** - see who is in the room and where they are typing
- **Integrated chat** - discuss code without leaving the editor
- **Room-based sessions** - create a room, share its ID, and collaborate. Rooms are stored in Redis and expire after 24 hours
- **Connection resilience** - connection status indicator, retry logic and an error boundary on the client
- **Production tooling** - rate limiting (HTTP and per-socket), Winston logging with daily rotation, Prometheus metrics, Swagger docs and health checks

**Supported languages:** JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, HTML, CSS, SQL

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, React Router 7, TypeScript (type-checking), `@monaco-editor/react` |
| Backend | Node.js (ESM), Express 5, Socket.IO 4 |
| Storage | Redis 7 (node-redis client) |
| Observability | winston + daily-rotate-file, prom-client, Prometheus, Grafana |
| API docs | swagger-jsdoc + swagger-ui-express |
| Testing and quality | Vitest, Testing Library, Supertest, ESLint, Prettier |
| Deployment | Docker / Docker Compose, Render (backend), Vercel (frontend) |

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Redis (local, or via Docker)

### Install

```bash
git clone <your-repo-url> devcollab
cd devcollab

cd server && npm install
cd ../client && npm install
```

### Configure environment

`server/.env`:
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

`client/.env`:
```env
VITE_SERVER_URL=http://localhost:3001

# Optional tuning / feature flags
# VITE_ENABLE_CHAT=true
# VITE_ENABLE_CURSORS=true
# VITE_ENABLE_LIVE_USERS=true
# VITE_CODE_DEBOUNCE_MS=
# VITE_CURSOR_DEBOUNCE_MS=
# VITE_MAX_MESSAGE_LENGTH=
# VITE_MAX_USERNAME_LENGTH=
```

### Run locally

```bash
redis-server              # terminal 1
cd server && npm run dev  # terminal 2 (nodemon)
cd client && npm run dev  # terminal 3 (Vite)
```

Open http://localhost:5173.

### Run with Docker

```bash
# Production-style stack (redis + server + client)
docker compose up --build

# Development with hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Optional: Prometheus (9090) and Grafana (3000)
docker compose -f docker-compose.monitoring.yml up -d
```

## Usage

1. Enter your name and click **Create Room** (or paste a Room ID and click **Join Room**).
2. Share the Room ID with collaborators.
3. Code together, switch languages from the dropdown, and chat in the sidebar.

## Project Structure

```
devcollab/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── pages/               # HomePage, EditorPage
│   │   ├── components/          # Editor, Sidebar, RoomShare, ConnectionStatus,
│   │   │                        # ConnectionMonitor, ErrorBoundary, LoadingStates
│   │   ├── hooks/               # useSocket, useSocketWithRetry, useAsyncData
│   │   ├── utils/               # socketManager, roomUtils, debounce, logger
│   │   ├── config.js            # Env-driven client config
│   │   └── socket.js
│   ├── tests/
│   ├── nginx.conf, vercel.json, Dockerfile
│   └── vite.config.js
├── server/                      # Express + Socket.IO backend
│   ├── src/
│   │   ├── index.js             # App setup, health, metrics, Swagger
│   │   ├── socket.js            # Socket.IO event handlers
│   │   ├── roomManager.js       # Redis-backed room state
│   │   ├── rateLimiter.js       # HTTP and socket rate limiting
│   │   ├── swagger.js           # OpenAPI config
│   │   ├── routes/roomRoutes.js # REST endpoints
│   │   └── utils/               # logger, metrics, performanceMonitor, idGenerator
│   ├── tests/
│   └── Dockerfile
├── shared/                      # Shared TypeScript types
├── monitoring/prometheus.yml
├── docs/                        # API.md, DEPLOYMENT.md, MONITORING.md
├── docker-compose.yml           # redis + server + client
├── docker-compose.dev.yml       # dev override (hot reload)
├── docker-compose.monitoring.yml# Prometheus + Grafana
└── render.yaml                  # Render blueprint
```

## API

### REST (prefix `/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rooms/create` | Create a room (strict rate limit) |
| GET | `/api/rooms/validate/:roomId` | Check that a room exists |
| GET | `/api/rooms/:roomId/info` | Get room details |

### Operational endpoints

| Endpoint | Description |
|----------|-------------|
| `/health` | Health check (status, timestamp, uptime) |
| `/metrics` | Prometheus metrics |
| `/api-docs` | Swagger UI |
| `/api-docs.json` | OpenAPI spec |
| `/api-docs/socket` | Socket.IO event documentation |

See [docs/API.md](docs/API.md) for full details.

### Socket.IO events

**Client → Server:** `join-room`, `code-change`, `language-change`, `send-message`, `cursor-move`, `ping`

**Server → Client:** `room-joined`, `user-joined`, `user-left`, `code-update`, `language-update`, `receive-message`, `cursor-update`

## Scripts

Both `client/` and `server/` support:

```bash
npm test               # run tests (Vitest)
npm run test:coverage  # coverage report
npm run lint           # ESLint (lint:fix to auto-fix)
npm run format         # Prettier (format:check to verify)
```

| Package | Extra scripts |
|---------|---------------|
| server | `npm run dev` (nodemon), `npm start` |
| client | `npm run dev`, `npm run build` (tsc + vite build), `npm run build:analyze`, `npm run preview`, `npm run type-check` |

## Deployment

- **Backend → Render:** `render.yaml` defines the web service (root `server`, health check `/health`). Set `REDIS_URL` and `CLIENT_URL` in the Render dashboard.
- **Frontend → Vercel:** config in `client/vercel.json`. Set `VITE_SERVER_URL` to the backend URL.
- **Docker:** `docker compose up --build -d`.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/MONITORING.md](docs/MONITORING.md).

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Make sure `CLIENT_URL` on the server matches the frontend origin |
| Redis connection failed | Ensure Redis is running: `redis-cli ping` |
| Port already in use | Change `PORT` in `server/.env` or the Vite port |
| Code not syncing | Check the browser console for WebSocket errors and `VITE_SERVER_URL` |
| HTTP 429 responses | You hit the rate limiter (15-minute window). Wait, or adjust `server/src/rateLimiter.js` |

## Roadmap

- [ ] Multi-file / file tree support
- [ ] In-browser code execution
- [ ] Voice/video chat
- [ ] User authentication and private room passwords
- [ ] Export/download code

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes and push the branch
4. Open a Pull Request

## Acknowledgments

[Monaco Editor](https://microsoft.github.io/monaco-editor/) · [Socket.IO](https://socket.io/) · [Redis](https://redis.io/) · [Vite](https://vitejs.dev/)
