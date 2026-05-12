// client/src/components/ConnectionStatus.jsx
import { useEffect, useState } from 'react';

export default function ConnectionStatus({ status }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Show indicator when disconnected or error
    if (status === 'disconnected' || status === 'error') {
      setShow(true);
    } else if (status === 'connected') {
      // Show briefly when reconnected
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [status]);
  
  if (!show && status === 'connected') return null;
  
  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          color: '#ffa500',
          text: 'Connecting...',
          icon: '⟳',
          animate: true
        };
      case 'connected':
        return {
          color: '#4ECDC4',
          text: 'Connected',
          icon: '✓',
          animate: false
        };
      case 'disconnected':
        return {
          color: '#ff6b6b',
          text: 'Disconnected - Attempting to reconnect...',
          icon: '⚠',
          animate: true
        };
      case 'error':
        return {
          color: '#ff6b6b',
          text: 'Connection error',
          icon: '✕',
          animate: false
        };
      default:
        return {
          color: '#888',
          text: 'Unknown',
          icon: '?',
          animate: false
        };
    }
  };
  
  const config = getStatusConfig();
  
  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '8px 16px',
      background: `${config.color}22`,
      border: `1px solid ${config.color}`,
      borderRadius: '4px',
      color: config.color,
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 1000,
      animation: show ? 'slideDown 0.3s ease' : 'none'
    }}>
      <span style={{
        display: 'inline-block',
        animation: config.animate ? 'spin 1s linear infinite' : 'none'
      }}>
        {config.icon}
      </span>
      <span>{config.text}</span>
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}