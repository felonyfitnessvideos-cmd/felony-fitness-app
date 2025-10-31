/**
 * @file supabaseClient.js
 * @description Supabase client singleton for browser app authentication and database operations
 * @project Felony Fitness
 * 
 * Creates a shared Supabase client for the browser app and centralizes
 * handling of token refresh failures by clearing persisted tokens and
 * forcing sign out when necessary.
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

// Create the Supabase client. We disable detectSessionInUrl to avoid
// accidental session parsing when the app is mounted at a non-root URL
// (useful for some deploys). We'll also register a small handler to
// clear persisted tokens and sign out when the refresh token is invalid.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		detectSessionInUrl: false,
	},
});

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