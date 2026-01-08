import { createContext } from 'react';
import type { AuthUser, Session } from '@supabase/supabase-js';

/**
 * Authentication context value structure
 */
interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Authentication context for passing auth state through the app
 */
export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
});