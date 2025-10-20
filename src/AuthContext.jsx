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
    // Supabase emits events such as: INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
    // Listen for SIGNED_OUT to detect when the session is no longer available.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.warn('AuthProvider: signed out (session cleared)');
        // Avoid calling Supabase API methods synchronously inside this callback.
        // If additional cleanup is required, defer it to the next macrotask.
        setTimeout(() => {
          setSession(null);
          setUser(null);
          setLoading(false);
        }, 0);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

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
