// client/src/pages/HomePage.jsx
import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, isValidRoomId, checkRoomExists } from '../utils/roomUtils';
import { config } from '../config';

export default function HomePage() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const usernameId = useId();
  const roomIdInputId = useId();
  const errorId = useId();

  async function handleCreateRoom(type = 'secure') {
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }

    if (username.length > config.maxUsernameLength) {
      setError(`Username must be less than ${config.maxUsernameLength} characters`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createRoom(type);

      if (result.success) {
        sessionStorage.setItem('username', username);
        navigate(`/editor/${result.roomId}`);
      } else {
        setError('Failed to create room. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom() {
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    if (username.length > config.maxUsernameLength) {
      setError(`Username must be less than ${config.maxUsernameLength} characters`);
      return;
    }

    if (!isValidRoomId(roomId)) {
      setError('Invalid room ID format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const roomCheck = await checkRoomExists(roomId);

      if (!roomCheck.valid) {
        setError('Invalid room ID');
        return;
      }

      sessionStorage.setItem('username', username);
      navigate(`/editor/${roomId}`);
    } catch {
      sessionStorage.setItem('username', username);
      navigate(`/editor/${roomId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      id="main-content"
      role="main"
      aria-labelledby="app-heading"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#1e1e2e',
        color: 'white',
        padding: '1rem',
      }}
    >
      <h1 id="app-heading" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
        DevCollab
      </h1>
      <p style={{ color: '#bbb', marginBottom: '2rem' }}>
        Real-time collaborative code editor
      </p>

      {/* Live region announces errors to screen readers */}
      <div
        id={errorId}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        style={{
          minHeight: error ? 'auto' : 0,
          color: '#ff8a8a',
          marginBottom: error ? '1rem' : 0,
          padding: error ? '8px 16px' : 0,
          background: error ? 'rgba(255, 107, 107, 0.15)' : 'transparent',
          borderRadius: '4px',
        }}
      >
        {error}
      </div>

      {/* Create-room section */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateRoom('secure');
        }}
        aria-label="Create or join a collaboration room"
        style={{ width: '100%', maxWidth: '360px' }}
      >
        <label
          htmlFor={usernameId}
          style={{ display: 'block', fontSize: '0.85rem', color: '#bbb', marginBottom: '4px' }}
        >
          Your name
        </label>
        <input
          id={usernameId}
          type="text"
          autoComplete="nickname"
          placeholder="e.g. Jane Doe"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError('');
          }}
          maxLength={config.maxUsernameLength}
          aria-invalid={!!error && !username.trim()}
          aria-describedby={error ? errorId : undefined}
          aria-required="true"
          required
          disabled={loading}
          style={{ ...inputStyle, width: '100%' }}
        />

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            aria-label="Create a new room with a secure ID"
            style={btnStyle('#4ECDC4')}
          >
            {loading ? 'Creating…' : '+ Create Room'}
          </button>

          <button
            type="button"
            onClick={() => handleCreateRoom('friendly')}
            disabled={loading}
            aria-label="Create a room with an easy-to-share code"
            style={btnStyle('#96CEB4')}
          >
            Easy Share
          </button>
        </div>
      </form>

      {/* Join-room section */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleJoinRoom();
        }}
        aria-label="Join an existing room"
        style={{ width: '100%', maxWidth: '360px', marginTop: '2rem' }}
      >
        <label
          htmlFor={roomIdInputId}
          style={{ display: 'block', fontSize: '0.85rem', color: '#bbb', marginBottom: '4px' }}
        >
          Room ID
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            id={roomIdInputId}
            type="text"
            placeholder="Paste a room ID"
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value.trim());
              setError('');
            }}
            disabled={loading}
            aria-invalid={!!error && !isValidRoomId(roomId) && !!roomId}
            aria-describedby={error ? errorId : undefined}
            style={{ ...inputStyle, flex: 1, marginTop: 0 }}
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Join the room with the entered ID"
            style={btnStyle('#FF6B6B')}
          >
            {loading ? 'Joining…' : 'Join'}
          </button>
        </div>
      </form>

      <p style={{ color: '#888', marginTop: '2rem', fontSize: '0.85rem' }}>
        Room IDs are cryptographically secure and expire after 24 hours.
      </p>
    </main>
  );
}

const inputStyle = {
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #555',
  background: '#2d2d3f',
  color: 'white',
  fontSize: '1rem',
  outline: 'none',
  marginTop: '0.25rem',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const btnStyle = (color) => ({
  padding: '12px 20px',
  background: color,
  border: 'none',
  borderRadius: '8px',
  color: '#0a0a0a',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 700,
  transition: 'opacity 0.15s, transform 0.05s',
});