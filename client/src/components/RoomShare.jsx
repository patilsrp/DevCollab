// client/src/components/RoomShare.jsx
import { useState } from 'react';
import { copyRoomUrl, formatRoomUrl } from '../utils/roomUtils';

export default function RoomShare({ roomId }) {
  const [copied, setCopied] = useState(false);
  const roomUrl = formatRoomUrl(roomId);
  
  async function handleCopy() {
    const success = await copyRoomUrl(roomId);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
  
  return (
    <div style={{
      padding: '12px',
      background: '#2d2d3f',
      borderRadius: '8px',
      marginBottom: '16px'
    }}>
      <p style={{ 
        fontSize: '12px', 
        color: '#888',
        marginBottom: '8px'
      }}>
        Share this room:
      </p>
      
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <input
          value={roomId}
          readOnly
          style={{
            flex: 1,
            padding: '6px 10px',
            background: '#1e1e2e',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#4ECDC4',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}
          onClick={e => e.target.select()}
        />
        
        <button
          onClick={handleCopy}
          style={{
            padding: '6px 12px',
            background: copied ? '#96CEB4' : '#4ECDC4',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {copied ? '✓ Copied' : 'Copy URL'}
        </button>
      </div>
      
      <p style={{ 
        fontSize: '11px', 
        color: '#666',
        marginTop: '8px'
      }}>
        Room ID: <span style={{ fontFamily: 'monospace' }}>{roomId}</span>
      </p>
    </div>
  );
}