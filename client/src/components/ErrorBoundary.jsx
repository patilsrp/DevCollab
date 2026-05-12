// client/src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Optionally reload the page if errors persist
    if (this.state.errorCount > 3) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#1e1e2e',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '30px',
            background: '#2d2d3f',
            borderRadius: '12px',
            border: '1px solid #444'
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              color: '#ff6b6b',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <span>⚠️</span> Oops! Something went wrong
            </h1>
            
            <p style={{ 
              color: '#aaa', 
              marginBottom: '20px',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              We encountered an unexpected error. This could be temporary. 
              Please try refreshing the page or going back to the home page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                textAlign: 'left',
                marginBottom: '20px',
                padding: '12px',
                background: '#1e1e2e',
                borderRadius: '8px',
                border: '1px solid #555'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  color: '#888',
                  fontSize: '13px',
                  marginBottom: '8px'
                }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ 
                  color: '#ff6b6b', 
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  margin: '8px 0'
                }}>
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre style={{ 
                    color: '#666', 
                    fontSize: '11px',
                    overflow: 'auto',
                    maxHeight: '150px'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 24px',
                  background: '#4ECDC4',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={e => e.target.style.opacity = '0.9'}
                onMouseOut={e => e.target.style.opacity = '1'}
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '10px 24px',
                  background: 'transparent',
                  border: '1px solid #666',
                  borderRadius: '6px',
                  color: '#aaa',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onMouseOver={e => e.target.style.borderColor = '#888'}
                onMouseOut={e => e.target.style.borderColor = '#666'}
              >
                Go Home
              </button>
            </div>
            
            {this.state.errorCount > 2 && (
              <p style={{
                color: '#ffa500',
                fontSize: '12px',
                marginTop: '16px'
              }}>
                Multiple errors detected. If problems persist, please refresh the page.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;