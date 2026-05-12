// client/src/hooks/useSocket.js
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import socket from '../socket';
import { debounce, throttle } from '../utils/debounce';
import { config } from '../config';

export function useSocket(roomId, username) {
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [cursors, setCursors] = useState({});  // { socketId: { cursor, username, color } }
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const isLocalChange = useRef(false);
  const cursorCleanupTimer = useRef(null);

  // Create debounced/throttled functions with proper cleanup
  const debouncedCodeEmit = useMemo(
    () => debounce((roomId, code) => {
      socket.emit('code-change', { roomId, code });
    }, config.codeDebounceMs || 300, { 
      leading: false, 
      trailing: true,
      maxWait: 1000 // Force emit at least every second
    }),
    []
  );

  const throttledCursorEmit = useMemo(
    () => throttle((roomId, cursor, username) => {
      socket.emit('cursor-move', { roomId, cursor, username });
    }, config.cursorDebounceMs || 100, {
      leading: true,
      trailing: true
    }),
    []
  );

  // Clean up stale cursors periodically
  useEffect(() => {
    cursorCleanupTimer.current = setInterval(() => {
      setCursors(prev => {
        const now = Date.now();
        const filtered = {};
        Object.entries(prev).forEach(([id, data]) => {
          // Keep cursors that were updated in the last 10 seconds
          if (data.lastUpdate && now - data.lastUpdate < 10000) {
            filtered[id] = data;
          }
        });
        return filtered;
      });
    }, 5000); // Clean every 5 seconds

    return () => {
      if (cursorCleanupTimer.current) {
        clearInterval(cursorCleanupTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!roomId || !username) return;

    // Connect and join the room
    socket.connect();
    socket.emit('join-room', { roomId, username });

    // ── CONNECTION STATUS ───────────────────────────────────────
    socket.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      console.log('Disconnected from server');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('error');
      console.error('Connection error');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // ── INCOMING EVENTS ──────────────────────────────────────

    // Fired once when you first join — loads existing room state
    socket.on('room-joined', (room) => {
      setCode(room.code);
      setLanguage(room.language);
      setUsers(room.users);
      setConnectionStatus('connected');
    });

    // Someone else joined
    socket.on('user-joined', ({ users }) => setUsers(users));

    // Someone left
    socket.on('user-left', ({ users, socketId }) => {
      setUsers(users);
      // Remove the user's cursor
      setCursors(prev => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
    });

    // Someone else changed the code
    socket.on('code-update', (newCode) => {
      isLocalChange.current = true;  // Prevent re-emitting our own received update
      setCode(newCode);
    });

    // Someone changed the language
    socket.on('language-update', setLanguage);

    // Chat message received
    socket.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    // Cursor update from another user
    socket.on('cursor-update', ({ socketId, cursor, username: cursorUsername }) => {
      setCursors(prev => ({ 
        ...prev, 
        [socketId]: { 
          cursor, 
          username: cursorUsername, 
          lastUpdate: Date.now() 
        } 
      }));
    });

    // Cleanup: remove listeners when component unmounts
    return () => {
      // Cancel any pending debounced calls
      debouncedCodeEmit.cancel();
      throttledCursorEmit.cancel();
      
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('error');
      socket.off('room-joined');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('receive-message');
      socket.off('cursor-update');
      socket.disconnect();
    };
  }, [roomId, username, debouncedCodeEmit, throttledCursorEmit]);

  // ── OUTGOING ACTIONS ────────────────────────────────────────

  const handleCodeChange = useCallback((newCode) => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return; // Don't re-emit code that came from the server
    }
    
    // Update local state immediately for responsive UI
    setCode(newCode);
    
    // Debounce the socket emission
    debouncedCodeEmit(roomId, newCode);
  }, [roomId, debouncedCodeEmit]);

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    socket.emit('language-change', { roomId, language: lang });
  }, [roomId]);

  const sendMessage = useCallback((message) => {
    if (!message || message.trim().length === 0) return;
    if (message.length > config.maxMessageLength) {
      console.error('Message too long');
      return;
    }
    socket.emit('send-message', { roomId, message, username });
  }, [roomId, username]);

  const handleCursorMove = useCallback((cursor) => {
    // Throttle cursor position updates
    throttledCursorEmit(roomId, cursor, username);
  }, [roomId, username, throttledCursorEmit]);

  // Force flush pending changes (useful before leaving page)
  const flushPendingChanges = useCallback(() => {
    debouncedCodeEmit.flush();
    throttledCursorEmit.flush();
  }, [debouncedCodeEmit, throttledCursorEmit]);

  return {
    code, 
    language, 
    users, 
    messages, 
    cursors,
    connectionStatus,
    handleCodeChange, 
    handleLanguageChange, 
    sendMessage, 
    handleCursorMove,
    flushPendingChanges
  };
}