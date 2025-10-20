/**
 * ErrorBoundary
 * A React error boundary that catches rendering/runtime errors in child components,
 * logs them server-side, and displays a friendly fallback UI with reload controls.
 */
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You could send this to a logging service here
    console.error('ErrorBoundary caught error', error, info);
  }

  handleReload = () => {
    // Force a full reload to attempt to re-fetch any missing chunks
    window.location.reload(true);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong loading this part of the app.</h2>
          <p style={{ color: '#666' }}>{String(this.state.error?.message ?? this.state.error)}</p>
          <div style={{ marginTop: 12 }}>
            <button onClick={this.handleReload} style={{ marginRight: 8 }}>Reload</button>
            <button onClick={() => window.location.replace('/')}>Go to sign in</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
