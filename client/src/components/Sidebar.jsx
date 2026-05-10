// client/src/components/Sidebar.jsx
import { useState, useRef, useEffect } from 'react';

export default function Sidebar({ users, messages, onSendMessage, roomId }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  }

  function copyRoomId() {
    navigator.clipboard.writeText(roomId);
    alert(`Room ID copied: ${roomId}`);
  }

  return (
    <div style={{ width: '260px', background: '#252526', display: 'flex',
                  flexDirection: 'column', borderLeft: '1px solid #333' }}>

      {/* Room ID */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #333' }}>
        <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>ROOM ID</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <code style={{ color: '#4ECDC4', fontSize: '13px' }}>{roomId}</code>
          <button onClick={copyRoomId}
            style={{ background: '#3c3c3c', border: 'none', color: '#ccc',
                     padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
            Copy
          </button>
        </div>
      </div>

      {/* Users in Room */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #333' }}>
        <div style={{ color: '#888', fontSize: '11px', marginBottom: '8px' }}>
          USERS ({users.length})
        </div>
        {users.map(user => (
          <div key={user.id} style={{ display: 'flex', alignItems: 'center',
                                      gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                          background: user.color || '#4ECDC4' }} />
            <span style={{ color: '#ccc', fontSize: '13px' }}>{user.username}</span>
          </div>
        ))}
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        <div style={{ color: '#888', fontSize: '11px', marginBottom: '8px' }}>CHAT</div>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <span style={{ color: '#4ECDC4', fontSize: '12px', fontWeight: 'bold' }}>
              {msg.username}
            </span>
            <span style={{ color: '#555', fontSize: '11px', marginLeft: '6px' }}>
              {msg.timestamp}
            </span>
            <div style={{ color: '#ccc', fontSize: '13px', marginTop: '2px' }}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend}
            style={{ padding: '12px 16px', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Message..."
          style={{ flex: 1, background: '#3c3c3c', border: '1px solid #555', color: 'white',
                   padding: '8px', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
        <button type="submit"
          style={{ background: '#4ECDC4', border: 'none', color: 'white',
                   padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
          →
        </button>
      </form>
    </div>
  );
}