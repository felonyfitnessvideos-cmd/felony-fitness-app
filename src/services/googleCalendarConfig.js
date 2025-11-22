/**
 * @fileoverview Google Calendar API configuration management
 * @description Centralized configuration management for Google Calendar API integration.
 * Handles environment variable validation, development/production mode detection,
 * and provides comprehensive configuration validation with detailed error messages.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-01
 * 
 * @requires vite
 * 
 * @example
 * // Basic usage
 * import { getGoogleCalendarConfig, isGoogleCalendarConfigured } from './googleCalendarConfig';
 * 
 * if (isGoogleCalendarConfigured()) {
 *   const config = getGoogleCalendarConfig();
 *   // Use config.apiKey and config.clientId
 * }
 */

/**
 * @typedef {Object} GoogleCalendarConfiguration
 * @property {string} apiKey - Google API key for Calendar API access
 * @property {string} clientId - Google OAuth 2.0 client ID
 * @property {Array<string>} scopes - Required OAuth scopes
 * @property {string} discoveryDoc - Calendar API discovery document URL
 */

/**
 * @typedef {Object} ConfigurationValidationResult
 * @property {boolean} isValid - Whether configuration is valid
 * @property {Array<string>} errors - Array of validation error messages
 * @property {Array<string>} warnings - Array of validation warning messages
 * @property {Object} recommendations - Recommended actions for improvement
 */

// Environment detection
/** @constant {boolean} IS_DEVELOPMENT - Whether running in development mode */
const IS_DEVELOPMENT = import.meta.env.DEV || import.meta.env.MODE === 'development';

/** @constant {boolean} IS_PRODUCTION - Whether running in production mode */
const IS_PRODUCTION = import.meta.env.PROD || import.meta.env.MODE === 'production';

/** @constant {string} APP_MODE - Current application mode */
const APP_MODE = import.meta.env.MODE || 'development';

// Google Calendar API Configuration Constants
/** @constant {Array<string>} REQUIRED_SCOPES - Required OAuth scopes for calendar access */
const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly'
];

/** @constant {string} DISCOVERY_DOC_URL - Google Calendar API discovery document URL */
const DISCOVERY_DOC_URL = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

/** @constant {string} OAUTH_DOMAIN - Expected domain for OAuth client IDs */
const OAUTH_DOMAIN = 'apps.googleusercontent.com';

/**
 * Google Calendar API Configuration
 * Retrieves configuration from environment variables with fallback handling
 * 
 * @constant {GoogleCalendarConfiguration} GOOGLE_CALENDAR_CONFIG
 */
export const GOOGLE_CALENDAR_CONFIG = {
  // Google API Key - get from Google Cloud Console
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY?.trim() || '',
  
  // Google OAuth Client ID - get from Google Cloud Console  
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '',
  
  // Required scopes for calendar access
  SCOPES: REQUIRED_SCOPES,
  
  // Discovery document URL
  DISCOVERY_DOC: DISCOVERY_DOC_URL
};

// Development/Demo configuration (remove in production)
/** @constant {Object} DEMO_CONFIG - Demo configuration for development (DO NOT USE IN PRODUCTION) */
export const DEMO_CONFIG = {
  // For development/demo purposes only - replace with actual credentials
  API_KEY: 'your-google-api-key-here',
  CLIENT_ID: '1060853999451-7it8g7m6j98plp3qbsdd5tgpnjr9ebju.apps.googleusercontent.com'
};

/**
 * Get Google Calendar configuration with comprehensive validation
 * 
 * @function getGoogleCalendarConfig
 * @description Retrieves Google Calendar configuration with environment-aware fallbacks
 * and comprehensive validation. Prioritizes environment variables over demo config.
 * 
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.allowDemo=true] - Whether to allow demo config in development
 * @param {boolean} [options.throwOnInvalid=false] - Whether to throw error on invalid config
 * @returns {GoogleCalendarConfiguration} Configuration object with apiKey and clientId
 * 
 * @throws {Error} Throws error if throwOnInvalid is true and configuration is invalid
 * 
 * @example
 * // Basic usage
 * const config = getGoogleCalendarConfig();
 * 
 * // Strict validation
 * try {
 *   const config = getGoogleCalendarConfig({ throwOnInvalid: true });
 *   // Configuration is guaranteed to be valid
 * } catch (error) {
 *   console.error('Invalid configuration:', error.message);
 * }
 * 
 * // Production mode (no demo fallback)
 * const config = getGoogleCalendarConfig({ allowDemo: false });
 */
