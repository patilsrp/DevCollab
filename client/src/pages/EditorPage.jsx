// client/src/pages/EditorPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import { useSocket } from '../hooks/useSocket';

export default function EditorPage() {
  const { roomId } = useParams();  // Gets roomId from the URL
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');

  // If someone navigates directly without a username, send them to home
  if (!username) {
    navigate('/');
    return null;
  }

  const {
    code, language, users, messages, cursors,
    handleCodeChange, handleLanguageChange, sendMessage, handleCursorMove
  } = useSocket(roomId, username);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh',
                  background: '#1e1e1e', color: 'white' }}>

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
          onClick={() => navigate('/')}
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
  );
}