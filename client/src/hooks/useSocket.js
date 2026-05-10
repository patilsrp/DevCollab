// client/src/hooks/useSocket.js
import { useEffect, useState, useRef } from 'react';
import socket from '../socket';

export function useSocket(roomId, username) {
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [cursors, setCursors] = useState({});  // { socketId: { cursor, username, color } }
  const isLocalChange = useRef(false);

  useEffect(() => {
    if (!roomId || !username) return;

    // Connect and join the room
    socket.connect();
    socket.emit('join-room', { roomId, username });

    // ── INCOMING EVENTS ──────────────────────────────────────

    // Fired once when you first join — loads existing room state
    socket.on('room-joined', (room) => {
      setCode(room.code);
      setLanguage(room.language);
      setUsers(room.users);
    });

    // Someone else joined
    socket.on('user-joined', ({ users }) => setUsers(users));

    // Someone left
    socket.on('user-left', ({ users }) => setUsers(users));

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
      setCursors(prev => ({ ...prev, [socketId]: { cursor, username: cursorUsername } }));
    });

    // Cleanup: remove listeners when component unmounts
    return () => {
      socket.off('room-joined');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('receive-message');
      socket.off('cursor-update');
      socket.disconnect();
    };
  }, [roomId, username]);

  // ── OUTGOING ACTIONS ────────────────────────────────────────

  function handleCodeChange(newCode) {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return; // Don't re-emit code that came from the server
    }
    setCode(newCode);
    socket.emit('code-change', { roomId, code: newCode });
  }

  function handleLanguageChange(lang) {
    setLanguage(lang);
    socket.emit('language-change', { roomId, language: lang });
  }

  function sendMessage(message) {
    socket.emit('send-message', { roomId, message, username });
  }

  function handleCursorMove(cursor) {
    socket.emit('cursor-move', { roomId, cursor, username });
  }

  return {
    code, language, users, messages, cursors,
    handleCodeChange, handleLanguageChange, sendMessage, handleCursorMove
  };
}