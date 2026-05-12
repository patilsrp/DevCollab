// server/src/types/index.ts

// User types
export interface User {
  id: string;
  socketId: string;
  username: string;
  color: string;
  joinedAt?: number;
}

// Room types
export interface Room {
  id: string;
  code: string;
  language: string;
  users: User[];
  createdAt: number;
  lastModified?: number;
}

// Socket event types
export interface SocketEvents {
  // Client to Server
  'join-room': (data: JoinRoomData) => void;
  'code-change': (data: CodeChangeData) => void;
  'language-change': (data: LanguageChangeData) => void;
  'send-message': (data: SendMessageData) => void;
  'cursor-move': (data: CursorMoveData) => void;
  
  // Server to Client
  'room-joined': (room: Room) => void;
  'user-joined': (data: { user: User; users: User[] }) => void;
  'user-left': (data: { socketId: string; users: User[] }) => void;
  'code-update': (code: string) => void;
  'language-update': (language: string) => void;
  'receive-message': (message: ChatMessage) => void;
  'cursor-update': (data: CursorUpdate) => void;
  'error': (error: ErrorMessage) => void;
}

// Event data types
export interface JoinRoomData {
  roomId: string;
  username: string;
}

export interface CodeChangeData {
  roomId: string;
  code: string;
}

export interface LanguageChangeData {
  roomId: string;
  language: string;
}

export interface SendMessageData {
  roomId: string;
  message: string;
  username: string;
}

export interface CursorMoveData {
  roomId: string;
  cursor: CursorPosition;
  username: string;
}

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

export interface CursorPosition {
  line: number;
  column: number;
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

export interface CursorUpdate {
  socketId: string;
  cursor: CursorPosition;
  username: string;
}

export interface ErrorMessage {
  message: string;
  errors?: string[];
  code?: string;
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface CreateRoomRequest {
  type?: 'secure' | 'friendly' | 'timed';
}

export interface CreateRoomResponse {
  roomId: string;
  roomUrl: string;
  createdAt: number;
}

export interface ValidateRoomResponse {
  valid: boolean;
  exists?: boolean;
  userCount?: number;
  error?: string;
}

export interface RoomInfoResponse {
  id: string;
  userCount: number;
  language: string;
  createdAt: number;
  lastModified?: number;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: any;
}

// Rate limit types
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Config types
export interface ServerConfig {
  port: number;
  nodeEnv: string;
  isDevelopment: boolean;
  clientUrl: string;
  redisUrl: string;
  sessionSecret: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  roomExpirySeconds: number;
  maxRoomSize: number;
  maxCodeLength: number;
  supportedLanguages: string[];
  defaultRoom: {
    code: string;
    language: string;
  };
}