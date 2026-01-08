import { useContext } from 'react';
import { AuthContext } from './authContext';
import type { AuthContextValue } from './authContext';

/**
 * Hook to access authentication context
 * @returns {AuthContextValue} Auth context with session, user, and loading state
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
