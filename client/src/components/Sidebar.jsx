// client/src/components/Sidebar.jsx
import { useState, useRef, useEffect, useId } from 'react';
import { SkeletonUser } from './LoadingStates';

export default function Sidebar({ users, messages, onSendMessage, roomId }) {
  const [input, setInput] = useState('');
  const [copyAnnouncement, setCopyAnnouncement] = useState('');
  const messagesEndRef = useRef(null);
  const chatInputId = useId();
  const chatLogId = useId();

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

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopyAnnouncement('Room ID copied to clipboard');
      setTimeout(() => setCopyAnnouncement(''), 2000);
    } catch {
      setCopyAnnouncement('Failed to copy. Please copy manually.');
    }
  }

  return (
    <aside
      role="complementary"
      aria-label="Room info and chat"
      style={{
        width: '260px',
        background: '#252526',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #333',
      }}
    >
      {/* Room ID section */}
      <section aria-labelledby="room-id-heading" style={sectionStyle}>
        <h2 id="room-id-heading" style={sectionHeadingStyle}>
          Room ID
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <code style={{ color: '#4ECDC4', fontSize: '13px' }}>{roomId}</code>
          <button
            type="button"
            onClick={copyRoomId}
            aria-label={`Copy room ID ${roomId} to clipboard`}
            style={{
              background: '#3c3c3c',
              border: 'none',
              color: '#ddd',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Copy
          </button>
        </div>
        {/* Live region for copy confirmation */}
        <div role="status" aria-live="polite" className="sr-only">
          {copyAnnouncement}
        </div>
      </section>

      {/* Users section */}
      <section aria-labelledby="users-heading" style={sectionStyle}>
        <h2 id="users-heading" style={sectionHeadingStyle}>
          Users ({users.length})
        </h2>
        {users.length === 0 ? (
          <>
            <SkeletonUser />
            <SkeletonUser />
          </>
        ) : (
          <ul
            aria-label="Users currently in the room"
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {users.map((user) => (
              <li
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: user.color || '#4ECDC4',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#ddd', fontSize: '13px' }}>{user.username}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Chat log */}
      <section
        aria-labelledby="chat-heading"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <h2 id="chat-heading" style={{ ...sectionHeadingStyle, padding: '12px 16px 0' }}>
          Chat
        </h2>
        <div
          id={chatLogId}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Chat messages"
          style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 12px' }}
        >
          {messages.map((msg, i) => (
            <article
              key={i}
              aria-label={`Message from ${msg.username} at ${msg.timestamp}`}
              style={{ marginBottom: '8px' }}
            >
              <header style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ color: '#4ECDC4', fontSize: '12px', fontWeight: 700 }}>
                  {msg.username}
                </span>
                <time style={{ color: '#777', fontSize: '11px' }}>{msg.timestamp}</time>
              </header>
              <p style={{ color: '#ddd', fontSize: '13px', marginTop: '2px' }}>{msg.message}</p>
            </article>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* Chat input */}
      <form
        onSubmit={handleSend}
        aria-label="Send a chat message"
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #333',
          display: 'flex',
          gap: '8px',
        }}
      >
        <label htmlFor={chatInputId} className="sr-only">
          Type your message
        </label>
        <input
          id={chatInputId}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          aria-controls={chatLogId}
          autoComplete="off"
          style={{
            flex: 1,
            background: '#3c3c3c',
            border: '1px solid #555',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send message"
          style={{
            background: '#4ECDC4',
            border: 'none',
            color: '#0a0a0a',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Send
        </button>
      </form>
    </aside>
  );
}

const sectionStyle = { padding: '12px 16px', borderBottom: '1px solid #333' };

const sectionHeadingStyle = {
  color: '#aaa',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  margin: '0 0 8px',
};