/**
 * AuthContext
 * Provides React context for Supabase authentication state across the app.
 * Exposes `session`, `user`, and `loading` so components can react to auth changes.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an initial session
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        // If there's an error reading session, clear any partial state and continue.
        console.debug('AuthProvider: getSession error', err?.message ?? err);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();

    // Set up a listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle token refresh failures explicitly: sign the user out so they can re-authenticate.
        // Supabase may emit a TOKEN_REFRESH_FAILED or similar event when refresh token is invalid.
        if (event === 'TOKEN_REFRESH_FAILED' || event === 'TOKEN_REFRESHED_FAILED') {
          console.warn('AuthProvider: token refresh failed, signing out');
          // Best-effort sign out to clear any invalid client-side session state.
          supabase.auth.signOut().catch(() => {});
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup the subscription on component unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
  };

  // --- START: FIX ---
  // This wrapper div repairs the height: 100% chain that the AuthProvider
  // was breaking, allowing the main app layout to work as intended.
  return (
    <AuthContext.Provider value={value}>
      <div style={{ height: '100%' }}>
        {!loading && children}
      </div>
    </AuthContext.Provider>
  );
  // --- END: FIX ---
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}
