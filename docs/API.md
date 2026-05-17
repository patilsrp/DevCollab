# DevCollab API Documentation

## Overview

DevCollab exposes both a REST API for room management and a Socket.IO interface for real-time collaboration.

- **Interactive docs (Swagger UI):** `http://localhost:3001/api-docs`
- **OpenAPI JSON spec:** `http://localhost:3001/api-docs.json`
- **Socket.IO events:** `http://localhost:3001/api-docs/socket`

## Base URL

| Environment | URL |
| --- | --- |
| Development | `http://localhost:3001` |
| Production | `https://api.devcollab.example.com` |

---

## REST API

### Create Room

`POST /api/rooms/create`

Creates a new collaborative room with a secure room ID.

**Request body** (optional):
```json
{
  "type": "secure" | "friendly" | "timed"
}
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | string | `secure` | Room ID type. `secure` (10 chars), `friendly` (6 chars, easy to share), `timed` (includes timestamp). |

**Response** `200 OK`:
```json
{
  "success": true,
  "roomId": "AbCdEf1234",
  "roomUrl": "/editor/AbCdEf1234",
  "createdAt": 1700000000000
}
```

**Rate limit:** 20 requests per 15 minutes per IP.

---

### Validate Room

`GET /api/rooms/validate/:roomId`

Checks whether a room ID has a valid format and whether the room exists.

**Response** `200 OK`:
```json
{
  "valid": true,
  "exists": true,
  "userCount": 3
}
```

**Response** `400 Bad Request`:
```json
{
  "valid": false,
  "error": "Invalid room ID format"
}
```

---

### Get Room Info

`GET /api/rooms/:roomId/info`

Retrieves metadata about a room without joining it.

**Response** `200 OK`:
```json
{
  "success": true,
  "room": {
    "id": "AbCdEf1234",
    "userCount": 3,
    "language": "javascript",
    "createdAt": 1700000000000,
    "lastModified": 1700000300000
  }
}
```

---

### Health Check

`GET /health`

Returns server status and uptime.

**Response** `200 OK`:
```json
{
  "status": "ok",
  "timestamp": "2026-05-17T12:00:00.000Z",
  "uptime": 12345.678
}
```

---

## Socket.IO Events

Connect to the server via Socket.IO at the base URL. Authentication is not required (rooms are accessed via secure room IDs).

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001');
```

### Client → Server Events

#### `join-room`
Join a collaborative room. The server responds with `room-joined` containing the current room state.

```js
socket.emit('join-room', { roomId: 'AbCdEf1234', username: 'johndoe' });
```

| Field | Type | Constraints |
| --- | --- | --- |
| `roomId` | string | 3-50 chars, alphanumeric + `-`, `_` |
| `username` | string | 2-30 chars, alphanumeric + space, `-`, `_` |

**Rate limit:** 5 per 60 seconds

---

#### `code-change`
Broadcast code changes to other users in the room.

```js
socket.emit('code-change', { roomId, code });
```

| Field | Type | Constraints |
| --- | --- | --- |
| `roomId` | string | Valid room ID |
| `code` | string | Max 100,000 characters |

**Rate limit:** 100 per 10 seconds. The client SHOULD debounce typing (default 300ms).

---

#### `language-change`
Change the programming language for the room.

```js
socket.emit('language-change', { roomId, language: 'python' });
```

**Supported languages:** `javascript`, `typescript`, `python`, `java`, `cpp`, `go`, `rust`, `html`, `css`

**Rate limit:** 10 per 60 seconds

---

#### `send-message`
Send a chat message to all users in the room.

```js
socket.emit('send-message', { roomId, message, username });
```

| Field | Type | Constraints |
| --- | --- | --- |
| `message` | string | 1-500 chars |

**Rate limit:** 30 per 60 seconds

---

#### `cursor-move`
Broadcast cursor position to other users.

```js
socket.emit('cursor-move', { roomId, cursor: { line, column }, username });
```

**Rate limit:** 200 per 10 seconds. The client SHOULD throttle (default 100ms).

---

#### `ping`
Connection health check. Server responds via callback with latency info.

```js
socket.emit('ping', Date.now(), ({ timestamp, latency, serverTime }) => {
  console.log('Latency:', latency, 'ms');
});
```

---

### Server → Client Events

| Event | Payload | Description |
| --- | --- | --- |
| `room-joined` | `Room` | Sent once on successful join with full room state |
| `user-joined` | `{ user, users }` | A new user joined the room |
| `user-left` | `{ socketId, users }` | A user left the room |
| `code-update` | `string` (code) | Code was modified by another user |
| `language-update` | `string` (language) | Language was changed |
| `receive-message` | `ChatMessage` | New chat message |
| `cursor-update` | `{ socketId, cursor, username }` | Another user's cursor moved |
| `error` | `{ message, errors? }` | Validation failure or rate limit exceeded |

---

## Data Models

### Room
```ts
{
  id: string;
  code: string;
  language: string;
  users: User[];
  createdAt: number;
  lastModified?: number;
}
```

### User
```ts
{
  id: string;
  socketId: string;
  username: string;
  color: string;
  joinedAt?: number;
}
```

### ChatMessage
```ts
{
  username: string;
  message: string;
  timestamp: string;
}
```

---

## Rate Limiting

- **REST API:** 100 requests per 15 minutes per IP (general), 20 requests per 15 minutes (sensitive endpoints like room creation).
- **Socket events:** Per-event limits as documented above. Exceeding a limit results in an `error` event being emitted to the offending client.

## Error Format

All errors follow this shape:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "errors": ["Optional list of validation errors"]
}
```

## Rooms Lifecycle

- Rooms are created on demand when a user joins or when explicitly created via the API.
- Rooms automatically expire after **24 hours** of inactivity.
- Room data is stored in Redis (production) or in-memory (development fallback).