export function getGoogleCalendarConfig(options = {}) {
  const { allowDemo = IS_DEVELOPMENT, throwOnInvalid = false } = options;
  
  try {
    // Start with environment variables
    let config = {
      apiKey: GOOGLE_CALENDAR_CONFIG.API_KEY,
      clientId: GOOGLE_CALENDAR_CONFIG.CLIENT_ID,
      scopes: GOOGLE_CALENDAR_CONFIG.SCOPES,
      discoveryDoc: GOOGLE_CALENDAR_CONFIG.DISCOVERY_DOC
    };
    
    // Fallback to demo config in development if allowed
    if (allowDemo && IS_DEVELOPMENT) {
      if (!config.apiKey && DEMO_CONFIG.API_KEY !== 'your-google-api-key-here') {
        config.apiKey = DEMO_CONFIG.API_KEY;
        console.warn('⚠️ Using demo API key - set VITE_GOOGLE_API_KEY for production');
      }
      
      if (!config.clientId && DEMO_CONFIG.CLIENT_ID.includes(OAUTH_DOMAIN)) {
        config.clientId = DEMO_CONFIG.CLIENT_ID;
        console.warn('⚠️ Using demo client ID - set VITE_GOOGLE_CLIENT_ID for production');
      }
    }
    
    // Validate configuration
    const validation = validateConfiguration(config);
    
    if (!validation.isValid) {
      const errorMsg = `Invalid Google Calendar configuration: ${validation.errors.join(', ')}`;
      
      if (throwOnInvalid) {
        throw new Error(errorMsg);
      } else {
        console.error('❌', errorMsg);
        
        // Log recommendations if available
        if (validation.recommendations && Object.keys(validation.recommendations).length > 0) {
          console.warn('💡 Recommendations:', validation.recommendations);
        }
      }
    }
    
    // Log warnings in development
    if (IS_DEVELOPMENT && validation.warnings.length > 0) {
      validation.warnings.forEach(warning => console.warn('⚠️', warning));
    }
    
    return config;
  } catch (error) {
    const errorMsg = `Failed to get Google Calendar configuration: ${error.message}`;
    console.error('❌', errorMsg);
    
    if (throwOnInvalid) {
      throw new Error(errorMsg);
    }
    
    // Return minimal config to prevent crashes
    return {
      apiKey: '',
      clientId: '',
      scopes: REQUIRED_SCOPES,
      discoveryDoc: DISCOVERY_DOC_URL
    };
  }
}

/**
 * Check if Google Calendar is properly configured
 * 
 * @function isGoogleCalendarConfigured
 * @description Performs comprehensive validation to determine if Google Calendar
 * is properly configured for use. Checks for valid API key, client ID format,
 * and environment-specific requirements.
 * 
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.strict=false] - Whether to perform strict validation
 * @param {boolean} [options.allowDemo=true] - Whether demo config is acceptable in development
 * @returns {boolean} True if Google Calendar is properly configured
 * 
 * @example
 * // Basic configuration check
 * if (isGoogleCalendarConfigured()) {
 *   // Safe to initialize Google Calendar
 * }
 * 
 * // Strict validation (production-ready)
 * if (isGoogleCalendarConfigured({ strict: true, allowDemo: false })) {
 *   // Production-ready configuration
 * }
 */
export function isGoogleCalendarConfigured(options = {}) {
  const { strict = false, allowDemo = IS_DEVELOPMENT } = options;
  
  try {
    const config = getGoogleCalendarConfig({ allowDemo, throwOnInvalid: strict });
    const validation = validateConfiguration(config, { strict });
    
    return validation.isValid;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error.message);
    return false;
  }
}

