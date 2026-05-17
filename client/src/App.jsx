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
        {/* Skip-to-content link for keyboard users — hidden until focused */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Suspense fallback={<PageLoader message="Loading DevCollab..." />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor/:roomId" element={<EditorPage />} />
            <Route
              path="*"
              element={
                <main
                  id="main-content"
                  role="main"
                  aria-labelledby="not-found-heading"
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
                  <h1 id="not-found-heading" style={{ fontSize: '48px', marginBottom: '16px' }}>
                    404
                  </h1>
                  <p style={{ color: '#bbb', marginBottom: '24px' }}>
                    The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="/"
                    style={{
                      color: '#4ECDC4',
                      textDecoration: 'none',
                      padding: '10px 20px',
                      border: '1px solid #4ECDC4',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    Go Home
                  </a>
                </main>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}