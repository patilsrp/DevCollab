// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingStates';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader message="Loading DevCollab..." />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor/:roomId" element={<EditorPage />} />
            <Route 
              path="*" 
              element={
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100vh',
                  background: '#1e1e2e',
                  color: 'white'
                }}>
                  <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>404</h1>
                  <p style={{ color: '#888', marginBottom: '24px' }}>Page not found</p>
                  <a 
                    href="/" 
                    style={{ 
                      color: '#4ECDC4', 
                      textDecoration: 'none',
                      padding: '10px 20px',
                      border: '1px solid #4ECDC4',
                      borderRadius: '6px'
                    }}
                  >
                    Go Home
                  </a>
                </div>
              } 
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}