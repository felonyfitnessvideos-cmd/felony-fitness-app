/**
 * @file AuthContext.jsx
 * @description
 * Provides a React Context wrapper around the Supabase authentication client
 * and exposes a small, stable surface for the rest of the application:
 *  - session: the Supabase session object or null
 *  - user: the Supabase user object or null
 *  - loading: boolean flag while session state is being resolved
 *
 * Responsibilities & contracts:
 * - Initialize the session on first mount using `supabase.auth.getSession()`.
 * - Subscribe to Supabase auth state changes and surface them via context.
 * - Never throw — errors while reading session are logged and result in an
 *   empty session/user state so the app can still render and present auth
 *   flows to the user.
 *
 * Notes / Edge cases:
 * - Supabase emits multiple events (INITIAL_SESSION, SIGNED_IN, SIGNED_OUT,
 *   TOKEN_REFRESHED). We normalize these into the `session`/`user` values.
 * - To avoid synchronous cleanup issues when Supabase calls the callback from
 *   an internal event, we defer some state updates using setTimeout
 *   (microtask/macrotask separation) — this prevents accidental synchronous
 *   access to now-stale closures.
 *
 * Export:
 * - AuthProvider({children}) — React provider component
 * - useAuth() — hook returning { session, user, loading }
 *
 * TODO (coderabbit): verify whether additional user metadata (profiles)
 * should be eagerly loaded here to reduce duplicate fetches across pages.
 */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

/**
 * Provides authentication state to descendants and supplies a stable { session, user, loading } surface via AuthContext.
 *
 * The component initializes and listens for auth state changes, updates context state accordingly, and renders its children only after the initial auth check completes.
 * @param {Object} props
 * @param {import('react').ReactNode} props.children - Child elements to render once the provider has finished the initial loading phase.
 * @returns {import('react').JSX.Element} The AuthContext provider element that wraps the application and conditionally renders children.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Check for an initial session
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        // If there's an error reading session, clear any partial state and continue.
        console.debug('AuthProvider: getSession error', err?.message ?? err);
        if (!mounted) return;
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
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
      mounted = false;
      try {
        if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
      } catch (e) {
        console.debug('AuthProvider: failed to unsubscribe', e);
      }
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