// client/src/config.js

export const config = {
  // API
  serverUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:3001',

  // Feature flags
  enableCursors: import.meta.env.VITE_ENABLE_CURSORS !== 'false',
  enableChat: import.meta.env.VITE_ENABLE_CHAT !== 'false',
  enableLiveUsers: import.meta.env.VITE_ENABLE_LIVE_USERS !== 'false',

  // Performance
  codeDebounceMs: parseInt(import.meta.env.VITE_CODE_DEBOUNCE_MS, 10) || 300,
  cursorDebounceMs: parseInt(import.meta.env.VITE_CURSOR_DEBOUNCE_MS, 10) || 100,

  // Limits
  maxMessageLength: parseInt(import.meta.env.VITE_MAX_MESSAGE_LENGTH, 10) || 500,
  maxUsernameLength: parseInt(import.meta.env.VITE_MAX_USERNAME_LENGTH, 10) || 30,

  // Supported languages (for the editor selector)
  supportedLanguages: [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
  ],

  // Monaco editor options
  editorOptions: {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
    automaticLayout: true,
    scrollBeyondLastLine: false,
  },
};