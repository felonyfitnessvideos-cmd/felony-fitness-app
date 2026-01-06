import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.warn('Error initializing auth session:', error);
        if (!mounted) return;
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setLoading(false);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const value = { session, user, loading };

  return (
    <AuthContext.Provider value={value}>
      <div style={{ height: '100%' }}>
        {!loading && children}
      </div>
    </AuthContext.Provider>
  );
}