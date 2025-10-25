/**
 * @file ErrorBoundary.jsx
 * @description
 * React Error Boundary that captures render-time and lifecycle errors thrown by
 * child components. It centralizes simple UI for recovery (reload, navigate
 * home) and logs the error to the console where an external logging service
 * integration can be added.
 *
 * Responsibilities
 * - Catch exceptions during rendering/commit phases and prevent them from
 *   crashing the whole application UI.
 * - Provide a basic fallback UI with details (for debugging) and options to
 *   reload or navigate to a safe route.
 * - Surface error details only (no user PII) — avoid sending sensitive data
 *   to logging backends without redaction.
 *
 * Extension points / TODOs
 * - TODO (coderabbit): wire componentDidCatch to a structured logging
 *   backend (Sentry/Datadog) with user/context metadata when available.
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
    // The boolean forceReload parameter is deprecated; use the standard
    // reload() behavior supported by modern browsers.
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" aria-live="assertive" style={{ padding: 24 }}>
          <h2>Something went wrong loading this part of the app.</h2>
          <p style={{ color: '#666' }}>An unexpected error occurred.</p>
          <details style={{ marginTop: 8 }}>
            <summary>Details</summary>
            <pre style={{ color: '#aaa', whiteSpace: 'pre-wrap' }}>
              {String(this.state.error?.stack ?? this.state.error?.message ?? this.state.error)}
            </pre>
          </details>
          <div style={{ marginTop: 12 }}>
            <button onClick={this.handleReload} style={{ marginRight: 8 }} type="button">Reload</button>
            <button onClick={() => window.location.replace('/')} type="button">Go to sign in</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
