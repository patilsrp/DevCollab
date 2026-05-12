// shared/types.ts - Shared types between client and server

// User and Room types
export interface IUser {
  id: string;
  socketId: string;
  username: string;
  color: string;
  joinedAt?: number;
}

export interface IRoom {
  id: string;
  code: string;
  language: string;
  users: IUser[];
  createdAt: number;
  lastModified?: number;
}

// Socket Events
export interface ServerToClientEvents {
  'room-joined': (room: IRoom) => void;
  'user-joined': (data: { user: IUser; users: IUser[] }) => void;
  'user-left': (data: { socketId: string; users: IUser[] }) => void;
  'code-update': (code: string) => void;
  'language-update': (language: string) => void;
  'receive-message': (message: IChatMessage) => void;
  'cursor-update': (data: ICursorUpdate) => void;
  'error': (error: IErrorMessage) => void;
  'connect': () => void;
  'disconnect': () => void;
  'connect_error': (error: Error) => void;
}

export interface ClientToServerEvents {
  'join-room': (data: IJoinRoomData) => void;
  'code-change': (data: ICodeChangeData) => void;
  'language-change': (data: ILanguageChangeData) => void;
  'send-message': (data: ISendMessageData) => void;
  'cursor-move': (data: ICursorMoveData) => void;
}

// Event Data Interfaces
export interface IJoinRoomData {
  roomId: string;
  username: string;
}

export interface ICodeChangeData {
  roomId: string;
  code: string;
}

export interface ILanguageChangeData {
  roomId: string;
  language: string;
}

export interface ISendMessageData {
  roomId: string;
  message: string;
  username: string;
}

export interface ICursorMoveData {
  roomId: string;
  cursor: ICursorPosition;
  username: string;
}

// Supporting types
export interface IChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

export interface ICursorPosition {
  line: number;
  column: number;
  selection?: ISelection;
}

export interface ISelection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface ICursorUpdate {
  socketId: string;
  cursor: ICursorPosition;
  username: string;
}

export interface IErrorMessage {
  message: string;
  errors?: string[];
  code?: string;
}

// API Response types
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface ICreateRoomResponse {
  roomId: string;
  roomUrl: string;
  createdAt: number;
}

export interface IValidateRoomResponse {
  valid: boolean;
  exists: boolean;
  userCount?: number;
  error?: string;
}

export interface IRoomInfoResponse {
  id: string;
  userCount: number;
  language: string;
  createdAt: number;
  lastModified?: number;
}

// Supported languages
export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'go',
  'rust',
  'html',
  'css'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Room types
export type RoomIdType = 'secure' | 'friendly' | 'timed';

// Connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';