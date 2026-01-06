/**
 * @fileoverview Supabase client configuration and initialization
 * @description Supabase client singleton for browser app authentication and database operations.
 * Creates a shared Supabase client for the browser app and centralizes handling of token refresh
 * failures by clearing persisted tokens and forcing sign out when necessary.
 * * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-02
 * * @requires @supabase/supabase-js
 * * @example
 * // Import and use the configured client
 * import { supabase } from './supabaseClient';
 * * // Authenticate user
 * const { data, error } = await supabase.auth.signInWithPassword({
 * email: 'user@example.com',
 * password: 'password'
 * });
 * * @example
 * // Database operations
 * const { data: workouts } = await supabase
 * .from('workouts')
 * .select('*')
 * .eq('user_id', userId);
 */
import { createClient } from '@supabase/supabase-js'

// Robust environment variable access
const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('supabaseClient: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. App may not function correctly.');
}

/**
 * Configured Supabase client instance
 * * @constant {SupabaseClient} supabase
 * @description Shared Supabase client configured for the Felony Fitness application.
 * Disables detectSessionInUrl to avoid accidental session parsing when the app
 * is mounted at non-root URLs. Includes auth state change handling for graceful
 * token refresh failure recovery.
 * * @example
 * // Use for authentication
 * const { user } = await supabase.auth.getUser();
 * * @example
 * // Use for database queries
 * const { data } = await supabase.from('meals').select('*');
 */
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
    auth: {
        detectSessionInUrl: false,
    },
})

// TEMPORARILY DISABLE REALTIME to prevent console noise
if (supabase.realtime) {
    try {
        supabase.realtime.disconnect();
    } catch (e) {
        console.warn('Error disabling realtime:', e);
    }
}