// client/src/pages/HomePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, isValidRoomId, checkRoomExists } from '../utils/roomUtils';
import { config } from '../config';

export default function HomePage() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleCreateRoom() {
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
      // Create room with secure ID
      const result = await createRoom('secure');
      
      if (result.success) {
        sessionStorage.setItem('username', username);
        navigate(`/editor/${result.roomId}`);
      } else {
        setError('Failed to create room. Please try again.');
      }
    } catch (err) {
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
    
    // Validate room ID format
    if (!isValidRoomId(roomId)) {
      setError('Invalid room ID format');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Check if room exists
      const roomCheck = await checkRoomExists(roomId);
      
      if (!roomCheck.valid) {
        setError('Invalid room ID');
        return;
      }
      
      sessionStorage.setItem('username', username);
      navigate(`/editor/${roomId}`);
    } catch (err) {
      // If check fails, allow navigation anyway
      sessionStorage.setItem('username', username);
      navigate(`/editor/${roomId}`);
    } finally {
      setLoading(false);
    }
  }

  async function createFriendlyRoom() {
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create room with friendly code (easier to share)
      const result = await createRoom('friendly');
      
      if (result.success) {
        sessionStorage.setItem('username', username);
        navigate(`/editor/${result.roomId}`);
      }
    } catch (err) {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', height: '100vh', background: '#1e1e2e', color: 'white' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>DevCollab</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>Real-time collaborative code editor</p>

      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '1rem', padding: '8px 16px',
                      background: 'rgba(255, 107, 107, 0.1)', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <input
        placeholder="Your name"
        value={username}
        onChange={e => {
          setUsername(e.target.value);
          setError('');
        }}
        maxLength={config.maxUsernameLength}
        style={inputStyle}
        disabled={loading}
        onKeyPress={e => e.key === 'Enter' && handleCreateRoom()}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button 
          onClick={handleCreateRoom} 
          style={btnStyle('#4ECDC4')}
          disabled={loading}
        >
          {loading ? 'Creating...' : '+ Create Room'}
        </button>
        
        <button 
          onClick={createFriendlyRoom} 
          style={btnStyle('#96CEB4')}
          disabled={loading}
          title="Creates a room with an easy-to-share code"
        >
          Easy Share
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
        <input
          placeholder="Room ID"
          value={roomId}
          onChange={e => {
            setRoomId(e.target.value.trim());
            setError('');
          }}
          style={{ ...inputStyle, width: '200px', marginTop: 0 }}
          disabled={loading}
          onKeyPress={e => e.key === 'Enter' && handleJoinRoom()}
        />
        <button 
          onClick={handleJoinRoom} 
          style={btnStyle('#FF6B6B')}
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join Room'}
        </button>
      </div>
      
      <p style={{ color: '#666', marginTop: '2rem', fontSize: '0.9rem' }}>
        Room IDs are now cryptographically secure and expire after 24 hours
      </p>
    </div>
  );
}

const inputStyle = {
  padding: '12px 16px', borderRadius: '8px', border: '1px solid #444',
  background: '#2d2d3f', color: 'white', fontSize: '1rem', width: '300px',
  outline: 'none', marginTop: '0.5rem', transition: 'border-color 0.2s'
};

const btnStyle = (color) => ({
  padding: '12px 24px', background: color, border: 'none', borderRadius: '8px',
  color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold',
  transition: 'opacity 0.2s', opacity: 1,
  ':disabled': { opacity: 0.5, cursor: 'not-allowed' }
});