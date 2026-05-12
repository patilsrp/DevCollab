// client/src/hooks/useSocketWithRetry.js
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { socketManager, ConnectionState } from '../utils/socketManager';
import { debounce, throttle } from '../utils/debounce';
import { config } from '../config';

export function useSocketWithRetry(roomId, username) {
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [cursors, setCursors] = useState({});
  const [connectionStatus, setConnectionStatus] = useState(ConnectionState.CONNECTING);
  const [connectionInfo, setConnectionInfo] = useState({});
  
  const isLocalChange = useRef(false);
  const hasJoinedRoom = useRef(false);
  const reconnectTimer = useRef(null);

  // Create debounced/throttled functions
  const debouncedCodeEmit = useMemo(
    () => debounce((roomId, code) => {
      socketManager.emit('code-change', { roomId, code });
    }, config.codeDebounceMs || 300, { 
      leading: false, 
      trailing: true,
      maxWait: 1000
    }),
    []
  );

  const throttledCursorEmit = useMemo(
    () => throttle((roomId, cursor, username) => {
      socketManager.emit('cursor-move', { roomId, cursor, username });
    }, config.cursorDebounceMs || 100, {
      leading: true,
      trailing: true
    }),
    []
  );

  // Setup socket connection and event listeners
  useEffect(() => {
    if (!roomId || !username) return;

    let mounted = true;

    const setupSocket = async () => {
      try {
        // Connect to socket
        await socketManager.connect({ autoConnect: false });
        
        if (!mounted) return;

        // Setup event listeners
        socketManager.on('connect', () => {
          if (!mounted) return;
          setConnectionStatus(ConnectionState.CONNECTED);
          setConnectionInfo(socketManager.getConnectionInfo());
          
          // Rejoin room if was previously joined
          if (hasJoinedRoom.current) {
            socketManager.emit('join-room', { roomId, username });
          }
        });

        socketManager.on('disconnect', () => {
          if (!mounted) return;
          setConnectionStatus(ConnectionState.DISCONNECTED);
          setConnectionInfo(socketManager.getConnectionInfo());
          
          // Schedule reconnection check
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
          }
          
          reconnectTimer.current = setTimeout(() => {
            if (!socketManager.isConnected && mounted) {
              setConnectionStatus(ConnectionState.RECONNECTING);
              socketManager.forceReconnect();
            }
          }, 3000);
        });

        socketManager.on('connect_error', (error) => {
          if (!mounted) return;
          console.error('Connection error:', error);
          setConnectionStatus(ConnectionState.ERROR);
          setConnectionInfo(socketManager.getConnectionInfo());
        });

        socketManager.on('reconnecting', (attemptNumber) => {
          if (!mounted) return;
          setConnectionStatus(ConnectionState.RECONNECTING);
          setConnectionInfo({
            ...socketManager.getConnectionInfo(),
            attemptNumber
          });
        });

        socketManager.on('reconnect', () => {
          if (!mounted) return;
          setConnectionStatus(ConnectionState.CONNECTED);
          setConnectionInfo(socketManager.getConnectionInfo());
          
          // Rejoin room after reconnection
          if (hasJoinedRoom.current) {
            socketManager.emit('join-room', { roomId, username });
          }
        });

        socketManager.on('error', (error) => {
          if (!mounted) return;
          console.error('Socket error:', error);
        });

        // Room events
        socketManager.on('room-joined', (room) => {
          if (!mounted) return;
          hasJoinedRoom.current = true;
          setCode(room.code);
          setLanguage(room.language);
          setUsers(room.users);
          setConnectionStatus(ConnectionState.CONNECTED);
        });

        socketManager.on('user-joined', ({ users }) => {
          if (!mounted) return;
          setUsers(users);
        });

        socketManager.on('user-left', ({ users, socketId }) => {
          if (!mounted) return;
          setUsers(users);
          setCursors(prev => {
            const updated = { ...prev };
            delete updated[socketId];
            return updated;
          });
        });

        socketManager.on('code-update', (newCode) => {
          if (!mounted) return;
          isLocalChange.current = true;
          setCode(newCode);
        });

        socketManager.on('language-update', (newLanguage) => {
          if (!mounted) return;
          setLanguage(newLanguage);
        });

        socketManager.on('receive-message', (msg) => {
          if (!mounted) return;
          setMessages(prev => [...prev, msg]);
        });

        socketManager.on('cursor-update', ({ socketId, cursor, username: cursorUsername }) => {
          if (!mounted) return;
          setCursors(prev => ({ 
            ...prev, 
            [socketId]: { 
              cursor, 
              username: cursorUsername, 
              lastUpdate: Date.now() 
            } 
          }));
        });

        // Join room
        socketManager.emit('join-room', { roomId, username });

      } catch (error) {
        console.error('Failed to setup socket:', error);
        if (mounted) {
          setConnectionStatus(ConnectionState.ERROR);
        }
      }
    };

    setupSocket();

    // Cleanup
    return () => {
      mounted = false;
      hasJoinedRoom.current = false;
      
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      
      // Cancel pending operations
      debouncedCodeEmit.cancel();
      throttledCursorEmit.cancel();
      
      // Remove event listeners
      socketManager.off('connect');
      socketManager.off('disconnect');
      socketManager.off('connect_error');
      socketManager.off('reconnecting');
      socketManager.off('reconnect');
      socketManager.off('error');
      socketManager.off('room-joined');
      socketManager.off('user-joined');
      socketManager.off('user-left');
      socketManager.off('code-update');
      socketManager.off('language-update');
      socketManager.off('receive-message');
      socketManager.off('cursor-update');
      
      socketManager.disconnect();
    };
  }, [roomId, username, debouncedCodeEmit, throttledCursorEmit]);

  // Outgoing actions
  const handleCodeChange = useCallback((newCode) => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }
    
    setCode(newCode);
    debouncedCodeEmit(roomId, newCode);
  }, [roomId, debouncedCodeEmit]);

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    socketManager.emit('language-change', { roomId, language: lang });
  }, [roomId]);

  const sendMessage = useCallback((message) => {
    if (!message || message.trim().length === 0) return;
    if (message.length > config.maxMessageLength) {
      console.error('Message too long');
      return;
    }
    socketManager.emit('send-message', { roomId, message, username });
  }, [roomId, username]);

  const handleCursorMove = useCallback((cursor) => {
    throttledCursorEmit(roomId, cursor, username);
  }, [roomId, username, throttledCursorEmit]);

  const flushPendingChanges = useCallback(() => {
    debouncedCodeEmit.flush();
    throttledCursorEmit.flush();
  }, [debouncedCodeEmit, throttledCursorEmit]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    setConnectionStatus(ConnectionState.RECONNECTING);
    return socketManager.forceReconnect();
  }, []);

  // Check connection health
  const checkConnection = useCallback(async () => {
    const isHealthy = await socketManager.checkConnection();
    if (!isHealthy && connectionStatus === ConnectionState.CONNECTED) {
      reconnect();
    }
    return isHealthy;
  }, [connectionStatus, reconnect]);

  return {
    code,
    language,
    users,
    messages,
    cursors,
    connectionStatus,
    connectionInfo,
    handleCodeChange,
    handleLanguageChange,
    sendMessage,
    handleCursorMove,
    flushPendingChanges,
    reconnect,
    checkConnection
  };
}