/**
 * Validate Google Calendar configuration
 * 
 * @function validateConfiguration
 * @description Performs comprehensive validation of Google Calendar configuration
 * with detailed error reporting and recommendations for improvement.
 * 
 * @param {GoogleCalendarConfiguration} config - Configuration to validate
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.strict=false] - Whether to perform strict validation
 * @returns {ConfigurationValidationResult} Detailed validation results
 * 
 * @example
 * const config = getGoogleCalendarConfig();
 * const validation = validateConfiguration(config);
 * 
 * if (!validation.isValid) {
 *   console.error('Configuration errors:', validation.errors);
 *   console.log('Recommendations:', validation.recommendations);
 * }
 */
export function validateConfiguration(config, options = {}) {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];
  const recommendations = {};
  
  // Validate API Key
  if (!config.apiKey) {
    errors.push('Missing Google API key');
    recommendations.apiKey = 'Set VITE_GOOGLE_API_KEY environment variable with your Google Cloud Console API key';
  } else if (config.apiKey === 'your-google-api-key-here' || config.apiKey === 'your-actual-api-key-here') {
    errors.push('Placeholder API key detected');
    recommendations.apiKey = 'Replace placeholder with actual API key from Google Cloud Console';
  } else if (config.apiKey.length < 20) {
    warnings.push('API key appears too short - verify it is correct');
  }
  
  // Validate Client ID
  if (!config.clientId) {
    errors.push('Missing Google OAuth client ID');
    recommendations.clientId = 'Set VITE_GOOGLE_CLIENT_ID environment variable with your OAuth 2.0 client ID';
  } else if (!config.clientId.includes(OAUTH_DOMAIN)) {
    errors.push(`Invalid client ID format - must end with ${OAUTH_DOMAIN}`);
    recommendations.clientId = `Client ID must be from Google Cloud Console and end with ${OAUTH_DOMAIN}`;
  } else if (config.clientId.startsWith('your-')) {
    errors.push('Placeholder client ID detected');
    recommendations.clientId = 'Replace placeholder with actual client ID from Google Cloud Console';
  }
  
  // Validate scopes
  if (!config.scopes || !Array.isArray(config.scopes) || config.scopes.length === 0) {
    errors.push('Missing or invalid OAuth scopes');
  } else {
    const missingScopes = REQUIRED_SCOPES.filter(scope => !config.scopes.includes(scope));
    if (missingScopes.length > 0) {
      errors.push(`Missing required scopes: ${missingScopes.join(', ')}`);
    }
  }
  
  // Validate discovery document URL
  if (!config.discoveryDoc || !config.discoveryDoc.startsWith('https://')) {
    errors.push('Invalid or missing discovery document URL');
  }
  
  // Production-specific validation
  if (IS_PRODUCTION) {
    if (config.apiKey === DEMO_CONFIG.API_KEY) {
      errors.push('Demo API key cannot be used in production');
      recommendations.production = 'Set production API key in VITE_GOOGLE_API_KEY environment variable';
    }
    
    if (config.clientId === DEMO_CONFIG.CLIENT_ID) {
      errors.push('Demo client ID cannot be used in production');
      recommendations.production = 'Set production client ID in VITE_GOOGLE_CLIENT_ID environment variable';
    }
  }
  
  // Strict validation checks
  if (strict) {
    if (IS_DEVELOPMENT && (config.apiKey === DEMO_CONFIG.API_KEY || config.clientId === DEMO_CONFIG.CLIENT_ID)) {
      warnings.push('Using demo configuration in strict mode');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations
  };
}

/**
 * Get environment information
 * 
 * @function getEnvironmentInfo
 * @description Returns comprehensive information about the current environment
 * and configuration status for debugging purposes.
 * 
 * @returns {Object} Environment information object
 * 
 * @example
 * const envInfo = getEnvironmentInfo();
 * console.log('Environment:', envInfo);
 */
export function getEnvironmentInfo() {
  return {
    mode: APP_MODE,
    isDevelopment: IS_DEVELOPMENT,
    isProduction: IS_PRODUCTION,
    hasApiKey: !!import.meta.env.VITE_GOOGLE_API_KEY,
    hasClientId: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
    isConfigured: isGoogleCalendarConfigured(),
    configValidation: validateConfiguration(getGoogleCalendarConfig())
  };
}
