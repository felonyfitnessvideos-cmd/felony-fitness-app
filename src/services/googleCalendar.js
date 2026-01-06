/**
 * @fileoverview Google Calendar API integration service using Google Identity Services (GIS)
 * @description Provides comprehensive Google Calendar integration for trainer appointments and scheduling.
 * Uses the modern Google Identity Services for authentication (replacing deprecated GAPI auth2).
 * Implements bulletproof error handling, token persistence, and automatic state restoration.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-01
 * 
 * @requires google-api-javascript-client
 * @requires google-identity-services
 * 
 * @example
 * // Initialize and use the service
 * import googleCalendarService from './services/googleCalendar.js';
 * 
 * // Initialize with credentials
 * await googleCalendarService.initialize(apiKey, clientId);
 * 
 * // Sign in user
 * const success = await googleCalendarService.signIn();
 * 
 * // Create an event
 * const event = await googleCalendarService.createEvent(appointmentData);
 */

// Google Calendar API configuration constants
/** @constant {string} DISCOVERY_DOC - Google Calendar API discovery document URL */
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

/** @constant {string} SCOPES - Required OAuth scopes for calendar access */
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

/** @constant {number} TOKEN_EXPIRY_BUFFER - Buffer time in ms before token refresh (5 minutes) */
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000;

/** @constant {number} MAX_RETRY_ATTEMPTS - Maximum number of retry attempts for API calls */
const MAX_RETRY_ATTEMPTS = 3;

/** @constant {number} RETRY_DELAY_BASE - Base delay in ms for exponential backoff */
const RETRY_DELAY_BASE = 1000;

/**
 * Google Calendar API service class using Google Identity Services (GIS)
 * 
 * @class GoogleCalendarService
 * @description Singleton service class that provides comprehensive Google Calendar API integration.
 * Handles authentication using modern Google Identity Services, token persistence,
 * automatic state restoration, and all CRUD operations for calendar events.
 * 
 * @example
 * const service = new GoogleCalendarService();
 * await service.initialize(apiKey, clientId);
 * const success = await service.signIn();
 * const events = await service.getEvents('primary', startDate, endDate);
 */
class GoogleCalendarService {
  /**
   * Creates an instance of GoogleCalendarService
   * 
   * @constructor
   * @description Initializes the service with default state values.
   * Sets up instance variables for API clients, authentication state, and token management.
   */
  constructor() {
    /** @private {Object|null} gapi - Google API client instance */
    this.gapi = null;
    
    /** @private {Object|null} gis - Google Identity Services instance */
    this.gis = null;
    
    /** @private {boolean} isInitialized - Service initialization state */
    this.isInitialized = false;
    
    /** @private {boolean} isSignedIn - User authentication state */
    this.isSignedIn = false;
    
    /** @private {Object|null} tokenClient - GIS OAuth token client */
    this.tokenClient = null;
    
    /** @private {string|null} accessToken - Current OAuth access token */
    this.accessToken = null;
    
    /** @private {number|null} tokenExpiryTime - Token expiration timestamp */
    this.tokenExpiryTime = null;
    
    /** @private {string|null} apiKey - Google API key for public API calls */
    this.apiKey = null;
    
    /** @private {string|null} clientId - OAuth client ID for authentication */
    this.clientId = null;
  }

  /**
   * Initialize Google Calendar API using Google Identity Services
   * 
   * @async
   * @method initialize
   * @description Initializes the Google Calendar API service with the provided credentials.
   * Loads required Google API and GIS scripts, sets up the GAPI client for API calls,
   * and initializes the GIS token client for OAuth authentication.
   * 
   * @param {string} apiKey - Google API key from Google Cloud Console
   * @param {string} clientId - Google OAuth client ID from Google Cloud Console
   * @returns {Promise<boolean>} Promise that resolves to true if initialization succeeds, false otherwise
   * 
   * @throws {Error} Throws error if required parameters are missing or invalid
   * @throws {Error} Throws error if Google API scripts fail to load
   * @throws {Error} Throws error if GAPI client initialization fails
   * 
   * @example
   * const success = await googleCalendarService.initialize(
   *   'your-api-key-here',
   *   'your-client-id.apps.googleusercontent.com'
   * );
   * if (success) {
   * }
   */
  async initialize(apiKey, clientId) {
    // Input validation
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      const error = new Error('Invalid API key: must be a non-empty string');
      console.error('❌ Initialization failed:', error.message);
      throw error;
    }
    
