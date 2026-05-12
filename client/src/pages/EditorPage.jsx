// client/src/pages/EditorPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import ConnectionStatus from '../components/ConnectionStatus';
import { ConnectionLoader, RetryError } from '../components/LoadingStates';
import ErrorBoundary from '../components/ErrorBoundary';
import { useSocket } from '../hooks/useSocket';
import { useDelayedLoading } from '../hooks/useAsyncData';

export default function EditorPage() {
  const { roomId } = useParams();  // Gets roomId from the URL
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');

  // If someone navigates directly without a username, send them to home
  if (!username) {
    navigate('/');
    return null;
  }

  const [initialLoad, setInitialLoad] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  
  const {
    code, language, users, messages, cursors, connectionStatus,
    handleCodeChange, handleLanguageChange, sendMessage, handleCursorMove, flushPendingChanges
  } = useSocket(roomId, username);
  
  const showLoading = useDelayedLoading(initialLoad && connectionStatus === 'connecting', 500);
  
  // Track initial connection
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setInitialLoad(false);
      setConnectionError(null);
    } else if (connectionStatus === 'error') {
      setInitialLoad(false);
      setConnectionError(new Error('Failed to connect to server'));
    }
  }, [connectionStatus]);
  
  // Flush pending changes before page unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      flushPendingChanges();
      // Optionally show a warning if there are pending changes
      if (connectionStatus === 'connected') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushPendingChanges();
    };
  }, [flushPendingChanges, connectionStatus]);

  // Show loading state during initial connection
  if (showLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1e1e1e'
      }}>
        <ConnectionLoader status={`Joining room ${roomId}...`} />
      </div>
    );
  }
  
  // Show error state if connection failed
  if (connectionError && connectionStatus === 'error') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1e1e1e'
      }}>
        <RetryError 
          error={connectionError}
          message="Failed to join room"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh',
                    background: '#1e1e1e', color: 'white' }}>
        
        {/* Connection Status Indicator */}
        <ConnectionStatus status={connectionStatus} />

      {/* Top Bar */}
      <div style={{ background: '#323233', padding: '8px 16px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid #333' }}>
        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#4ECDC4' }}>
          ⚡ DevCollab
        </span>
        <span style={{ color: '#888', fontSize: '13px' }}>
          {users.length} user{users.length !== 1 ? 's' : ''} connected
        </span>
        <button
          onClick={() => {
            flushPendingChanges();
            navigate('/');
          }}
          style={{ background: 'transparent', border: '1px solid #555', color: '#ccc',
                   padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>
          Leave Room
        </button>
      </div>

      {/* Main Area: Editor + Sidebar */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Editor
          code={code}
          language={language}
          onCodeChange={handleCodeChange}
          onLanguageChange={handleLanguageChange}
          onCursorChange={handleCursorMove}
        />
        <Sidebar
          users={users}
          messages={messages}
          onSendMessage={sendMessage}
          roomId={roomId}
        />
      </div>
    </div>
    </ErrorBoundary>
  );
}