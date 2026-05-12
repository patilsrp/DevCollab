/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string;
  readonly VITE_ENABLE_CURSORS: string;
  readonly VITE_ENABLE_CHAT: string;
  readonly VITE_ENABLE_LIVE_USERS: string;
  readonly VITE_CODE_DEBOUNCE_MS: string;
  readonly VITE_CURSOR_DEBOUNCE_MS: string;
  readonly VITE_MAX_MESSAGE_LENGTH: string;
  readonly VITE_MAX_USERNAME_LENGTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}