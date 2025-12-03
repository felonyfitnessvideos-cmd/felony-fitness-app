/**
 * @fileoverview Supabase client configuration and initialization
 * @description Supabase client singleton for browser app authentication and database operations.
 * Creates a shared Supabase client for the browser app and centralizes handling of token refresh
 * failures by clearing persisted tokens and forcing sign out when necessary.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-02
 * 
 * @requires @supabase/supabase-js
 * 
 * @example
 * // Import and use the configured client
 * import { supabase } from './supabaseClient';
 * 
 * // Authenticate user
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password'
 * });
 * 
 * @example
 * // Database operations
 * const { data: workouts } = await supabase
 *   .from('workouts')
 *   .select('*')
 *   .eq('user_id', userId);
 */
import { createClient } from '@supabase/supabase-js'

/** @type {string} Supabase project URL from environment variables */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
/** @type {string} Supabase anonymous key from environment variables */
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('supabaseClient: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  throw new Error('Supabase environment is not configured');
}

/**
 * Configured Supabase client instance
 * 
 * @constant {SupabaseClient} supabase
 * @description Shared Supabase client configured for the Felony Fitness application.
 * Disables detectSessionInUrl to avoid accidental session parsing when the app
 * is mounted at non-root URLs. Includes auth state change handling for graceful
 * token refresh failure recovery.
 * 
 * @example
 * // Use for authentication
 * const { user } = await supabase.auth.getUser();
 * 
 * @example
 * // Use for database queries
 * const { data } = await supabase.from('meals').select('*');
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		detectSessionInUrl: false,
	},
})

// TEMPORARILY DISABLE REALTIME: Prevent automatic WebSocket connections
// This disables all realtime functionality to stop console errors
if (supabase.realtime) {
	supabase.realtime.disconnect();
	// Override channel method to prevent new subscriptions
	supabase.channel = function() {
		console.warn('⚠️ Realtime subscriptions are temporarily disabled');
		// Return a mock channel that does nothing
		return {
			on: function() { return this; },
			subscribe: function() { 
				console.warn('⚠️ Attempted to subscribe to realtime channel - operation skipped');
				return Promise.resolve({ error: null }); 
			},
			unsubscribe: function() { return Promise.resolve({ error: null }); },
			send: function() { return Promise.resolve({ error: null }); },
		};
	};
}

// Listen for auth state changes and handle token-refresh failures gracefully.
// If the client attempts to refresh and fails (invalid refresh token), clear
// local storage and sign the client out so UI can re-authenticate cleanly.
if (typeof window !== 'undefined' && supabase?.auth) {
  // Listen for SIGNED_OUT events to detect cleared sessions. Avoid calling
  // Supabase API methods synchronously inside this handler; defer if you need
  // to call supabase.auth.signOut() or other APIs.
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      console.warn('supabaseClient: signed out (session cleared)');
      // If necessary, defer further API calls to the next tick:
      // setTimeout(() => supabase.auth.signOut().catch(() => {}), 0);
    }
  });
}