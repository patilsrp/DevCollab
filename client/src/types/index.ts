// client/src/types/index.ts

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

// Message types
export interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

// Cursor types
export interface CursorPosition {
  line: number;
  column: number;
  selection?: Selection;
}

export interface Selection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface CursorData {
  cursor: CursorPosition;
  username: string;
  lastUpdate?: number;
}

// Connection types
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Socket hook types
export interface UseSocketReturn {
  code: string;
  language: string;
  users: User[];
  messages: ChatMessage[];
  cursors: Record<string, CursorData>;
  connectionStatus: ConnectionStatus;
  handleCodeChange: (code: string) => void;
  handleLanguageChange: (language: string) => void;
  sendMessage: (message: string) => void;
  handleCursorMove: (cursor: CursorPosition) => void;
  flushPendingChanges: () => void;
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface CreateRoomResponse {
  success: boolean;
  roomId: string;
  roomUrl: string;
  createdAt: number;
}

export interface ValidateRoomResponse {
  valid: boolean;
  exists: boolean;
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

// Component prop types
export interface EditorProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  onCursorChange: (cursor: CursorPosition) => void;
}

export interface SidebarProps {
  users: User[];
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  roomId: string;
}

export interface ConnectionStatusProps {
  status: ConnectionStatus;
}

export interface RoomShareProps {
  roomId: string;
}

// Config types
export interface ClientConfig {
  serverUrl: string;
  enableCursors: boolean;
  enableChat: boolean;
  enableLiveUsers: boolean;
  codeDebounceMs: number;
  cursorDebounceMs: number;
  maxMessageLength: number;
  maxUsernameLength: number;
  supportedLanguages: Array<{
    value: string;
    label: string;
  }>;
  editorOptions: {
    minimap: { enabled: boolean };
    fontSize: number;
    lineNumbers: string;
    wordWrap: string;
    automaticLayout: boolean;
    scrollBeyondLastLine: boolean;
  };
}

// Utility types
export type RoomType = 'secure' | 'friendly' | 'timed';

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  pending: () => boolean;
}