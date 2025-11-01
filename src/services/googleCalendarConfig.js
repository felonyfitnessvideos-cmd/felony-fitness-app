/**
 * @file googleCalendarConfig.js
 * @description Google Calendar API configuration
 * @project Felony Fitness
 * 
 * Configuration for Google Calendar API integration.
 * In production, these values should come from environment variables.
 */

// Google Calendar API Configuration
// These should be set as environment variables in production
export const GOOGLE_CALENDAR_CONFIG = {
  // Google API Key - get from Google Cloud Console
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',
  
  // Google OAuth Client ID - get from Google Cloud Console
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // Required scopes for calendar access
  SCOPES: [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly'
  ],
  
  // Discovery document URL
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
};

// Development/Demo configuration (remove in production)
export const DEMO_CONFIG = {
  // For development/demo purposes only
  // Replace with actual credentials from Google Cloud Console
  API_KEY: 'your-google-api-key-here',
  CLIENT_ID: '1060853999451-7it8g7m6j98plp3qbsdd5tgpnjr9ebju.apps.googleusercontent.com'
};

/**
 * Get Google Calendar configuration
 * Prioritizes environment variables, falls back to demo config in development
 * @returns {Object} Configuration object
 */
export function getGoogleCalendarConfig() {
  const config = {
    apiKey: GOOGLE_CALENDAR_CONFIG.API_KEY || DEMO_CONFIG.API_KEY,
    clientId: GOOGLE_CALENDAR_CONFIG.CLIENT_ID || DEMO_CONFIG.CLIENT_ID
  };
  
  // Validate configuration
  if (!config.apiKey || !config.clientId) {
    console.warn('Google Calendar API credentials not configured. Set VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID environment variables.');
  }
  
  return config;
}

/**
 * Check if Google Calendar is properly configured
 * @returns {boolean} True if configured
 */
export function isGoogleCalendarConfigured() {
  const config = getGoogleCalendarConfig();
  return !!(config.apiKey && config.clientId && 
           config.apiKey !== 'your-google-api-key-here' &&
           config.apiKey !== 'your-actual-api-key-here' &&
           config.clientId && config.clientId.includes('apps.googleusercontent.com'));
}