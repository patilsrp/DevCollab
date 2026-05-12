// client/src/components/ConnectionMonitor.jsx
import { useEffect, useState } from 'react';
import { ProgressBar } from './LoadingStates';

export default function ConnectionMonitor({ 
  status, 
  connectionInfo = {}, 
  onReconnect,
  onCheckConnection 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Auto-expand on connection issues
  useEffect(() => {
    if (status === 'disconnected' || status === 'error' || status === 'reconnecting') {
      setIsExpanded(true);
    }
  }, [status]);

  const handleCheckConnection = async () => {
    if (isChecking || !onCheckConnection) return;
    
    setIsChecking(true);
    const isHealthy = await onCheckConnection();
    setLastCheck({
      time: new Date().toLocaleTimeString(),
      healthy: isHealthy
    });
    setIsChecking(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#4ECDC4';
      case 'connecting':
      case 'reconnecting':
        return '#ffa500';
      case 'disconnected':
      case 'error':
        return '#ff6b6b';
      default:
        return '#888';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'reconnecting':
        return '🔄';
      case 'disconnected':
        return '🔴';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  const reconnectProgress = connectionInfo.reconnectAttempts && connectionInfo.maxReconnectAttempts
    ? (connectionInfo.reconnectAttempts / connectionInfo.maxReconnectAttempts) * 100
    : 0;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#2d2d3f',
      border: `1px solid ${getStatusColor()}`,
      borderRadius: '8px',
      padding: '12px',
      minWidth: '200px',
      maxWidth: '350px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isExpanded ? '12px' : 0,
        cursor: 'pointer'
      }}
      onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{getStatusIcon()}</span>
          <span style={{ 
            color: getStatusColor(), 
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}>
            {status}
          </span>
        </div>
        
        <span style={{ 
          color: '#666', 
          fontSize: '12px',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{ fontSize: '12px' }}>
          {/* Reconnection Progress */}
          {status === 'reconnecting' && connectionInfo.reconnectAttempts > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                color: '#888',
                marginBottom: '4px'
              }}>
                <span>Reconnect Attempt</span>
                <span>
                  {connectionInfo.reconnectAttempts} / {connectionInfo.maxReconnectAttempts}
                </span>
              </div>
              <ProgressBar progress={reconnectProgress} color="#ffa500" />
              {connectionInfo.nextReconnectDelay && (
                <p style={{ color: '#666', marginTop: '4px' }}>
                  Next attempt in {Math.round(connectionInfo.nextReconnectDelay / 1000)}s
                </p>
              )}
            </div>
          )}

          {/* Connection Info */}
          <div style={{ color: '#888', marginBottom: '8px' }}>
            {connectionInfo.queuedEvents > 0 && (
              <p>📦 {connectionInfo.queuedEvents} queued events</p>
            )}
            
            {lastCheck && (
              <p style={{ marginTop: '4px' }}>
                Last check: {lastCheck.time} 
                <span style={{ 
                  marginLeft: '8px',
                  color: lastCheck.healthy ? '#4ECDC4' : '#ff6b6b'
                }}>
                  {lastCheck.healthy ? '✓' : '✗'}
                </span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #444'
          }}>
            {(status === 'disconnected' || status === 'error') && onReconnect && (
              <button
                onClick={onReconnect}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  background: '#4ECDC4',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Reconnect
              </button>
            )}
            
            {status === 'connected' && onCheckConnection && (
              <button
                onClick={handleCheckConnection}
                disabled={isChecking}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid #666',
                  borderRadius: '4px',
                  color: '#aaa',
                  fontSize: '12px',
                  cursor: isChecking ? 'not-allowed' : 'pointer',
                  opacity: isChecking ? 0.5 : 1
                }}
              >
                {isChecking ? 'Checking...' : 'Check Connection'}
              </button>
            )}
          </div>

          {/* Help Text */}
          {status === 'error' && (
            <p style={{ 
              color: '#ff6b6b', 
              fontSize: '11px',
              marginTop: '8px',
              lineHeight: '1.4'
            }}>
              Connection failed. Please check your internet connection and try again.
            </p>
          )}
          
          {status === 'reconnecting' && connectionInfo.reconnectAttempts >= connectionInfo.maxReconnectAttempts - 2 && (
            <p style={{ 
              color: '#ffa500', 
              fontSize: '11px',
              marginTop: '8px',
              lineHeight: '1.4'
            }}>
              Having trouble reconnecting. You may need to refresh the page.
            </p>
          )}
        </div>
      )}
    </div>
  );
}