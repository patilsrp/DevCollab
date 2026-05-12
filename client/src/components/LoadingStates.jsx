// client/src/components/LoadingStates.jsx
import { useState, useEffect } from 'react';

// Spinner component
export function Spinner({ size = 40, color = '#4ECDC4' }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${color}22`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    >
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Full page loader
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#1e1e2e',
      color: 'white'
    }}>
      <Spinner size={50} />
      <p style={{ marginTop: '20px', color: '#888' }}>{message}</p>
    </div>
  );
}

// Skeleton loader for text
export function SkeletonText({ width = '100%', height = 20, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #2d2d3f 25%, #3d3d4f 50%, #2d2d3f 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '4px',
        ...style
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// Skeleton loader for user list
export function SkeletonUser() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '8px', gap: '10px' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#2d2d3f',
          animation: 'pulse 1.5s infinite'
        }}
      />
      <SkeletonText width="120px" height="16px" />
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// Button with loading state
export function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false,
  onClick,
  style = {},
  ...props 
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: '#4ECDC4',
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.6 : 1,
        transition: 'opacity 0.2s',
        ...style
      }}
      {...props}
    >
      {loading && <Spinner size={16} color="white" />}
      {children}
    </button>
  );
}

// Lazy load wrapper with loading state
export function LazyLoadWrapper({ children, delay = 300 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) {
    return <PageLoader />;
  }

  return children;
}

// Connection loading indicator
export function ConnectionLoader({ status = 'Connecting to server...' }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      background: '#2d2d3f',
      borderRadius: '8px'
    }}>
      <Spinner size={24} />
      <span style={{ color: '#888' }}>
        {status}{dots}
      </span>
    </div>
  );
}

// Progress bar
export function ProgressBar({ progress = 0, color = '#4ECDC4' }) {
  return (
    <div style={{
      width: '100%',
      height: '4px',
      background: '#2d2d3f',
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <div
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s ease',
          borderRadius: '2px'
        }}
      />
    </div>
  );
}

// Retry component
export function RetryError({ error, onRetry, message = 'Failed to load' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '30px',
      background: '#2d2d3f',
      borderRadius: '8px',
      border: '1px solid #444'
    }}>
      <span style={{ fontSize: '24px', marginBottom: '12px' }}>⚠️</span>
      <p style={{ color: '#ff6b6b', marginBottom: '8px' }}>{message}</p>
      {error && (
        <p style={{ color: '#666', fontSize: '12px', marginBottom: '16px' }}>
          {error.message || 'An unexpected error occurred'}
        </p>
      )}
      <button
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          background: '#4ECDC4',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        Retry
      </button>
    </div>
  );
}