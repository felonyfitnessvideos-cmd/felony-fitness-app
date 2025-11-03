/**
 * @fileoverview React Error Boundary component for comprehensive error handling
 * @description React Error Boundary that captures render-time and lifecycle errors thrown by
 * child components. Provides centralized error handling with recovery UI and console logging
 * for external logging service integration.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-02
 * 
 * @requires react
 * 
 * @example
 * // Wrap components that might throw errors
 * <ErrorBoundary>
 *   <SomeComponentThatMightFail />
 * </ErrorBoundary>
 * 
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <RiskyComponent />
 * </ErrorBoundary>
 */
import React from 'react';

/**
 * React Error Boundary class component for comprehensive error handling
 * 
 * @class ErrorBoundary
 * @extends React.Component
 * @description Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * Implements React 16+ error boundary pattern with proper error recovery options.
 * 
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <ComponentThatMightThrow />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  /**
   * Constructor for ErrorBoundary component
   * 
   * @constructor
   * @param {Object} props - Component props
   * @param {React.ReactNode} [props.children] - Child components to wrap
   * @param {React.ReactNode} [props.fallback] - Custom fallback UI to display on error
   * @param {Function} [props.onError] - Callback function called when error occurs
   */
  constructor(props) {
    super(props);
    /** @type {{hasError: boolean, error: Error|null}} Initial state */
    this.state = { hasError: false, error: null };
  }

  /**
   * Static lifecycle method that updates state when an error is caught
   * 
   * @static
   * @method getDerivedStateFromError
   * @param {Error} error - The error that was thrown
   * @returns {{hasError: boolean, error: Error}} Updated state object
   * @description This lifecycle method is called after an error has been thrown by a descendant component.
   * It receives the error that was thrown as a parameter and returns a value to update state.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called after an error has been caught
   * 
   * @method componentDidCatch
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Object with componentStack key containing information about component stack
   * @param {string} errorInfo.componentStack - Component stack trace
   * @description This lifecycle method is called after an error has been thrown by a descendant component.
   * Used for logging error information and potentially sending to error reporting services.
   * 
   * @example
   * // Error info object structure:
   * // {
   * //   componentStack: "\n    in ComponentThatThrows (created by App)\n    in ErrorBoundary (created by App)\n    in div (created by App)\n    in App"
   * // }
   */
  componentDidCatch(error, errorInfo) {
    // Log error for debugging and external error reporting service integration
    console.error('ErrorBoundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Call optional error callback prop
    if (this.props.onError && typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send to external logging service (Sentry, LogRocket, etc.)
    // Example: logErrorToService(error, errorInfo);
  }

  /**
   * Handles page reload to recover from error state
   * 
   * @method handleReload
   * @description Forces a full page reload to attempt recovery from error state.
   * This can help recover from chunk loading failures or other transient errors.
   * Uses modern browser reload() method without deprecated forceReload parameter.
   */
  handleReload = () => {
    // Force a full reload to attempt to re-fetch any missing chunks
    // The boolean forceReload parameter is deprecated; use the standard
    // reload() behavior supported by modern browsers.
    window.location.reload();
  };

  /**
   * Renders the component
   * 
   * @method render
   * @returns {React.ReactElement} The rendered component
   * @description Renders either the error fallback UI when an error has occurred,
   * or the normal child components when no error is present. The error UI includes
   * accessible error details, reload button, and navigation to safe route.
   * 
   * @accessibility
   * - Uses role="alert" for screen readers
   * - Uses aria-live="assertive" for immediate error announcement
   * - Provides keyboard accessible buttons for recovery actions
   * - Uses semantic HTML with proper error hierarchy
   */
  render() {
    if (this.state.hasError) {
      // If custom fallback prop is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error fallback UI
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
            <button onClick={this.handleReload} style={{ marginRight: 8 }} type="button">
              Reload
            </button>
            <button onClick={() => window.location.replace('/')} type="button">
              Go to sign in
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
