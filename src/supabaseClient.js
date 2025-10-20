import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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
if (typeof window !== 'undefined' && supabase && supabase.auth) {
	supabase.auth.onAuthStateChange((event) => {
		if (event === 'TOKEN_REFRESH_FAILED' || event === 'TOKEN_REFRESH_FAILED_ERROR') {
			console.warn('supabaseClient: token refresh failed, clearing persisted auth and signing out');
			try {
				localStorage.removeItem('supabase.auth.token');
			} catch (err) {
				// ignore
			}
			supabase.auth.signOut().catch(() => {});
		}
	});
}