// client/src/pages/HomePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  function createRoom() {
    if (!username.trim()) return alert('Please enter your name');
    const newRoomId = uuidv4().slice(0, 8); // Short 8-char room ID
    // Store username in sessionStorage so EditorPage can read it
    sessionStorage.setItem('username', username);
    navigate(`/editor/${newRoomId}`);
  }

  function joinRoom() {
    if (!username.trim()) return alert('Please enter your name');
    if (!roomId.trim()) return alert('Please enter a room ID');
    sessionStorage.setItem('username', username);
    navigate(`/editor/${roomId}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', height: '100vh', background: '#1e1e2e', color: 'white' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>DevCollab</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>Real-time collaborative code editor</p>

      <input
        placeholder="Your name"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={inputStyle}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={createRoom} style={btnStyle('#4ECDC4')}>
          + Create Room
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
        <input
          placeholder="Room ID"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          style={{ ...inputStyle, width: '200px', marginTop: 0 }}
        />
        <button onClick={joinRoom} style={btnStyle('#FF6B6B')}>
          Join Room
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '12px 16px', borderRadius: '8px', border: '1px solid #444',
  background: '#2d2d3f', color: 'white', fontSize: '1rem', width: '300px',
  outline: 'none', marginTop: '0.5rem'
};

const btnStyle = (color) => ({
  padding: '12px 24px', background: color, border: 'none', borderRadius: '8px',
  color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold'
});