    if (!clientId || typeof clientId !== 'string' || !clientId.includes('apps.googleusercontent.com')) {
      const error = new Error('Invalid client ID: must be a valid Google OAuth client ID');
      console.error('❌ Initialization failed:', error.message);
      throw error;
    }

    // Prevent double initialization
    if (this.isInitialized) {

      return true;
    }

    // Store credentials
    this.apiKey = apiKey.trim();
    this.clientId = clientId.trim();

    try {
      // Load Google API and GIS scripts with timeout protection
      const loadPromises = [
        this._loadGoogleAPIWithTimeout(),
        this._loadGoogleIdentityServicesWithTimeout()
      ];
      
      await Promise.all(loadPromises);

      // Validate that scripts loaded correctly
      if (!window.gapi) {
        throw new Error('Google API (gapi) failed to load');
      }
      if (!window.google?.accounts) {
        throw new Error('Google Identity Services failed to load');
      }

      this.gapi = window.gapi;
      this.gis = window.google;

      // Initialize the GAPI client for API calls with timeout

      await this._executeWithTimeout(
        new Promise((resolve) => {
          this.gapi.load('client', resolve);
        }),
        60000, // Increased from 30s to 60s
        'GAPI client load timeout'
      );


      await this._executeWithTimeout(
        this.gapi.client.init({
          discoveryDocs: [DISCOVERY_DOC]
          // Note: No API key here - we'll rely on OAuth token for authenticated requests
        }),
        60000, // Increased from 30s to 60s
        'GAPI client initialization timeout'
      );

      // Initialize the GIS token client for authentication

      this.tokenClient = this.gis.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: SCOPES,
        callback: (response) => this._handleTokenResponse(response)
      });
      
      if (!this.tokenClient) {
        throw new Error('Failed to create GIS token client');
      }

      this.isInitialized = true;
      
      // Try to restore authentication from localStorage
      this._restoreAuthenticationState();

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Calendar API:', error);

      this.isInitialized = false;
      
      // Don't throw error, allow graceful degradation
      return false;
    }
  }

  /**
   * Load Google API script dynamically with timeout protection
   * 
   * @private
   * @async
   * @method _loadGoogleAPIWithTimeout
   * @description Loads the Google API JavaScript client with a timeout to prevent hanging.
   * Checks if the API is already loaded before attempting to load.
   * 
   * @returns {Promise<void>} Promise that resolves when the API is loaded
   * @throws {Error} Throws error if script fails to load or times out
   */
  _loadGoogleAPIWithTimeout() {
    return this._executeWithTimeout(
      this._loadGoogleAPI(),
      15000,
      'Google API script load timeout'
    );
  }

  /**
   * Load Google API script dynamically
   * 
   * @private
   * @method _loadGoogleAPI
   * @description Internal method to load Google API script. Handles duplicate load prevention.
   * 
   * @returns {Promise<void>} Promise that resolves when script is loaded
   */
  _loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {

        resolve();
      };
      
      script.onerror = (error) => {
        console.error('❌ Google API script failed to load:', error);
        reject(new Error('Failed to load Google API script'));
      };
      
      // Clean up any existing script with same src
      const existingScript = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
      if (existingScript && existingScript !== script) {
        existingScript.remove();
      }
      
      document.head.appendChild(script);
    });
  }

  /**
   * Load Google Identity Services script dynamically with timeout protection
   * 
   * @private
   * @async
   * @method _loadGoogleIdentityServicesWithTimeout
   * @description Loads the Google Identity Services script with timeout protection.
   * 
   * @returns {Promise<void>} Promise that resolves when GIS is loaded
   * @throws {Error} Throws error if script fails to load or times out
   */
  _loadGoogleIdentityServicesWithTimeout() {
    return this._executeWithTimeout(
      this._loadGoogleIdentityServices(),
      15000,
      'Google Identity Services script load timeout'
    );
  }

  /**
   * Load Google Identity Services script dynamically
   * 
   * @private
   * @method _loadGoogleIdentityServices
   * @description Internal method to load GIS script. Handles duplicate load prevention.
   * 
   * @returns {Promise<void>} Promise that resolves when script is loaded
   */
  _loadGoogleIdentityServices() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {

        resolve();
      };
      
      script.onerror = (error) => {
        console.error('❌ Google Identity Services script failed to load:', error);
        reject(new Error('Failed to load Google Identity Services script'));
      };
      
      // Clean up any existing script with same src
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript && existingScript !== script) {
        existingScript.remove();
      }
      
      document.head.appendChild(script);
    });
  }

  /**
   * Execute a promise with timeout protection
   * 
   * @private
   * @async
   * @method _executeWithTimeout
   * @description Wraps a promise with a timeout to prevent indefinite hanging.
   * 
   * @param {Promise} promise - The promise to execute
   * @param {number} timeout - Timeout in milliseconds
   * @param {string} errorMessage - Error message for timeout
   * @returns {Promise} Promise that resolves/rejects with timeout protection
   * @throws {Error} Throws timeout error if promise doesn't resolve in time
   */
  _executeWithTimeout(promise, timeout, errorMessage) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(errorMessage));
        }, timeout);
      })
    ]);
  }

  /**
   * Handle token response from Google Identity Services
   * 
   * @private
   * @method _handleTokenResponse
   * @description Processes the OAuth token response from GIS.
   * Handles both success and error cases, persists authentication state.
   * 
   * @param {Object} response - Token response from GIS
   * @param {string} [response.access_token] - OAuth access token
   * @param {string} [response.error] - Error message if authentication failed
   * @param {number} [response.expires_in] - Token expiry time in seconds
   */
  _handleTokenResponse(response) {
    try {
      if (response.error) {
        console.error('❌ Token response error:', response.error);
        this.isSignedIn = false;
        this.accessToken = null;
        this.tokenExpiryTime = null;
        this._clearStoredAuth();
        return;
      }

      if (!response.access_token) {
        console.error('❌ No access token in response');
        this.isSignedIn = false;
        return;
      }

      this.accessToken = response.access_token;
      this.isSignedIn = true;
      
      // Calculate token expiry time
      if (response.expires_in) {
        this.tokenExpiryTime = Date.now() + (response.expires_in * 1000);
      }
      
      // Persist authentication state
      this._persistAuthenticationState();
      
      // Set the access token for API calls
      this.gapi.client.setToken({ access_token: this.accessToken });
    } catch (error) {
      console.error('❌ Error handling token response:', error);
      this.isSignedIn = false;
      this.accessToken = null;
      this.tokenExpiryTime = null;
    }
  }

  /**
   * Restore authentication state from localStorage
   * 
   * @private
   * @method _restoreAuthenticationState
   * @description Attempts to restore authentication state from localStorage.
   * Validates stored tokens and checks expiry before restoring session.
   * Automatically clears invalid or expired tokens.
   * 
   * @returns {boolean} True if authentication was successfully restored, false otherwise
   * 
   * @example
   * // Called automatically during initialization
   * const restored = this._restoreAuthenticationState();
   */
  _restoreAuthenticationState() {
    try {
      const savedToken = localStorage.getItem('google_calendar_token');
      const savedAuth = localStorage.getItem('google_calendar_auth');
      const savedExpiry = localStorage.getItem('google_calendar_token_expiry');
      
      // Validate stored authentication data
      if (!savedToken || savedAuth !== 'true') {

        this._clearStoredAuth();
        return false;
      }

      // Check token expiry if available
      if (savedExpiry) {
        const expiryTime = parseInt(savedExpiry, 10);
        if (isNaN(expiryTime) || Date.now() > (expiryTime - TOKEN_EXPIRY_BUFFER)) {

          this._clearStoredAuth();
          return false;
        }
        this.tokenExpiryTime = expiryTime;
      }

      // Validate token format (basic check)
      if (typeof savedToken !== 'string' || savedToken.length < 20) {

        this._clearStoredAuth();
        return false;
      }
      
      // Restore authentication state
      this.accessToken = savedToken;
      this.isSignedIn = true;
      
      // Set the access token for API calls
      if (this.gapi?.client) {
        this.gapi.client.setToken({ access_token: this.accessToken });
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to restore authentication state:', error);
      this._clearStoredAuth();
      return false;
    }
  }

  /**
   * Persist authentication state to localStorage
   * 
   * @private
   * @method _persistAuthenticationState
   * @description Saves authentication state to localStorage for session persistence.
   * Includes token, authentication flag, and expiry time.
   * 
   * @throws {Error} Throws error if localStorage is not available
   */
  _persistAuthenticationState() {
    try {
      if (!this.accessToken) {
        console.warn('⚠️ Attempting to persist null access token');
        return;
      }

      localStorage.setItem('google_calendar_token', this.accessToken);
      localStorage.setItem('google_calendar_auth', 'true');
      
      if (this.tokenExpiryTime) {
        localStorage.setItem('google_calendar_token_expiry', this.tokenExpiryTime.toString());
      }

    } catch (error) {
      console.error('❌ Failed to persist authentication state:', error);
      // Don't throw - authentication can still work without persistence
    }
  }

  /**
   * Clear stored authentication data
   * 
   * @private
   * @method _clearStoredAuth
   * @description Removes all authentication data from localStorage and resets internal state.
   */
  _clearStoredAuth() {
    try {
      localStorage.removeItem('google_calendar_token');
      localStorage.removeItem('google_calendar_auth');
      localStorage.removeItem('google_calendar_token_expiry');
      
      this.accessToken = null;
      this.isSignedIn = false;
      this.tokenExpiryTime = null;
      
      if (this.gapi?.client) {
        this.gapi.client.setToken(null);
      }
    } catch (error) {
      console.error('❌ Failed to clear stored authentication:', error);
    }
  }

  /**
   * Sign in to Google account using Google Identity Services
   * 
   * @async
   * @method signIn
   * @description Initiates the OAuth sign-in flow using Google Identity Services.
   * Handles both fresh sign-ins and token refresh scenarios.
   * Implements timeout protection and comprehensive error handling.
   * 
   * @param {Object} [options] - Sign-in options
   * @param {boolean} [options.forceConsent=false] - Force consent screen even if user previously consented
   * @param {string} [options.hint] - Email hint for sign-in
   * @returns {Promise<boolean>} Promise that resolves to true if sign-in succeeds, false otherwise
   * 
   * @throws {Error} Throws error if service is not initialized
   * @throws {Error} Throws error if token client is not available
   * 
   * @example
   * // Basic sign-in
   * const success = await googleCalendarService.signIn();
   * 
   * // Force consent screen
   * const success = await googleCalendarService.signIn({ forceConsent: true });
   */
  async signIn(options = {}) {
    const { forceConsent = false, hint } = options;

    // Validate service state
    if (!this.isInitialized) {
      const error = new Error('Google Calendar API not initialized. Call initialize() first.');
      console.error('❌', error.message);
      throw error;
    }

    if (!this.tokenClient) {
      const error = new Error('Token client not available. Service may not be properly initialized.');
      console.error('❌', error.message);
      throw error;
    }

    try {

      // Check if already signed in and token is still valid
      if (this.isSignedIn && this._isTokenValid()) {

        return true;
      }

      // Clear any invalid/expired authentication
      if (this.isSignedIn && !this._isTokenValid()) {

        this._clearStoredAuth();
      }

      // Return a promise that resolves when the OAuth callback is called
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Sign-in timeout: User did not complete authentication within 2 minutes'));
        }, 120000); // 2 minute timeout

        const originalCallback = this.tokenClient.callback;
        this.tokenClient.callback = (response) => {
          clearTimeout(timeoutId);
          
          try {
            // Call the original callback first to handle token processing
            originalCallback(response);
            
            if (response.error) {
              console.error('❌ Sign-in failed:', response.error);
              const errorMessage = this._getHumanReadableError(response.error);
              reject(new Error(`Sign-in failed: ${errorMessage}`));
            } else if (this.isSignedIn) {

              resolve(true);
            } else {
              console.error('❌ Sign-in completed but authentication state not updated');
              reject(new Error('Sign-in completed but authentication failed'));
            }
          } catch (error) {
            console.error('❌ Error processing sign-in response:', error);
            reject(error);
          }
        };
        
        // Prepare request options
        const requestOptions = {};
        if (forceConsent) {
          requestOptions.prompt = 'consent';
        }
        if (hint) {
          requestOptions.hint = hint;
        }
        
        // Request the access token
        try {
          this.tokenClient.requestAccessToken(requestOptions);
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('❌ Failed to request access token:', error);
          reject(new Error(`Failed to initiate sign-in: ${error.message}`));
        }
      });
    } catch (error) {
      console.error('❌ Failed to sign in to Google:', error);
      throw error;
    }
  }

  /**
   * Sign out from Google account
   * 
   * @async
   * @method signOut
   * @description Signs out the user from Google account, revokes access tokens,
   * and clears all stored authentication data. Handles errors gracefully.
   * 
   * @returns {Promise<boolean>} Promise that resolves to true if sign-out succeeds, false otherwise
   * 
   * @example
   * const success = await googleCalendarService.signOut();
   * if (success) {
   * }
   */
  async signOut() {

    if (!this.isInitialized) {
      console.warn('⚠️ Service not initialized, but clearing local state');
      this._clearStoredAuth();
      return true;
    }

    if (!this.gis) {
      console.warn('⚠️ GIS not available, clearing local state only');
      this._clearStoredAuth();
      return true;
    }

    try {
      const promises = [];
      
      // Revoke the access token if available
      if (this.accessToken) {

        try {
          // Revoke token asynchronously but don't wait indefinitely
          const revokePromise = new Promise((resolve) => {
            this.gis.accounts.oauth2.revoke(this.accessToken, (response) => {
              if (response.error) {
                console.warn('⚠️ Token revocation failed:', response.error);
              }
              resolve();
            });
          });
          
          promises.push(this._executeWithTimeout(revokePromise, 5000, 'Token revocation timeout'));
        } catch (error) {
          console.warn('⚠️ Failed to revoke token:', error.message);
          // Continue with sign-out even if token revocation fails
        }
      }
      
      // Wait for revocation to complete (or timeout)
      if (promises.length > 0) {
        try {
          await Promise.all(promises);
        } catch (error) {
          console.warn('⚠️ Token revocation timed out or failed:', error.message);
          // Continue with local cleanup
        }
      }
      
      // Clear local state
      this._clearStoredAuth();

      return true;
    } catch (error) {
      console.error('❌ Failed to sign out from Google:', error);
      // Even if sign-out fails, clear local state
      this._clearStoredAuth();
      return false;
    }
  }

  /**
   * Get current authentication status
   * 
   * @method isAuthenticated
   * @description Checks if the user is authenticated and the service is ready for API calls.
   * Validates both initialization state and active authentication with token validity.
   * 
   * @returns {boolean} True if service is initialized, user is signed in, and token is valid
   * 
   * @example
   * if (googleCalendarService.isAuthenticated()) {
   *   // Safe to make API calls
   *   const events = await googleCalendarService.getEvents('primary', startDate, endDate);
   * }
   */
  isAuthenticated() {
    return this.isInitialized && this.isSignedIn && this._isTokenValid();
  }

  /**
   * Check if the current access token is valid
   * 
   * @private
   * @method _isTokenValid
   * @description Validates the current access token by checking its existence and expiry time.
   * 
   * @returns {boolean} True if token exists and is not expired
   */
  _isTokenValid() {
    if (!this.accessToken) {
      return false;
    }
    
    // If we don't have expiry info, assume token is valid
    if (!this.tokenExpiryTime) {
      return true;
    }
    
    // Check if token expires within the buffer time
    return Date.now() < (this.tokenExpiryTime - TOKEN_EXPIRY_BUFFER);
  }

  /**
   * Convert Google API error codes to human-readable messages
   * 
   * @private
   * @method _getHumanReadableError
   * @description Converts technical error codes from Google APIs into user-friendly messages.
   * 
   * @param {string} errorCode - The error code from Google API
   * @returns {string} Human-readable error message
   */
  _getHumanReadableError(errorCode) {
    const errorMessages = {
      'access_denied': 'You denied access to your Google Calendar',
      'popup_blocked': 'Pop-up was blocked. Please allow pop-ups for this site',
      'popup_closed': 'Sign-in window was closed before completing authentication',
      'immediate_failed': 'Automatic sign-in failed. Please sign in manually',
      'invalid_client': 'Invalid OAuth client configuration',
      'invalid_request': 'Invalid authentication request',
      'network_error': 'Network error occurred during authentication',
      'timeout': 'Authentication request timed out'
    };
    
    return errorMessages[errorCode] || `Authentication error: ${errorCode}`;
  }

  /**
   * Execute API call with automatic retry and exponential backoff
   * 
   * @private
   * @async
   * @method _executeWithRetry
   * @description Executes API calls with automatic retry logic for transient failures.
   * Uses exponential backoff to avoid overwhelming the API.
   * 
   * @param {Function} apiCall - Function that returns a Promise for the API call
   * @param {string} operationName - Name of the operation for logging
   * @param {number} [maxRetries=MAX_RETRY_ATTEMPTS] - Maximum number of retry attempts
   * @returns {Promise} Promise that resolves with API response or rejects with final error
   */
  async _executeWithRetry(apiCall, operationName, maxRetries = MAX_RETRY_ATTEMPTS) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        lastError = error;
        
        // Don't retry on authentication errors or client errors
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          console.error(`❌ ${operationName} failed with client error (${error.status}):`, error.message);
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
          console.warn(`⚠️ ${operationName} failed on attempt ${attempt + 1}, retrying in ${delay}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`❌ ${operationName} failed after ${maxRetries + 1} attempts:`, lastError.message);
    throw lastError;
  }

  /**
   * Get user's calendar list
   * @returns {Promise<Array>} List of calendars
   */
  async getCalendars() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const response = await this.gapi.client.calendar.calendarList.list();
      return response.result.items || [];
    } catch (error) {
      console.error('Failed to fetch calendars:', error);
      throw error;
    }
  }

  /**
   * Get events from calendar within date range
   * 
   * @async
   * @method getEvents
   * @description Retrieves calendar events within the specified date range.
   * Supports filtering, pagination, and automatic retry for transient failures.
   * 
   * @param {string} [calendarId='primary'] - Calendar ID to fetch events from
   * @param {Date} startDate - Start date for event range (inclusive)
   * @param {Date} endDate - End date for event range (exclusive)
   * @param {Object} [options] - Additional options for event retrieval
   * @param {number} [options.maxResults=250] - Maximum number of events to return
   * @param {string} [options.orderBy='startTime'] - Order events by 'startTime' or 'updated'
   * @param {boolean} [options.singleEvents=true] - Whether to expand recurring events
   * @param {boolean} [options.showDeleted=false] - Whether to include deleted events
   * @param {string} [options.timeZone] - Time zone for event times
   * @returns {Promise<Array>} Promise that resolves to array of calendar events
   * 
   * @throws {Error} Throws error if not authenticated
   * @throws {Error} Throws error if date parameters are invalid
   * @throws {Error} Throws error if calendar API call fails
   * 
   * @example
   * // Get events for the current week
   * const startDate = new Date();
   * const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
   * const events = await googleCalendarService.getEvents('primary', startDate, endDate);
   * 
   * // Get events with custom options
   * const events = await googleCalendarService.getEvents('primary', startDate, endDate, {
   *   maxResults: 100,
   *   orderBy: 'updated',
   *   timeZone: 'America/New_York'
   * });
   */
  async getEvents(calendarId = 'primary', startDate, endDate, options = {}) {
    // Validate authentication
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar. Please sign in first.');
    }

    // Validate required parameters
    if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Invalid startDate: must be a valid Date object');
    }
    
    if (!endDate || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error('Invalid endDate: must be a valid Date object');
    }
    
    if (startDate >= endDate) {
      throw new Error('Invalid date range: startDate must be before endDate');
    }

    // Validate calendar ID
    if (!calendarId || typeof calendarId !== 'string') {
      throw new Error('Invalid calendarId: must be a non-empty string');
    }

    // Destructure options with defaults
    const {
      maxResults = 250,
      orderBy = 'startTime',
      singleEvents = true,
      showDeleted = false,
      timeZone
    } = options;

    // Validate options
    if (maxResults < 1 || maxResults > 2500) {
      throw new Error('Invalid maxResults: must be between 1 and 2500');
    }
    
    if (!['startTime', 'updated'].includes(orderBy)) {
      throw new Error('Invalid orderBy: must be "startTime" or "updated"');
    }

    try {
      const result = await this._executeWithRetry(async () => {
        // Prepare request parameters
        const requestParams = {
          calendarId: calendarId,
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          maxResults: maxResults,
          singleEvents: singleEvents,
          orderBy: orderBy,
          showDeleted: showDeleted,
          fields: 'items(id,summary,description,start,end,location,attendees)'
        };

        // Add optional time zone
        if (timeZone) {
          requestParams.timeZone = timeZone;
        }

        const response = await this.gapi.client.calendar.events.list(requestParams);
        
        if (!response.result) {
          throw new Error('Invalid response from Google Calendar API');
        }

        return response.result;
      }, `get events from ${calendarId}`);

      const events = result.items || [];

      return events;
    } catch (error) {
      console.error(`❌ Failed to fetch events from ${calendarId}:`, error);
      
      // Provide more specific error messages
      if (error.status === 404) {
        throw new Error(`Calendar not found: ${calendarId}`);
      } else if (error.status === 403) {
        throw new Error(`Access denied to calendar: ${calendarId}. Check calendar permissions.`);
      } else if (error.status === 401) {
        // Token might be expired, clear authentication
        this._clearStoredAuth();
        throw new Error('Authentication expired. Please sign in again.');
      }
      
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  /**
   * Create a new calendar event
   * @param {Object} eventData - Event details
   * @param {string} calendarId - Calendar ID (default: 'primary')
   * @returns {Promise<Object>} Created event
   */
  async createEvent(eventData, calendarId = 'primary') {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const response = await this.gapi.client.calendar.events.insert({
        calendarId: calendarId,
        resource: eventData
      });

      return response.result;
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  /**
   * Update an existing calendar event
   * @param {string} eventId - Event ID
   * @param {Object} eventData - Updated event details
   * @param {string} calendarId - Calendar ID (default: 'primary')
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(eventId, eventData, calendarId = 'primary') {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const response = await this.gapi.client.calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        resource: eventData
      });

      return response.result;
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  }

  /**
   * Delete a calendar event
   * @param {string} eventId - Event ID
   * @param {string} calendarId - Calendar ID (default: 'primary')
   * @returns {Promise<boolean>} Success status
   */
  async deleteEvent(eventId, calendarId = 'primary') {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      await this.gapi.client.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId
      });

      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  }

  /**
   * Check for available time slots
   * @param {Date} startDate - Start date to check
   * @param {Date} endDate - End date to check
   * @param {number} duration - Duration in minutes
   * @param {string} calendarId - Calendar ID (default: 'primary')
   * @returns {Promise<Array>} Available time slots
   */
  async getAvailableSlots(startDate, endDate, duration = 60, calendarId = 'primary') {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      // Get existing events
      const events = await this.getEvents(calendarId, startDate, endDate);
      
      // Generate potential slots (every 30 minutes during business hours)
      const slots = [];
      const current = new Date(startDate);
      
      while (current < endDate) {
        // Only consider business hours (9 AM - 6 PM)
        const hour = current.getHours();
        if (hour >= 9 && hour < 18) {
          const slotEnd = new Date(current.getTime() + duration * 60000);
          
          // Check if slot conflicts with existing events
          const hasConflict = events.some(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const eventEnd = new Date(event.end.dateTime || event.end.date);
            
            return (current < eventEnd && slotEnd > eventStart);
          });
          
          if (!hasConflict) {
            slots.push({
              start: new Date(current),
              end: new Date(slotEnd),
              duration: duration
            });
          }
        }
        
        // Move to next 30-minute slot
        current.setTime(current.getTime() + 30 * 60000);
      }
      
      return slots;
    } catch (error) {
      console.error('Failed to get available slots:', error);
      throw error;
    }
  }

  /**
   * Format appointment data for Google Calendar event
   * @param {Object} appointment - Appointment data
   * @returns {Object} Google Calendar event format
   */
  formatAppointmentForCalendar(appointment) {
    const startDateTime = new Date(appointment.date);
    const endDateTime = new Date(startDateTime.getTime() + appointment.duration * 60000);

    return {
      summary: `${appointment.type} - ${appointment.clientName}`,
      description: appointment.notes || '',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: appointment.location || '',
      attendees: appointment.clientEmail ? [{ email: appointment.clientEmail }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }       // 30 minutes before
        ]
      }
    };
  }
}

// Create singleton instance
const googleCalendarService = new GoogleCalendarService();

export default googleCalendarService;
