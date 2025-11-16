/**
 * @fileoverview Error boundary component for Google Calendar integration
 * @description Comprehensive error boundary specifically designed for Google Calendar
 * components with recovery mechanisms, user-friendly error messages, and logging.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-01
 * 
 * @requires react
 * @requires lucide-react
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Settings } from 'lucide-react';
import './GoogleCalendarErrorBoundary.css';

/**
 * @typedef {Object} ErrorInfo
 * @property {string} componentStack - Component stack trace
 * @property {string} errorBoundary - Error boundary name
 */

/**
 * @typedef {Object} ErrorBoundaryState
 * @property {boolean} hasError - Whether an error has occurred
 * @property {Error|null} error - The error object
 * @property {ErrorInfo|null} errorInfo - Additional error information
 * @property {string|null} errorId - Unique error identifier
 * @property {number} retryCount - Number of retry attempts
 */

/**
 * @typedef {Object} ErrorBoundaryProps
 * @property {React.ReactNode} children - Child components to wrap
 * @property {string} [fallbackTitle] - Custom fallback title
 * @property {string} [fallbackMessage] - Custom fallback message
 * @property {Function} [onError] - Custom error handler
 * @property {boolean} [enableRetry=true] - Whether to show retry button
 * @property {number} [maxRetries=3] - Maximum number of retry attempts
 * @property {boolean} [showDetails=false] - Whether to show error details in development
 */

/**
 * Google Calendar Error Boundary Component
 * 
 * @class GoogleCalendarErrorBoundary
 * @extends {React.Component}
 * @description Catches JavaScript errors in Google Calendar components and displays
 * a user-friendly fallback UI with recovery options. Includes logging, retry mechanisms,
 * and detailed error reporting for development.
 * 
 * @example
 * // Basic usage
 * <GoogleCalendarErrorBoundary>
 *   <TrainerCalendar />
 * </GoogleCalendarErrorBoundary>
 * 
 * // With custom configuration
 * <GoogleCalendarErrorBoundary
 *   fallbackTitle="Calendar Error"
 *   fallbackMessage="Unable to load calendar. Please try again."
 *   onError={(error, errorInfo) => console.log('Calendar error:', error)}
 *   maxRetries={5}
 * >
 *   <CalendarComponent />
 * </GoogleCalendarErrorBoundary>
 */
class GoogleCalendarErrorBoundary extends React.Component {
  /**
   * Constructor
   * 
   * @param {ErrorBoundaryProps} props - Component props
   */
  constructor(props) {
    super(props);
    
    /** @type {ErrorBoundaryState} */
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
    
    this.handleRetry = this.handleRetry.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  /**
   * Static method to derive state from error
   * 
   * @static
   * @param {Error} error - The error that occurred
   * @returns {Partial<ErrorBoundaryState>} New state
   */
  static getDerivedStateFromError(error) {
    // Generate unique error ID
    const errorId = `gcal_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  /**
   * Component did catch error lifecycle method
   * 
   * @param {Error} error - The error that occurred
   * @param {ErrorInfo} errorInfo - Additional error information
   */
  componentDidCatch(error, errorInfo) {
    const { onError } = this.props;
    
    // Update state with error info
    this.setState({
      errorInfo,
      error
    });

    // Log error details
    this.logError(error, errorInfo);

    // Call custom error handler if provided
    if (typeof onError === 'function') {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        console.error('❌ Error in custom error handler:', handlerError);
      }
    }
  }

  /**
   * Log error with detailed information
   * 
   * @private
   * @param {Error} error - The error that occurred
   * @param {ErrorInfo} errorInfo - Additional error information
   */
  logError(error, errorInfo) {
    const { errorId } = this.state;
    
    console.group(`❌ Google Calendar Error Boundary - ${errorId}`);
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Stack Trace:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Boundary:', errorInfo.errorBoundary);
    console.error('Timestamp:', new Date().toISOString());
    console.groupEnd();

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // this.reportError(error, errorInfo, errorId);
    }
  }

  /**
   * Handle retry attempt
   * 
   * @private
   */
  handleRetry() {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;
    
    if (retryCount < maxRetries) {
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: retryCount + 1
      });
    } else {
      console.warn(`⚠️ Maximum retry attempts (${maxRetries}) reached for Google Calendar error`);
      alert('Maximum retry attempts reached. Please reload the page or contact support.');
    }
  }

  /**
   * Handle page reload
   * 
   * @private
   */
  handleReload() {
    window.location.reload();
  }

  /**
   * Get user-friendly error message based on error type
   * 
   * @private
   * @param {Error} error - The error that occurred
   * @returns {string} User-friendly error message
   */
  getUserFriendlyMessage(error) {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    // Google Calendar specific errors
    if (errorMessage.includes('calendar') || errorMessage.includes('gapi') || errorMessage.includes('google')) {
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return 'Unable to connect to Google Calendar. Please check your internet connection and try again.';
      }
      if (errorMessage.includes('auth') || errorMessage.includes('token') || errorMessage.includes('permission')) {
        return 'Google Calendar authentication failed. Please sign in again.';
      }
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        return 'Google Calendar API limit reached. Please try again later.';
      }
      if (errorMessage.includes('config') || errorMessage.includes('key') || errorMessage.includes('client')) {
        return 'Google Calendar is not properly configured. Please contact support.';
      }
      return 'An error occurred with Google Calendar integration. Please try again.';
    }

    // Generic React errors
    if (errorMessage.includes('render') || errorMessage.includes('hook')) {
      return 'A rendering error occurred. Please refresh the page.';
    }

    // Default message
    return 'An unexpected error occurred. Please try again or refresh the page.';
  }

  /**
   * Render error fallback UI
   * 
   * @returns {React.ReactElement} Error fallback component
   */
  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const { 
      children, 
      fallbackTitle = 'Google Calendar Error',
      fallbackMessage,
      enableRetry = true,
      maxRetries = 3,
      showDetails = process.env.NODE_ENV === 'development'
    } = this.props;

    if (hasError) {
      const userMessage = fallbackMessage || this.getUserFriendlyMessage(error);
      const canRetry = enableRetry && retryCount < maxRetries;

      return (
        <div className="google-calendar-error-boundary">
          <div className="error-content">
            <AlertTriangle size={48} className="error-icon" />
            
            <h2 className="error-title">{fallbackTitle}</h2>
            
            <p className="error-message">{userMessage}</p>

            {errorId && (
              <p className="error-id">
                <small>Error ID: {errorId}</small>
              </p>
            )}

            <div className="error-actions">
              {canRetry && (
                <button 
                  onClick={this.handleRetry}
                  className="error-button primary"
                  type="button"
                >
                  <RefreshCw size={16} />
                  Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                </button>
              )}
              
              <button 
                onClick={this.handleReload}
                className="error-button secondary"
                type="button"
              >
                <RefreshCw size={16} />
                Reload Page
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="error-button tertiary"
                type="button"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>

            {showDetails && error && (
              <details className="error-details">
                <summary>Technical Details (Development Only)</summary>
                <div className="error-technical">
                  <h4>Error Message:</h4>
                  <pre>{error.message}</pre>
                  
                  <h4>Stack Trace:</h4>
                  <pre>{error.stack}</pre>
                  
                  {errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="error-help">
              <p>
                <small>
                  If this problem persists, please{' '}
                  <a href="mailto:support@felonyfitness.com">contact support</a>{' '}
                  and include the error ID above.
                </small>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default GoogleCalendarErrorBoundary;
