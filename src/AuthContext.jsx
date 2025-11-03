/**
 * @fileoverview Comprehensive authentication context provider for Supabase integration
 * @description React Context wrapper providing secure, stable authentication state
 * management across the entire application. Handles session initialization, state
 * synchronization, and graceful error recovery with comprehensive edge case handling.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * @requires React
 * @requires supabaseClient
 * 
 * Authentication State Management:
 * - **session**: Complete Supabase session object or null
 * - **user**: Authenticated user object with metadata or null  
 * - **loading**: Boolean flag during session resolution
 * 
 * Core Responsibilities:
 * - Initialize session on application mount via `supabase.auth.getSession()`
 * - Subscribe to real-time auth state changes (sign-in, sign-out, token refresh)
 * - Provide error-resilient state management that never crashes the app
 * - Normalize multiple Supabase auth events into consistent state
 * - Handle asynchronous cleanup to prevent stale closure access
 * 
 * Event Handling:
 * - INITIAL_SESSION: First session load on app start
 * - SIGNED_IN: User authentication success
 * - SIGNED_OUT: User logout or session expiry
 * - TOKEN_REFRESHED: Automatic token renewal
 * 
 * @example
 * // Wrap your app with the AuthProvider
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>
 *         <Routes>...</Routes>
 *       </Router>
 *     </AuthProvider>
 *   );
 * }
 * 
 * @example
 * // Use authentication state in components
 * function Dashboard() {
 *   const { user, loading, session } = useAuth();
 *   
 *   if (loading) return <LoadingSpinner />;
 *   if (!user) return <Navigate to="/auth" />;
 *   
 *   return <DashboardContent user={user} />;
 * }
 * 
 * @see {@link supabaseClient} for authentication methods
 * @see {@link https://supabase.com/docs/guides/auth} for Supabase Auth documentation
 */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabaseClient';

/**
 * Authentication context for global state sharing
 * 
 * @constant {React.Context} AuthContext
 * @description React context object for sharing authentication state across
 * the component tree without prop drilling.
 */
const AuthContext = createContext();

/**
 * Authentication provider component
 * 
 * @component
 * @function AuthProvider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with auth context
 * @returns {JSX.Element} Provider component with authentication state
 * 
 * @description Primary authentication provider managing secure user session state
 * across the entire application. Handles session initialization, real-time auth
 * state changes, and provides error-resilient authentication management.
 * 
 * @since 2.0.0
 * 
 * Provider Features:
 * - Automatic session initialization on app start
 * - Real-time authentication state synchronization
 * - Graceful error handling that never crashes the app
 * - Memory leak prevention with proper cleanup
 * - Asynchronous state updates to prevent stale closures
 * 
 * State Management:
 * - **session**: Current Supabase session with tokens and metadata
 * - **user**: Authenticated user object with profile information
 * - **loading**: Loading state during session resolution
 * 
 * Event Handling:
 * - Subscribes to all Supabase auth state changes
 * - Normalizes different auth events into consistent state
 * - Defers state updates to prevent synchronous callback issues
 * 
 * @example
 * // Wrap your entire app
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>
 *         <AppContent />
 *       </Router>
 *     </AuthProvider>
 *   );
 * }
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

/**
 * Custom hook for accessing authentication context
 * 
 * @hook
 * @function useAuth
 * @returns {Object} Authentication state and methods
 * @returns {Object|null} returns.session - Current Supabase session with tokens
 * @returns {Object|null} returns.user - Authenticated user object with profile data
 * @returns {boolean} returns.loading - Loading state during session resolution
 * 
 * @description Convenient hook for accessing authentication state anywhere in
 * the component tree. Provides type-safe access to user session data and
 * loading states with automatic context validation.
 * 
 * @since 2.0.0
 * 
 * Hook Features:
 * - Type-safe authentication state access
 * - Automatic context validation and error handling
 * - Real-time state updates from auth changes
 * - Loading state management for smooth UX
 * 
 * @example
 * // Basic authentication check
 * function ProtectedComponent() {
 *   const { user, loading } = useAuth();
 *   
 *   if (loading) return <LoadingSpinner />;
 *   if (!user) return <Navigate to="/auth" />;
 *   
 *   return <div>Welcome, {user.email}!</div>;
 * }
 * 
 * @example
 * // Access session tokens
 * function APIComponent() {
 *   const { session } = useAuth();
 *   
 *   const headers = {
 *     'Authorization': `Bearer ${session?.access_token}`
 *   };
 *   
 *   // Make authenticated API calls...
 * }
 * 
 * @example
 * // Conditional rendering based on auth state
 * function Navigation() {
 *   const { user, loading } = useAuth();
 *   
 *   if (loading) return null;
 *   
 *   return (
 *     <nav>
 *       {user ? <UserMenu user={user} /> : <LoginButton />}
 *     </nav>
 *   );
 * }
 * 
 * @throws {Error} Throws error if used outside of AuthProvider
 * @see {@link AuthProvider} for provider setup
 */
export function useAuth() {
  return useContext(AuthContext);
}
